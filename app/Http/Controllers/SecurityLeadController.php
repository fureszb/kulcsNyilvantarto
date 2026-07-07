<?php

namespace App\Http\Controllers;

use App\Jobs\SendPushJob;
use App\Models\ActivityLog;
use App\Models\DirectorLeadGoal;
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

        $reports = SecurityDailyReport::with('locations:id,name')
            ->whereHas('locations', fn ($q) => $q->whereIn('locations.id', $locationIds))
            ->orderByDesc('report_date')->orderByDesc('id')
            ->paginate(30);

        return Inertia::render('Security/Index', [
            'reports'         => $reports,
            'user'            => $user,
            'isAdmin'         => false,
            'canCreate'       => false,
            'groupByLocation' => true,
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

    public function team(): Response
    {
        $user = Auth::guard('tenant')->user();
        $managedLocationIds = $user->managedLocations()->pluck('locations.id');

        $workerUsers = TenantUser::where('role', 'user')->where('is_active', true)
            ->whereHas('workLocations', fn ($w) => $w->whereIn('locations.id', $managedLocationIds))
            ->orderBy('name')->get(['id', 'name', 'role']);

        // A PM egyetlen irodaházhoz tartozik (users.location_id) — ugyanaz az
        // oszlop, mint a dolgozóké, csak role='property_manager' mellett.
        $pmUsers = TenantUser::where('role', 'property_manager')->where('is_active', true)
            ->whereHas('workLocations', fn ($w) => $w->whereIn('locations.id', $managedLocationIds))
            ->orderBy('name')->get(['id', 'name', 'role']);

        $leadLocations = $user->managedLocations()->orderBy('name')->get(['locations.id', 'locations.name']);

        $availableWorkers = TenantUser::where('role', 'user')->where('is_active', true)
            ->orderBy('name')->get(['id', 'name']);
        $availablePms = TenantUser::where('role', 'property_manager')->where('is_active', true)
            ->orderBy('name')->get(['id', 'name']);

        return Inertia::render('SecurityLead/Team', [
            'workerUsers'      => $workerUsers,
            'pmUsers'          => $pmUsers,
            'leadLocations'    => $leadLocations,
            'availableWorkers' => $availableWorkers,
            'availablePms'     => $availablePms,
        ]);
    }

    /** A megadott irodaház(ak)at kizárólag a hívó biztonsági vezető saját
     *  irodaházaira szűkítjük — máséhoz nem nyúlhat. */
    private function ownLocationIds(TenantUser $lead, array $requestedIds): array
    {
        $ownIds = $lead->managedLocations()->pluck('locations.id')->all();
        return array_values(array_intersect($requestedIds, $ownIds));
    }

    public function addTeamWorker(Request $request): RedirectResponse
    {
        $request->validate([
            'user_id'     => 'required|integer',
            'location_id' => 'required|integer',
        ]);

        $lead = Auth::guard('tenant')->user();
        $locationIds = $this->ownLocationIds($lead, [(int) $request->location_id]);
        abort_if(empty($locationIds), 403);

        $worker = TenantUser::where('role', 'user')->where('is_active', true)->findOrFail($request->user_id);
        $worker->update(['location_id' => $locationIds[0]]);

        return back()->with('success', 'Dolgozó hozzáadva a csapathoz.');
    }

    public function removeTeamWorker(TenantUser $user): RedirectResponse
    {
        $lead = Auth::guard('tenant')->user();
        $ownLocationIds = $lead->managedLocations()->pluck('id')->all();
        if (in_array($user->location_id, $ownLocationIds, true)) {
            $user->update(['location_id' => null]);
        }

        return back()->with('success', 'Dolgozó eltávolítva a csapatból.');
    }

    public function setTeamPm(Request $request): RedirectResponse
    {
        $request->validate([
            'user_id'     => 'required|integer',
            'location_id' => 'required|integer',
        ]);

        $lead = Auth::guard('tenant')->user();
        $locationIds = $this->ownLocationIds($lead, [(int) $request->location_id]);
        abort_if(empty($locationIds), 403);

        $pm = TenantUser::where('role', 'property_manager')->where('is_active', true)->findOrFail($request->user_id);
        // Egy irodaháznak csak egy PM-je lehet (1:1) — ha valaki más már ott van, levesszük onnan.
        TenantUser::where('role', 'property_manager')->where('location_id', $locationIds[0])->update(['location_id' => null]);
        $pm->update(['location_id' => $locationIds[0]]);

        return back()->with('success', 'Property Manager hozzárendelve.');
    }

    public function removeTeamPm(TenantUser $user): RedirectResponse
    {
        $lead = Auth::guard('tenant')->user();
        $ownLocationIds = $lead->managedLocations()->pluck('id')->all();
        if (in_array($user->location_id, $ownLocationIds, true)) {
            $user->update(['location_id' => null]);
        }

        return back()->with('success', 'Property Manager eltávolítva.');
    }
}
