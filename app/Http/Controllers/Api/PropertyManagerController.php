<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Api\CheckResource;
use App\Http\Resources\Api\SecurityDailyReportResource;
use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\SecurityDailyReport;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use App\Services\WorkerCompletionStatsService;
use Illuminate\Http\Request;

class PropertyManagerController extends Controller
{
    public function __construct(private WorkerCompletionStatsService $statsService)
    {
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isPropertyManager(), 403);

        $assignedLocation = $user->workLocations()->with('securityLead:id,name')->first();

        $workersQuery = TenantUser::where('role', 'user')->where('is_active', true)->orderBy('name');
        if ($assignedLocation) {
            $workersQuery->where('location_id', $assignedLocation->id);
        } else {
            $workersQuery->whereRaw('0 = 1');
        }
        $workers = $workersQuery->get();

        $trainings = Training::where('is_active', true)->get();
        $workerIds = $workers->pluck('id');
        $allTrainResults = TrainingResult::whereIn('user_id', $workerIds)->get()->groupBy('user_id');
        $allExamResults = ExamResult::whereIn('user_id', $workerIds)->get()->groupBy('user_id');

        $workerStats = $workers->map(function ($w) use ($trainings, $allTrainResults, $allExamResults) {
            $stats = $this->statsService->buildStats($w, $trainings, $allTrainResults, $allExamResults);
            return [
                'worker'       => ['id' => $w->id, 'name' => $w->name],
                'training_pct' => $stats['training_pct'],
                'location_pct' => $stats['location_pct'],
                'prof_pct'     => $stats['prof_pct'],
            ];
        })->values();

        return response()->json([
            'workerStats'      => $workerStats,
            'assignedLocation' => $assignedLocation ? [
                'id'                  => $assignedLocation->id,
                'name'                => $assignedLocation->name,
                'security_lead_name'  => $assignedLocation->securityLead?->name,
            ] : null,
        ]);
    }

    public function worker(Request $request, TenantUser $user)
    {
        abort_if($user->role !== 'user', 404);

        $authUser = $request->user();
        if ($authUser->isSecurityLead()) {
            $managedLocationIds = $authUser->managedLocations()->pluck('id');
            $worksHere = $user->workLocations()->whereIn('locations.id', $managedLocationIds)->exists();
            abort_unless($worksHere, 403);
        } elseif ($authUser->isPropertyManager()) {
            abort_unless($authUser->location_id && $user->location_id === $authUser->location_id, 403);
        } else {
            abort_unless($authUser->canManage(), 403);
        }

        $trainings = Training::where('is_active', true)->withCount('steps')->orderBy('sort_order')->get();
        $trainingResults = TrainingResult::where('user_id', $user->id)->get();

        $trainingRows = $trainings->map(function ($t) use ($trainingResults) {
            $done = $trainingResults->where('training_id', $t->id)->sortByDesc('completed_at')->first();
            return [
                'training' => [
                    'id' => $t->id, 'title' => $t->title, 'description' => $t->description,
                    'is_active' => $t->is_active, 'sort_order' => $t->sort_order,
                    'is_location_knowledge' => $t->is_location_knowledge, 'steps_count' => $t->steps_count,
                ],
                'training_done'  => $done !== null,
                'completed_at'   => optional($done?->completed_at)->toIso8601String(),
            ];
        })->values();

        $exams = Exam::where('is_active', true)->withCount('steps')->orderBy('sort_order')->get();
        $examResults = ExamResult::where('user_id', $user->id)->with('exam')->get();

        $examRows = $exams->map(function ($e) use ($examResults) {
            $results = $examResults->where('exam_id', $e->id)->sortByDesc('completed_at');
            $lastExam = $results->first();
            return [
                'exam' => [
                    'id' => $e->id, 'title' => $e->title, 'description' => $e->description,
                    'is_active' => $e->is_active, 'sort_order' => $e->sort_order, 'steps_count' => $e->steps_count,
                ],
                'exam_done'  => $lastExam !== null,
                'last_exam'  => $lastExam ? [
                    'id'             => $lastExam->id,
                    'exam_title'     => $e->title,
                    'score'          => $lastExam->first_try_count,
                    'total'          => $lastExam->total_steps,
                    'score_percent'  => $lastExam->scorePercent(),
                    'completed_at'   => optional($lastExam->completed_at)->toIso8601String(),
                    'tab_violations' => $lastExam->tab_violations ?? 0,
                ] : null,
                'exam_count' => $results->count(),
            ];
        })->values();

        $stats = $this->statsService->buildStats($user, $trainings);

        $recentActivity = ActivityLog::where('user_id', $user->id)
            ->orderByDesc('occurred_at')
            ->limit(20)
            ->get()
            ->map(fn ($a) => [
                'event_type'  => $a->event_type,
                'description' => $a->description,
                'occurred_at' => optional($a->occurred_at)->toIso8601String(),
            ])->values();

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name],
            'training_rows' => $trainingRows,
            'exam_rows'     => $examRows,
            'stats'         => [
                'worker'       => ['id' => $user->id, 'name' => $user->name],
                'training_pct' => $stats['training_pct'],
                'location_pct' => $stats['location_pct'],
                'prof_pct'     => $stats['prof_pct'],
            ],
            'recent_activity' => $recentActivity,
        ]);
    }

    public function securityReports(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isPropertyManager(), 403);

        $query = SecurityDailyReport::with(['locations:id,name', 'shares'])->orderByDesc('report_date')->orderByDesc('id');

        if ($request->filled('date_from')) {
            $query->whereDate('report_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('report_date', '<=', $request->input('date_to'));
        }

        $reports = $query->paginate(30);
        $items = collect($reports->items());

        if ($request->boolean('incidents_only')) {
            $items = $items->filter(fn ($r) => !empty($r->incidents))->values();
        }

        return SecurityDailyReportResource::collection($items);
    }

    public function checks(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isPropertyManager(), 403);

        $query = Check::with(['location', 'checkItems'])->orderByDesc('created_at');

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $checks = $query->paginate(25);

        return CheckResource::collection($checks->items());
    }
}
