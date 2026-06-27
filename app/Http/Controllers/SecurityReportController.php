<?php

namespace App\Http\Controllers;

use App\Mail\SecurityReportMail;
use App\Models\ActivityLog;
use App\Models\SecurityDailyReport;
use App\Models\SecurityReportShare;
use App\Models\Setting;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SecurityReportController extends Controller
{
    private function authorizeForUsers(): void
    {
        $user = Auth::guard('tenant')->user();
        if ($user && !$user->isAdmin() && !$user->isPropertyManager()) {
            if (Setting::get('security_module_visible', '1') !== '1') {
                abort(403, 'A Napi Jelentés modul jelenleg nem elérhető.');
            }
        }
    }

    public function index()
    {
        $this->authorizeForUsers();
        $user = Auth::guard('tenant')->user();

        if ($user && $user->isAdmin()) {
            $reports = SecurityDailyReport::orderByDesc('report_date')->orderByDesc('id')->paginate(30);
        } else {
            $reports = SecurityDailyReport::whereHas('shares', fn($q) => $q->where('user_id', $user->id))
                ->orderByDesc('report_date')->orderByDesc('id')->paginate(30);
        }

        return Inertia::render('Security/Index', [
            'reports'   => $reports,
            'user'      => $user,
            'isAdmin'   => $user->isAdmin(),
            'canCreate' => !$user->isPropertyManager(),
        ]);
    }

    public function create()
    {
        $this->authorizeForUsers();
        $sortedUsers  = $this->usersSortedByFrequency();
        $preparedBy   = Auth::guard('tenant')->user()->name;
        return Inertia::render('Security/Create', ['sortedUsers' => $sortedUsers, 'preparedBy' => $preparedBy]);
    }

    public function store(Request $request)
    {
        $this->authorizeForUsers();
        $request->validate([
            'report_date'     => 'required|date',
            'prepared_by'     => 'required|string|max:255',
            'taken_over_from' => 'required|string|max:255',
        ]);

        $decode = fn($field) => json_decode($request->input($field, '[]'), true) ?: [];

        $jsonErrors = [];
        if (collect($decode('service_members'))->contains(fn($r) => empty(trim($r['nev'] ?? '')))) {
            $jsonErrors['service_members'] = 'A Napi Szolgálat minden tagjának neve kötelező.';
        }
        if (collect($decode('inspectors'))->contains(fn($r) => empty(trim($r['neve'] ?? '')))) {
            $jsonErrors['inspectors'] = 'Az ellenőrzést végző személyek nevei kötelezők.';
        }
        if (collect($decode('patrols'))->contains(fn($r) => empty(trim($r['vagyonőr'] ?? '')))) {
            $jsonErrors['patrols'] = 'A járőrözési bejegyzések vagyonőr mezője kötelező.';
        }
        if ($jsonErrors) {
            return back()->withErrors($jsonErrors)->withInput();
        }

        $report = SecurityDailyReport::create([
            'report_date'            => $request->report_date,
            'service_members'        => $decode('service_members'),
            'previous_shift_members' => $decode('previous_shift_members'),
            'taken_over_from'        => $request->input('taken_over_from') ?: null,
            'handover_time'          => $request->input('handover_time') ?: null,
            'cc_recipients'          => array_filter(array_map('trim', explode(',', $request->input('cc_recipients', '')))),
            'equipment'              => $decode('equipment'),
            'inspectors'             => $decode('inspectors'),
            'patrols'                => $decode('patrols'),
            'incidents'              => $decode('incidents'),
            'events'                 => $decode('events'),
            'fire_alarms'            => $decode('fire_alarms'),
            'elevators'              => $decode('elevators'),
            'maintenance'            => $decode('maintenance'),
            'prepared_by'            => $request->prepared_by,
            'created_by_user_id'     => Auth::guard('tenant')->id(),
        ]);

        // Megosztás – kiválasztott user-ek
        $shareIds = array_filter(array_map('intval', $request->input('share_user_ids', [])));
        foreach ($shareIds as $userId) {
            SecurityReportShare::firstOrCreate(['report_id' => $report->id, 'user_id' => $userId]);
        }

        // Email értesítés
        $this->sendNotification($report);

        ActivityLog::record('security.created', Auth::guard('tenant')->user(),
            "Napi biztonsági jelentés leadva: {$report->report_date}", [
                'report_id'   => $report->id,
                'report_date' => (string) $report->report_date,
                'prepared_by' => $report->prepared_by,
            ]);

        return redirect()->route('security.index')->with('success', 'Napi jelentés sikeresen mentve.');
    }

    public function show(SecurityDailyReport $security)
    {
        $this->authorizeForUsers();
        $authUser = Auth::guard('tenant')->user();

        abort_if(
            !$authUser->isAdmin()
                && !$authUser->isPropertyManager()
                && $authUser->id !== $security->created_by_user_id
                && !$security->shares()->where('user_id', $authUser->id)->exists(),
            403
        );

        $sharedUsers = TenantUser::whereIn('id', $security->shares()->pluck('user_id'))->get();
        $allUsers    = TenantUser::where('is_active', true)->orderBy('name')->get();
        $isCreator   = $authUser->id === $security->created_by_user_id;
        return Inertia::render('Security/Show', [
            'report'      => $security,
            'sharedUsers' => $sharedUsers,
            'allUsers'    => $allUsers,
            'isCreator'   => $isCreator,
        ]);
    }

    public function edit(SecurityDailyReport $security)
    {
        $this->authorizeForUsers();
        $authUser = Auth::guard('tenant')->user();
        abort_if(!$authUser || $authUser->id !== $security->created_by_user_id, 403);

        $sortedUsers = $this->usersSortedByFrequency();
        $sharedIds   = $security->shares()->pluck('user_id')->toArray();
        return Inertia::render('Security/Edit', ['security' => $security, 'sortedUsers' => $sortedUsers, 'sharedIds' => $sharedIds]);
    }

    public function update(Request $request, SecurityDailyReport $security)
    {
        $this->authorizeForUsers();
        $authUser = Auth::guard('tenant')->user();
        abort_if(!$authUser || $authUser->id !== $security->created_by_user_id, 403);

        $request->validate([
            'report_date'     => 'required|date',
            'prepared_by'     => 'required|string|max:255',
            'taken_over_from' => 'required|string|max:255',
        ]);

        $decode = fn($field) => json_decode($request->input($field, '[]'), true) ?: [];

        $jsonErrors = [];
        if (collect($decode('service_members'))->contains(fn($r) => empty(trim($r['nev'] ?? '')))) {
            $jsonErrors['service_members'] = 'A Napi Szolgálat minden tagjának neve kötelező.';
        }
        if (collect($decode('inspectors'))->contains(fn($r) => empty(trim($r['neve'] ?? '')))) {
            $jsonErrors['inspectors'] = 'Az ellenőrzést végző személyek nevei kötelezők.';
        }
        if (collect($decode('patrols'))->contains(fn($r) => empty(trim($r['vagyonőr'] ?? '')))) {
            $jsonErrors['patrols'] = 'A járőrözési bejegyzések vagyonőr mezője kötelező.';
        }
        if ($jsonErrors) {
            return back()->withErrors($jsonErrors)->withInput();
        }

        $security->update([
            'report_date'            => $request->report_date,
            'service_members'        => $decode('service_members'),
            'previous_shift_members' => $decode('previous_shift_members'),
            'taken_over_from'        => $request->input('taken_over_from') ?: null,
            'handover_time'          => $request->input('handover_time') ?: null,
            'cc_recipients'          => array_values(array_filter(array_map('trim', explode(',', $request->input('cc_recipients', ''))))),
            'equipment'              => $decode('equipment'),
            'inspectors'             => $decode('inspectors'),
            'patrols'                => $decode('patrols'),
            'incidents'              => $decode('incidents'),
            'events'                 => $decode('events'),
            'fire_alarms'            => $decode('fire_alarms'),
            'elevators'              => $decode('elevators'),
            'maintenance'            => $decode('maintenance'),
            'prepared_by'            => $request->prepared_by,
        ]);

        // Megosztás frissítése
        $shareIds = array_filter(array_map('intval', $request->input('share_user_ids', [])));
        $security->shares()->delete();
        foreach ($shareIds as $userId) {
            SecurityReportShare::create(['report_id' => $security->id, 'user_id' => $userId]);
        }

        ActivityLog::record('security.updated', Auth::guard('tenant')->user(),
            "Napi biztonsági jelentés módosítva: {$security->report_date}", [
                'report_id'   => $security->id,
                'report_date' => (string) $security->report_date,
                'prepared_by' => $security->prepared_by,
            ]);

        return redirect()->route('security.show', $security)->with('success', 'Napi jelentés sikeresen módosítva.');
    }

    public function updateShares(Request $request, SecurityDailyReport $security)
    {
        $authUser = Auth::guard('tenant')->user();
        abort_if(!$authUser || $authUser->id !== $security->created_by_user_id, 403);

        $shareIds = array_filter(array_map('intval', $request->input('share_user_ids', [])));
        $security->shares()->delete();
        foreach ($shareIds as $userId) {
            SecurityReportShare::create(['report_id' => $security->id, 'user_id' => $userId]);
        }

        return back()->with('success', 'Megosztás sikeresen frissítve.');
    }

    private function usersSortedByFrequency()
    {
        $allUsers = TenantUser::where('is_active', true)->orderBy('name')->get();

        $counts = SecurityReportShare::select('user_id', DB::raw('count(*) as cnt'))
            ->groupBy('user_id')
            ->pluck('cnt', 'user_id')
            ->toArray();

        return $allUsers->sortByDesc(fn($u) => $counts[$u->id] ?? 0)->values();
    }

    private function sendNotification(SecurityDailyReport $report): void
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        $tenantName = $tenant ? $tenant->name : config('app.name');

        $recipients = [];

        // Admin beállítás szerinti értesítési email-ek
        $settingEmails = Setting::get('security_notification_email', '');
        foreach (explode(',', $settingEmails) as $email) {
            $email = trim($email);
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $recipients[] = $email;
            }
        }

        // Per-report CC
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
