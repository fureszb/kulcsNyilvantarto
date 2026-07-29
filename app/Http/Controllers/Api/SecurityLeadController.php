<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuildsWeeklyTrend;
use App\Http\Controllers\Api\Concerns\FormatsInitials;
use App\Http\Resources\Api\ItemGroupResource;
use App\Http\Resources\Api\ItemResource;
use App\Http\Resources\Api\LocationResource;
use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\CheckItem;
use App\Models\DirectorLeadGoal;
use App\Models\Document;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Item;
use App\Models\ItemGroup;
use App\Models\Location;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use App\Models\VezenylesSchedule;
use App\Services\PerformanceStatsService;
use App\Services\WorkerCompletionStatsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SecurityLeadController extends Controller
{
    use BuildsWeeklyTrend;
    use FormatsInitials;

    /** Ugyanaz a lista, mint `DirectorController::ISSUE_DOCUMENT_TYPES` — azok a
     *  dokumentum-típusok, amik rendellenességet rögzítenek, nem rutin átadás/kiadást. */
    private const ISSUE_DOCUMENT_TYPES = [
        'feljegyzeses_jegyzokonyv', 'karfelveteli_jegyzokonyv', 'talalt_targy_jegyzokonyv', 'robbantasi_fenyegetes',
    ];

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

        $locationIds = $user->managedLocations()->pluck('locations.id');

        $teamWorkers = TenantUser::where('role', 'user')->where('is_active', true)
            ->whereHas('workLocations', fn ($q) => $q->whereIn('locations.id', $locationIds))
            ->orderBy('name')->get();

        // "Bent van"/"Nincs bent" korábban az NFC self-report (`is_present`) alapján dőlt el,
        // ami megbízhatatlan (elfelejtett be/kilépés-koppintás) — most a napi Vezenylés-beosztás
        // a forrás: aki mára konkrét óraszámmal be van írva szolgálatba, az számít "bent"-nek.
        // Ugyanaz az adatforrás (`scheduledEntriesForDate`), mint a webes "Ki van bent" oldalé
        // (`PresenceController`) — az óraszám is megjelenik, nem csak az igen/nem.
        $scheduledEntries = VezenylesSchedule::scheduledEntriesForDate($now);

        $leadData['team_presence'] = $teamWorkers->map(function (TenantUser $w) use ($scheduledEntries) {
            $entry = $scheduledEntries->get($w->id);
            return [
                'initials'     => $this->initialsOf($w->name),
                'name'         => $w->name,
                'status_label' => $entry ? "Szolgálatban ma — {$entry->value} óra" : 'Nincs beosztva mára',
                'is_present'   => $entry !== null,
            ];
        })->values();

        $todayChecks = Check::whereIn('location_id', $locationIds)
            ->whereDate('created_at', today())
            ->with('checkItems')
            ->get();
        $totalItems = $todayChecks->sum('total_count');
        $leadData['checklist_completion_pct'] = $totalItems > 0
            ? (int) round($todayChecks->sum('checked_count') / $totalItems * 100)
            : 0;

        // Nincs "elvárt checklist-ütemezés" fogalom a rendszerben (a `checks` tábla csak a
        // ténylegesen beküldött ellenőrzéseket tárolja, konkrét elvárt időpont nélkül) — ez a
        // legközelebbi valós jelzés: mely felügyelt irodaházaknál nem történt MÉG egyetlen
        // ellenőrzés sem a mai napon.
        $leadData['not_checked_today_locations'] = Location::whereIn('id', $locationIds)
            ->whereDoesntHave('checks', fn ($q) => $q->whereDate('created_at', today()))
            ->orderBy('name')
            ->pluck('name')
            ->values();

        $presenceCounts = $this->countsByDateMap(
            ActivityLog::where('event_type', 'nfc.entry')->whereIn('metadata->location_id', $locationIds),
            'occurred_at',
        );
        $leadData['presence_trend'] = $this->buildWeeklyTrend('Heti jelenlét trend', $presenceCounts, higherIsBetter: true);

        $teamUserIds = $teamWorkers->pluck('id');
        $pendingReportsQuery = Document::whereIn('created_by_user_id', $teamUserIds)
            ->whereIn('document_type', self::ISSUE_DOCUMENT_TYPES)
            ->whereNull('reviewed_at');

        $leadData['pending_approvals_count'] = (clone $pendingReportsQuery)->count();
        $leadData['pending_reports'] = (clone $pendingReportsQuery)->with(['location:id,name', 'createdBy:id,name'])
            ->latest()->take(5)->get()
            ->map(fn (Document $d) => [
                'id'            => $d->id,
                'title'         => $d->typeLabel(),
                'context_label' => ($d->location->name ?? 'Ismeretlen helyszín') . ' — ' . $d->created_at->format('Y.m.d. H:i'),
                'detail_label'  => ($d->createdBy->name ?? 'Ismeretlen') . ' rögzítette, jóváhagyásra vár.',
                'severity'      => $d->document_type === 'robbantasi_fenyegetes' ? 'high' : 'low',
            ])->values();

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

    /** Biztonsági vezető csak a saját felügyelt irodaházait szerkesztheti (ugyanaz a szabály, mint a webes Admin\Item(Group)Controller-en). */
    private function authorizeLocation(Request $request, Location $location): void
    {
        $user = $request->user();
        abort_unless($user->isSecurityLead(), 403);
        abort_unless($user->managedLocations()->where('locations.id', $location->id)->exists(), 403);
    }

    public function storeGroup(Request $request, Location $location)
    {
        $this->authorizeLocation($request, $location);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $group = $location->groups()->create([
            'name'       => $validated['name'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json(new ItemGroupResource($group->load('items')), 201);
    }

    public function updateGroup(Request $request, Location $location, ItemGroup $group)
    {
        $this->authorizeLocation($request, $location);
        abort_unless($group->location_id === $location->id, 404);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'integer|min:0|max:9999',
        ]);

        $group->update($validated);

        return response()->json(new ItemGroupResource($group->load('items')));
    }

    public function destroyGroup(Request $request, Location $location, ItemGroup $group)
    {
        $this->authorizeLocation($request, $location);
        abort_unless($group->location_id === $location->id, 404);

        $group->allItems()->update(['group_id' => null]);
        $group->delete();

        return response()->noContent();
    }

    public function storeItem(Request $request, Location $location)
    {
        $this->authorizeLocation($request, $location);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'type'       => 'required|in:key,card',
            'sort_order' => 'integer|min:0|max:9999',
            'group_id'   => 'nullable|integer|exists:tenant.item_groups,id',
        ]);

        $item = $location->allItems()->create($validated + ['sort_order' => $validated['sort_order'] ?? 0]);

        return response()->json(new ItemResource($item), 201);
    }

    public function updateItem(Request $request, Location $location, Item $item)
    {
        $this->authorizeLocation($request, $location);
        abort_unless($item->location_id === $location->id, 404);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'type'       => 'required|in:key,card',
            'sort_order' => 'integer|min:0|max:9999',
            'group_id'   => 'nullable|integer|exists:tenant.item_groups,id',
            'is_active'  => 'boolean',
        ]);

        $item->update($validated);

        return response()->json(new ItemResource($item));
    }

    public function destroyItem(Request $request, Location $location, Item $item)
    {
        $this->authorizeLocation($request, $location);
        abort_unless($item->location_id === $location->id, 404);

        CheckItem::where('item_id', $item->id)->delete();
        $item->delete();

        return response()->noContent();
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
