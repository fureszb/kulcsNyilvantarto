<?php

namespace App\Http\Controllers\Api;

use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\Location;
use App\Models\PmMessage;
use App\Models\Setting;
use App\Models\TenantUser;
use App\Models\TrainingResult;
use App\Models\VezenylesEmployee;
use App\Models\VezenylesSchedule;
use App\Services\NfcChecklistService;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __construct(private NfcChecklistService $checklistService)
    {
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        $checksToday = Check::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        $trainingsCompleted = TrainingResult::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        if ($user->isSecurityLead()) {
            $venueMode = 'buildings';
            $venues = $user->managedLocations()->where('is_active', true)
                ->withCount('items')->orderBy('name')->get()
                ->map(fn ($l) => $this->buildingVenue($l));
        } elseif ($user->role === 'user') {
            $venueMode = 'tenants';
            $myLocation = $user->workLocations;
            $venues = $myLocation
                ? $myLocation->groups()->withCount('items')->get()
                    ->map(fn ($g) => [
                        'id'                 => $g->id,
                        'name'               => $g->name,
                        'description'        => null,
                        'icon'               => null,
                        'logo_path'          => null,
                        'responsible_person' => null,
                        'email'              => null,
                        'items_count'        => $g->items_count,
                    ])
                : collect();
        } else {
            $venueMode = 'buildings';
            $venues = Location::where('is_active', true)
                ->withCount('items')
                ->orderBy('name')
                ->get()
                ->map(fn ($l) => $this->buildingVenue($l));
        }

        return response()->json([
            'checks_today'             => $checksToday,
            'trainings_completed'      => $trainingsCompleted,
            'venue_mode'               => $venueMode,
            'venues'                   => $venues->values(),
            'security_module_visible'  => Setting::get('security_module_visible', '1') === '1',
            'presence'                 => $this->presence($user),
            'recent_activity'          => $this->recentActivity($user),
            'unread_messages_count'    => $this->unreadMessagesCount($user),
            'message_previews'         => $this->messagePreviews($user),
            'today_schedule'           => $this->todaySchedule($user),
            'hours_worked_today'       => $this->hoursWorkedToday($user),
        ]);
    }

    /** "Napi áttekintés" kártya — a dolgozó saját `vezenyles_schedule` mai napi sorának
     *  numerikus (óraszám) értéke ("Ledolgozott óra" kártya). 0, ha nincs mára bejegyzés, vagy
     *  az X/?/+ jelölők egyike (nem óraszám). */
    private function hoursWorkedToday(TenantUser $user): float
    {
        $employee = VezenylesEmployee::where('user_id', $user->id)->first();
        if (!$employee) {
            return 0;
        }

        $today = today();
        $entry = VezenylesSchedule::where('employee_id', $employee->id)
            ->where('year', $today->year)
            ->where('month', $today->month)
            ->where('day', $today->day)
            ->first();

        return $entry && is_numeric($entry->value) ? (float) $entry->value : 0;
    }

    /** "Mai beosztásod" kártya — a dolgozó saját `vezenyles_schedule` sorából a mai napra, ha van hozzá rendelve vezénylési sor. Nincs kitalált/mock adat: `null`, ha nincs valós bejegyzés. */
    private function todaySchedule(TenantUser $user): ?array
    {
        $employee = VezenylesEmployee::where('user_id', $user->id)->first();
        if (!$employee) {
            return null;
        }

        $today = today();
        $entry = VezenylesSchedule::where('employee_id', $employee->id)
            ->where('year', $today->year)
            ->where('month', $today->month)
            ->where('day', $today->day)
            ->first();

        if (!$entry || !$entry->value) {
            return null;
        }

        return [
            'value_label' => $entry->value,
            'area_name'   => optional($employee->area)->name,
        ];
    }

    /** "Jelenlegi állapotod" kártya — két FÜGGETLEN jelzést ad: (1) `on_duty`/`schedule_label`
     *  — be van-e osztva ma szolgálatba a Vezenylés szerint (ugyanaz a forrás, mint a
     *  dashboard-jelvényeké/`todaySchedule()`-é), ez a "szolgálatban vagy" válasz; (2)
     *  `checked_count`/`total_count` — a user NFC-beléptetéssel engedélyezett telephelyeinek
     *  (`nfcLocations()`, NEM a "hol dolgozik" `location_id` — lásd `NfcChecklistService`) mai
     *  NFC-checkpoint-lefedettsége (hány pontot scanneltek be ma, bárki). A rendszer NEM
     *  beléptető/kiléptető kapu, ezért a kettő szándékosan külön dolog: lehetsz szolgálatban
     *  úgy is, hogy még egy checkpointot sem scanneltél be ma. */
    private function presence(TenantUser $user): array
    {
        $scheduleValue = VezenylesSchedule::todayValueForUser($user->id);
        $onDuty = $scheduleValue !== null && !in_array($scheduleValue, ['X', '?', '+'], true);

        $base = [
            'on_duty'        => $onDuty,
            'schedule_label' => $onDuty ? "{$scheduleValue} óra" : null,
        ];

        $locationNames = $this->checklistService->locationNamesForUser($user);
        if ($locationNames->isEmpty()) {
            return $base + ['has_location' => false, 'venue_name' => null, 'checked_count' => 0, 'total_count' => 0];
        }

        $points = $this->checklistService->pointsForUser($user);

        return $base + [
            'has_location'  => true,
            'venue_name'    => $locationNames->implode(', '),
            'checked_count' => count(array_filter($points, fn (array $p) => $p['scanned'])),
            'total_count'   => count($points),
        ];
    }

    /** "Legutóbbi aktivitás" lista — a valós `ActivityLog`-ból, a felhasználóra szűrve. A
     *  `description` már eleve emberi olvasásra kész szöveg (lásd `ActivityLog::record()`
     *  hívásait, pl. NfcAccessController "Belépés — {helyszín}"). */
    private function recentActivity(TenantUser $user, int $limit = 6): array
    {
        return ActivityLog::where('user_id', $user->id)
            ->orderByDesc('occurred_at')
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'description' => $log->description,
                'time_label'  => $log->occurred_at->isToday()
                    ? 'Ma, ' . $log->occurred_at->format('H:i')
                    : $log->occurred_at->translatedFormat('M j., H:i'),
                'kind' => match (true) {
                    str_contains($log->event_type, 'denied') => 'info',
                    str_ends_with($log->event_type, '.exit'), str_ends_with($log->event_type, 'zone_exit') => 'neutral',
                    default => 'success',
                },
            ])
            ->values()
            ->all();
    }

    /** A `messages_read_at` egy egyszerű, teljes-lista "utoljára megnyitva" időbélyeg (lásd
     *  `PmMessageController::index()` — NEM per-üzenet olvasottság), ezért az "olvasatlan" itt
     *  "az utolsó megnyitás óta érkezett" üzenetek száma. */
    private function unreadMessagesCount(TenantUser $user): int
    {
        $since = $user->messages_read_at ?? now()->subYears(50);

        return PmMessage::visibleTo($user->id)->where('created_at', '>', $since)->count();
    }

    private function messagePreviews(TenantUser $user, int $limit = 2): array
    {
        return PmMessage::visibleTo($user->id)
            ->orderByDesc('created_at')
            ->take($limit)
            ->get()
            ->map(fn (PmMessage $message) => [
                'initials'     => $this->initialsOf($message->sent_by_name ?? '?'),
                'sender_label' => $message->sent_by_name ?? 'Ismeretlen',
                'time_label'   => $message->created_at->isToday()
                    ? $message->created_at->format('H:i')
                    : $message->created_at->translatedFormat('M j.'),
                'snippet' => \Illuminate\Support\Str::limit($message->content, 80),
            ])
            ->values()
            ->all();
    }

    private function initialsOf(string $name): string
    {
        $parts = array_filter(explode(' ', trim($name)));
        $initials = collect($parts)->map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)))->take(2)->implode('');

        return $initials !== '' ? $initials : '?';
    }

    private function buildingVenue(Location $l): array
    {
        return [
            'id'                 => $l->id,
            'name'               => $l->name,
            'description'        => $l->description,
            'icon'               => $l->icon,
            'logo_path'          => $l->logo_path,
            'responsible_person' => $l->responsible_person,
            'email'              => $l->email,
            'items_count'        => $l->items_count,
        ];
    }
}
