<?php

namespace App\Http\Controllers;

use App\Jobs\SendPushJob;
use App\Models\ActivityLog;
use App\Models\DirectorLeadGoal;
use App\Models\DirectorMessage;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\SecurityDailyReport;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use App\Services\PerformanceStatsService;
use App\Services\WorkerCompletionStatsService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SecurityLeadController extends Controller
{
    public function __construct(private WorkerCompletionStatsService $statsService)
    {
    }

    public function dashboard(PerformanceStatsService $stats): Response
    {
        $user = Auth::guard('tenant')->user();
        $now  = Carbon::now();

        $leadData = $stats->leadStats($user);

        $goals = DirectorLeadGoal::where('lead_id', $user->id)
            ->where('period_type', 'monthly')
            ->where('year', $now->year)
            ->where('period', $now->month)
            ->get();

        $overallGoal = $goals->first(fn ($g) => $g->location_id === null);
        $leadData['goal'] = $overallGoal ? [
            'target_completion_pct' => $overallGoal->target_completion_pct,
            'target_turnover_pct'   => $overallGoal->target_turnover_pct,
        ] : null;

        $locationGoals = $goals->whereNotNull('location_id')->keyBy('location_id');
        $leadData['locations'] = array_map(function ($loc) use ($locationGoals) {
            $g = $locationGoals->get($loc['location_id']);
            $loc['goal'] = $g ? [
                'target_completion_pct' => $g->target_completion_pct,
                'target_turnover_pct'   => $g->target_turnover_pct,
            ] : null;
            return $loc;
        }, $leadData['locations']);

        return Inertia::render('SecurityLead/Dashboard', [
            'welcomeName'   => $user->name,
            'lead'          => $leadData,
            'currentPeriod' => ['year' => $now->year, 'month' => $now->month],
        ]);
    }

    public function workers(): Response
    {
        $user = Auth::guard('tenant')->user();
        $locationIds = $user->managedLocations()->pluck('locations.id');

        $workers = TenantUser::where('role', 'user')->where('is_active', true)
            ->whereHas('workLocations', fn ($q) => $q->whereIn('locations.id', $locationIds))
            ->orderBy('name')->get();

        $trainings = Training::where('is_active', true)->get();
        $workerIds = $workers->pluck('id');
        $allTrainResults = TrainingResult::whereIn('user_id', $workerIds)->get()->groupBy('user_id');
        $allExamResults  = ExamResult::whereIn('user_id', $workerIds)->get()->groupBy('user_id');

        $workerStats = $workers->map(
            fn ($w) => $this->statsService->buildStats($w, $trainings, $allTrainResults, $allExamResults)
        );

        return Inertia::render('SecurityLead/Workers', ['workerStats' => $workerStats]);
    }

    public function nudgeExam(TenantUser $user, Exam $exam): RedirectResponse
    {
        $lead = Auth::guard('tenant')->user();
        $locationIds = $lead->managedLocations()->pluck('locations.id');
        abort_unless($user->workLocations()->whereIn('locations.id', $locationIds)->exists(), 403);

        $tenant = app('tenant');
        SendPushJob::dispatch(
            tenantSlug: $tenant->slug,
            userIds: [$user->id],
            title: 'Vizsga emlékeztető',
            body: "{$lead->name} kéri, hogy írd meg: {$exam->name}",
            url: route('exam.show', $exam),
            tag: 'exam-nudge-' . $exam->id,
        );

        ActivityLog::record('exam.nudge', $lead, "Vizsga-emlékeztető küldve: {$exam->name} → {$user->name}", [
            'target_user_id' => $user->id,
            'exam_id'        => $exam->id,
        ]);

        return back()->with('success', 'Emlékeztető elküldve.');
    }

    public function dailyReports(): Response
    {
        $user = Auth::guard('tenant')->user();
        $locationIds = $user->managedLocations()->pluck('locations.id');

        $reports = SecurityDailyReport::whereHas('locations', fn ($q) => $q->whereIn('locations.id', $locationIds))
            ->orderByDesc('report_date')->orderByDesc('id')
            ->paginate(30);

        return Inertia::render('Security/Index', [
            'reports'   => $reports,
            'user'      => $user,
            'isAdmin'   => false,
            'canCreate' => true,
        ]);
    }

    public function inventory(): Response
    {
        $user = Auth::guard('tenant')->user();
        $locations = $user->managedLocations()->orderBy('name')->get(['locations.id', 'locations.name']);

        $locations->each(function ($loc) {
            $loc->setRelation('items', $loc->allItems()->with('group')->get());
            $loc->setRelation('groups', $loc->groups()->with('items')->get());
        });

        return Inertia::render('SecurityLead/Inventory', ['locations' => $locations]);
    }

    public function messages(): Response
    {
        $user = Auth::guard('tenant')->user();

        $inbox = DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                $sender = $m->from_user_id
                    ? TenantUser::find($m->from_user_id)
                    : null;
                return [
                    'id'         => $m->id,
                    'content'    => $m->content,
                    'from_name'  => $sender?->name ?? 'Igazgató',
                    'created_at' => $m->created_at->format('Y.m.d H:i'),
                    'is_new'     => is_null($m->read_at),
                ];
            });

        // Olvasottnak jelöljük
        DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', false)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $directors = $user->directors()->orderBy('name')->get(['users.id', 'users.name'])
            ->map(fn ($d) => ['id' => $d->id, 'name' => $d->name]);

        $managedLocationIds = $user->managedLocations()->pluck('locations.id');
        $teamUsers = TenantUser::where('is_active', true)
            ->where('id', '!=', $user->id)
            ->where(function ($q) use ($managedLocationIds) {
                $q->where('role', 'property_manager')
                  ->orWhereHas('workLocations', fn ($w) => $w->whereIn('locations.id', $managedLocationIds));
            })
            ->orderBy('name')->get(['id', 'name', 'role']);

        return Inertia::render('SecurityLead/Messages', [
            'welcomeName' => $user->name,
            'messages'    => $inbox,
            'directors'   => $directors,
            'teamUsers'   => $teamUsers,
        ]);
    }

    public function submitFeedback(Request $request): RedirectResponse
    {
        $request->validate([
            'director_id' => 'required|integer',
            'content'     => 'required|string|max:2000',
        ]);

        $user = Auth::guard('tenant')->user();

        // Ellenőrzés: csak a saját igazgatójának küldhet
        $isAssigned = $user->directors()->where('users.id', $request->director_id)->exists();
        if (!$isAssigned && $user->role !== 'admin') {
            abort(403);
        }

        DirectorMessage::create([
            'from_user_id' => $user->id, // DB-ben tároljuk, de soha nem exponáljuk
            'to_user_id'   => $request->director_id,
            'content'      => $request->content,
            'is_anonymous' => true,
        ]);

        return back()->with('success', 'Visszajelzés névtelenül elküldve.');
    }
}
