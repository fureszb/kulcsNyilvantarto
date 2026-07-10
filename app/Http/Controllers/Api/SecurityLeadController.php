<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Api\ItemGroupResource;
use App\Http\Resources\Api\ItemResource;
use App\Http\Resources\Api\LocationResource;
use App\Models\DirectorLeadGoal;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use App\Services\PerformanceStatsService;
use App\Services\WorkerCompletionStatsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SecurityLeadController extends Controller
{
    public function __construct(private WorkerCompletionStatsService $statsService)
    {
    }

    public function dashboard(Request $request, PerformanceStatsService $stats)
    {
        $user = $request->user();
        abort_unless($user->isSecurityLead(), 403);
        $now = Carbon::now();

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

        return response()->json($leadData);
    }

    public function workers(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isSecurityLead(), 403);

        $locationIds = $user->managedLocations()->pluck('locations.id');

        $workers = TenantUser::where('role', 'user')->where('is_active', true)
            ->whereHas('workLocations', fn ($q) => $q->whereIn('locations.id', $locationIds))
            ->orderBy('name')->get();

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

        return response()->json($workerStats);
    }

    public function inventory(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isSecurityLead(), 403);

        $locations = $user->managedLocations()->orderBy('name')->get(['locations.id', 'locations.name', 'locations.description', 'locations.icon', 'locations.logo_path', 'locations.responsible_person', 'locations.email', 'locations.is_active', 'locations.security_lead_id']);

        $data = $locations->map(function ($loc) {
            return [
                'location'        => new LocationResource($loc),
                'groups'          => ItemGroupResource::collection($loc->groups()->with('items')->get()),
                'ungrouped_items' => ItemResource::collection($loc->items()->whereNull('group_id')->get()),
            ];
        })->values();

        return response()->json($data);
    }

    public function team(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isSecurityLead(), 403);

        $managedLocationIds = $user->managedLocations()->pluck('locations.id');

        $workerUsers = TenantUser::where('role', 'user')->where('is_active', true)
            ->whereHas('workLocations', fn ($w) => $w->whereIn('locations.id', $managedLocationIds))
            ->orderBy('name')->get(['id', 'name']);

        $pmUsers = TenantUser::where('role', 'property_manager')->where('is_active', true)
            ->whereHas('workLocations', fn ($w) => $w->whereIn('locations.id', $managedLocationIds))
            ->orderBy('name')->get(['id', 'name']);

        $leadLocations = $user->managedLocations()->orderBy('name')->get(['locations.id', 'locations.name', 'locations.description', 'locations.icon', 'locations.logo_path', 'locations.responsible_person', 'locations.email', 'locations.is_active', 'locations.security_lead_id']);

        $availableWorkers = TenantUser::where('role', 'user')->where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $availablePms = TenantUser::where('role', 'property_manager')->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'workerUsers'      => $workerUsers->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])->values(),
            'pmUsers'          => $pmUsers->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])->values(),
            'leadLocations'    => LocationResource::collection($leadLocations),
            'availableWorkers' => $availableWorkers->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])->values(),
            'availablePms'     => $availablePms->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])->values(),
        ]);
    }

    private function ownLocationIds(TenantUser $lead, array $requestedIds): array
    {
        $ownIds = $lead->managedLocations()->pluck('locations.id')->all();
        return array_values(array_intersect($requestedIds, $ownIds));
    }

    public function addTeamWorker(Request $request)
    {
        $lead = $request->user();
        abort_unless($lead->isSecurityLead(), 403);

        $data = $request->validate([
            'user_id'     => 'required|integer',
            'location_id' => 'required|integer',
        ]);

        $locationIds = $this->ownLocationIds($lead, [(int) $data['location_id']]);
        abort_if(empty($locationIds), 403);

        $worker = TenantUser::where('role', 'user')->where('is_active', true)->findOrFail($data['user_id']);
        $worker->update(['location_id' => $locationIds[0]]);

        return response()->noContent();
    }

    public function removeTeamWorker(Request $request, TenantUser $user)
    {
        $lead = $request->user();
        abort_unless($lead->isSecurityLead(), 403);

        $ownLocationIds = $lead->managedLocations()->pluck('id')->all();
        if (in_array($user->location_id, $ownLocationIds, true)) {
            $user->update(['location_id' => null]);
        }

        return response()->noContent();
    }

    public function setTeamPm(Request $request)
    {
        $lead = $request->user();
        abort_unless($lead->isSecurityLead(), 403);

        $data = $request->validate([
            'user_id'     => 'required|integer',
            'location_id' => 'required|integer',
        ]);

        $locationIds = $this->ownLocationIds($lead, [(int) $data['location_id']]);
        abort_if(empty($locationIds), 403);

        $pm = TenantUser::where('role', 'property_manager')->where('is_active', true)->findOrFail($data['user_id']);
        TenantUser::where('role', 'property_manager')->where('location_id', $locationIds[0])->update(['location_id' => null]);
        $pm->update(['location_id' => $locationIds[0]]);

        return response()->noContent();
    }

    public function removeTeamPm(Request $request, TenantUser $user)
    {
        $lead = $request->user();
        abort_unless($lead->isSecurityLead(), 403);

        $ownLocationIds = $lead->managedLocations()->pluck('id')->all();
        if (in_array($user->location_id, $ownLocationIds, true)) {
            $user->update(['location_id' => null]);
        }

        return response()->noContent();
    }
}
