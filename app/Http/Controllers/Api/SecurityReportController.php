<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Api\SecurityDailyReportResource;
use App\Mail\SecurityReportMail;
use App\Models\ActivityLog;
use App\Models\SecurityDailyReport;
use App\Models\SecurityReportShare;
use App\Models\Setting;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SecurityReportController extends Controller
{
    private function moduleVisibleFor(TenantUser $user): bool
    {
        if ($user->isAdmin() || $user->isPropertyManager()) {
            return true;
        }
        return Setting::get('security_module_visible', '1') === '1';
    }

    private function sectionValidation(): array
    {
        return [
            'report_date'     => 'required|date',
            'prepared_by'     => 'required|string|max:255',
            'taken_over_from' => 'required|string|max:255',
            'handover_time'   => 'nullable|string|max:10',
            'location_ids'    => 'required|array|min:1',
            'location_ids.*'  => 'integer|exists:tenant.locations,id',
            'cc_recipients'   => 'nullable|array',
            'share_user_ids'  => 'nullable|array',
            'share_user_ids.*'=> 'integer',
            'service_members'         => 'nullable|array',
            'previous_shift_members'  => 'nullable|array',
            'equipment'               => 'nullable|array',
            'inspectors'              => 'nullable|array',
            'patrols'                 => 'nullable|array',
            'incidents'               => 'nullable|array',
            'events'                  => 'nullable|array',
            'fire_alarms'             => 'nullable|array',
            'elevators'               => 'nullable|array',
            'maintenance'             => 'nullable|array',
        ];
    }

    private function validateSections(array $data): array
    {
        $errors = [];
        if (collect($data['service_members'] ?? [])->contains(fn ($r) => empty(trim($r['nev'] ?? '')))) {
            $errors['service_members'] = ['A Napi Szolgálat minden tagjának neve kötelező.'];
        }
        if (collect($data['inspectors'] ?? [])->contains(fn ($r) => empty(trim($r['neve'] ?? '')))) {
            $errors['inspectors'] = ['Az ellenőrzést végző személyek nevei kötelezők.'];
        }
        if (collect($data['patrols'] ?? [])->contains(fn ($r) => empty(trim($r['vagyonőr'] ?? '')))) {
            $errors['patrols'] = ['A járőrözési bejegyzések vagyonőr mezője kötelező.'];
        }
        return $errors;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $query = $user->isAdmin()
            ? SecurityDailyReport::query()
            : SecurityDailyReport::whereHas('shares', fn ($q) => $q->where('user_id', $user->id));

        $reports = $query->with(['locations:id,name', 'shares'])
            ->orderByDesc('report_date')->orderByDesc('id')
            ->paginate(30);

        return SecurityDailyReportResource::collection($reports->items());
    }

    public function show(Request $request, SecurityDailyReport $security)
    {
        $user = $request->user();

        abort_if(
            !$user->isAdmin()
                && !$user->isPropertyManager()
                && $user->id !== $security->created_by_user_id
                && !$security->shares()->where('user_id', $user->id)->exists(),
            403
        );

        $security->load(['locations:id,name', 'shares']);

        return new SecurityDailyReportResource($security);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_if($user->isPropertyManager(), 403);
        abort_unless($this->moduleVisibleFor($user), 403, 'A Napi Jelentés modul jelenleg nem elérhető.');

        $data = $request->validate($this->sectionValidation());

        $sectionErrors = $this->validateSections($data);
        if ($sectionErrors) {
            return response()->json(['message' => 'Hibás adatok.', 'errors' => $sectionErrors], 422);
        }

        $report = SecurityDailyReport::create([
            'report_date'            => $data['report_date'],
            'service_members'        => $data['service_members'] ?? [],
            'previous_shift_members' => $data['previous_shift_members'] ?? [],
            'taken_over_from'        => $data['taken_over_from'],
            'handover_time'          => $data['handover_time'] ?? null,
            'cc_recipients'          => array_values(array_filter($data['cc_recipients'] ?? [])),
            'equipment'              => $data['equipment'] ?? [],
            'inspectors'             => $data['inspectors'] ?? [],
            'patrols'                => $data['patrols'] ?? [],
            'incidents'              => $data['incidents'] ?? [],
            'events'                 => $data['events'] ?? [],
            'fire_alarms'            => $data['fire_alarms'] ?? [],
            'elevators'              => $data['elevators'] ?? [],
            'maintenance'            => $data['maintenance'] ?? [],
            'prepared_by'            => $data['prepared_by'],
            'created_by_user_id'     => $user->id,
        ]);

        $report->locations()->sync($data['location_ids']);

        foreach (array_filter(array_map('intval', $data['share_user_ids'] ?? [])) as $userId) {
            SecurityReportShare::firstOrCreate(['report_id' => $report->id, 'user_id' => $userId]);
        }

        $this->sendNotification($report);

        ActivityLog::record('security.created', $user, "Napi biztonsági jelentés leadva: {$report->report_date}", [
            'report_id'   => $report->id,
            'report_date' => (string) $report->report_date,
            'prepared_by' => $report->prepared_by,
        ]);

        return (new SecurityDailyReportResource($report->load(['locations:id,name', 'shares'])))->response()->setStatusCode(201);
    }

    public function update(Request $request, SecurityDailyReport $security)
    {
        $user = $request->user();
        abort_unless($user->id === $security->created_by_user_id, 403);

        $data = $request->validate($this->sectionValidation());

        $sectionErrors = $this->validateSections($data);
        if ($sectionErrors) {
            return response()->json(['message' => 'Hibás adatok.', 'errors' => $sectionErrors], 422);
        }

        $security->update([
            'report_date'            => $data['report_date'],
            'service_members'        => $data['service_members'] ?? [],
            'previous_shift_members' => $data['previous_shift_members'] ?? [],
            'taken_over_from'        => $data['taken_over_from'],
            'handover_time'          => $data['handover_time'] ?? null,
            'cc_recipients'          => array_values(array_filter($data['cc_recipients'] ?? [])),
            'equipment'              => $data['equipment'] ?? [],
            'inspectors'             => $data['inspectors'] ?? [],
            'patrols'                => $data['patrols'] ?? [],
            'incidents'              => $data['incidents'] ?? [],
            'events'                 => $data['events'] ?? [],
            'fire_alarms'            => $data['fire_alarms'] ?? [],
            'elevators'              => $data['elevators'] ?? [],
            'maintenance'            => $data['maintenance'] ?? [],
            'prepared_by'            => $data['prepared_by'],
        ]);

        $security->locations()->sync($data['location_ids']);

        $security->shares()->delete();
        foreach (array_filter(array_map('intval', $data['share_user_ids'] ?? [])) as $userId) {
            SecurityReportShare::create(['report_id' => $security->id, 'user_id' => $userId]);
        }

        ActivityLog::record('security.updated', $user, "Napi biztonsági jelentés módosítva: {$security->report_date}", [
            'report_id'   => $security->id,
            'report_date' => (string) $security->report_date,
            'prepared_by' => $security->prepared_by,
        ]);

        return new SecurityDailyReportResource($security->fresh(['locations:id,name', 'shares']));
    }

    public function updateShares(Request $request, SecurityDailyReport $security)
    {
        $user = $request->user();
        abort_unless($user->id === $security->created_by_user_id, 403);

        $data = $request->validate([
            'share_user_ids'   => 'nullable|array',
            'share_user_ids.*' => 'integer',
        ]);

        $security->shares()->delete();
        foreach (array_filter(array_map('intval', $data['share_user_ids'] ?? [])) as $userId) {
            SecurityReportShare::create(['report_id' => $security->id, 'user_id' => $userId]);
        }

        return new SecurityDailyReportResource($security->fresh(['locations:id,name', 'shares']));
    }

    private function sendNotification(SecurityDailyReport $report): void
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        $tenantName = $tenant ? $tenant->name : config('app.name');

        $recipients = [];

        $settingEmails = Setting::get('security_notification_email', '');
        foreach (explode(',', $settingEmails) as $email) {
            $email = trim($email);
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $recipients[] = $email;
            }
        }

        foreach (($report->cc_recipients ?? []) as $email) {
            $email = trim($email);
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $recipients[] = $email;
            }
        }

        $recipients = array_unique($recipients);
        if (empty($recipients)) {
            return;
        }

        try {
            Mail::to($recipients[0])
                ->cc(array_slice($recipients, 1))
                ->send(new SecurityReportMail($report, $tenantName));
        } catch (\Throwable) {
            // email küldés hiba nem állítja meg a mentést
        }
    }
}
