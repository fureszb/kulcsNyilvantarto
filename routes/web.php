<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\AiDocumentController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\NfcAccessLogController;
use App\Http\Controllers\NfcNotificationController;
use App\Http\Controllers\PmMessageController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\ShiftNoteController;
use App\Http\Controllers\Admin\EmergencyContactController;
use App\Http\Controllers\Admin\ExamController as AdminExamController;
use App\Http\Controllers\Admin\ExamStepController;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\Admin\ItemGroupController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\NfcTagController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TrainingController as AdminTrainingController;
use App\Http\Controllers\Admin\TrainingStepController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CheckController;
use App\Http\Controllers\DirectorController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Documents\IncidentReportController;
use App\Http\Controllers\Documents\VehicleEntryController;
use App\Http\Controllers\Documents\EquipmentHandoverController;
use App\Http\Controllers\Documents\DamageReportController;
use App\Http\Controllers\Documents\EvacuationReportController;
use App\Http\Controllers\Documents\EvacuationRegistryController;
use App\Http\Controllers\Documents\KeyCardHandoverController;
use App\Http\Controllers\Documents\LostFoundReportController;
use App\Http\Controllers\Documents\BombThreatController;
use App\Http\Controllers\Documents\FireKeyIssuanceController;
use App\Http\Controllers\SecurityLeadController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyManagerController;
use App\Http\Controllers\SecurityReportController;
use App\Http\Controllers\TenantUserAuthController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\SuperAdmin;
use App\Http\Controllers\VezenylesController;
use App\Http\Controllers\SuperAdmin\TenantUserController as SuperAdminUserController;
use Illuminate\Support\Facades\Route;

// Root → szervezetválasztó landing
Route::get('/', [LandingController::class, 'index'])->name('landing');

// Cortex Opsystems vállalati nyitóoldal (Hero)
Route::get('/cortex', fn () => \Inertia\Inertia::render('Cortex/Landing'))->name('cortex.landing');

// Vizuális demo: Komoot.com nyitóoldalának 1:1 stílus-másolata, csak megtekintésre (linkek nem működnek)
Route::get('/demo/komoot', fn () => \Inertia\Inertia::render('Demo/KomootHome'))->name('demo.komoot');

// Vizuális demo: a valós tenant Portal (kezdőlap) minden eleme Komoot-stílusban, csak megtekintésre
Route::get('/demo/komoot-portal', fn () => \Inertia\Inertia::render('Demo/KomootPortal'))->name('demo.komoot-portal');

// Storage file streaming with proper byte-range support (required for Safari/iOS video playback).
// Nginx or Traefik strip Accept-Ranges from responses; serving through BinaryFileResponse
// adds correct Range/Accept-Ranges headers that WebKit needs.
Route::get('/stream/{path}', function (string $path) {
    $storageRoot = realpath(storage_path('app/public'));
    $fullPath    = realpath(storage_path('app/public/' . ltrim($path, '/')));

    if (!$fullPath || !$storageRoot || !str_starts_with($fullPath, $storageRoot . DIRECTORY_SEPARATOR)) {
        abort(404);
    }

    return response()->file($fullPath, ['Cache-Control' => 'public, max-age=86400']);
})->where('path', '.*');

// ─── Super Admin ───────────────────────────────────────────────────────────────
Route::prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/login',  [SuperAdmin\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [SuperAdmin\AuthController::class, 'login'])->name('authenticate')->middleware('throttle:login');
    Route::post('/logout',[SuperAdmin\AuthController::class, 'logout'])->name('logout');

    Route::middleware('super-admin')->group(function () {
        Route::get('/',                          [SuperAdmin\TenantController::class, 'index'])->name('dashboard');
        Route::get('/tenants/create',            [SuperAdmin\TenantController::class, 'create'])->name('tenants.create');
        Route::post('/tenants',                  [SuperAdmin\TenantController::class, 'store'])->name('tenants.store');
        Route::patch('/tenants/{tenant}/toggle', [SuperAdmin\TenantController::class, 'toggle'])->name('tenants.toggle');
        Route::delete('/tenants/{tenant}',       [SuperAdmin\TenantController::class, 'destroy'])->name('tenants.destroy');

        Route::get('/tenants/{tenant}/users',                    [SuperAdminUserController::class, 'index'])->name('tenants.users.index');
        Route::post('/tenants/{tenant}/users',                   [SuperAdminUserController::class, 'store'])->name('tenants.users.store');
        Route::patch('/tenants/{tenant}/users/{userId}',         [SuperAdminUserController::class, 'update'])->name('tenants.users.update');
        Route::patch('/tenants/{tenant}/users/{userId}/toggle',  [SuperAdminUserController::class, 'toggle'])->name('tenants.users.toggle');
        Route::delete('/tenants/{tenant}/users/{userId}',        [SuperAdminUserController::class, 'destroy'])->name('tenants.users.destroy');
    });
});

// ─── Tenant útvonalak ──────────────────────────────────────────────────────────
Route::prefix('{tenant}')
    ->where(['tenant' => '[a-z0-9\-]+'])
    ->middleware('tenant')
    ->group(function () {

        // Felhasználói auth (publikus)
        Route::get('/login',  [TenantUserAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [TenantUserAuthController::class, 'login'])->name('login.post')->middleware('throttle:login');
        Route::post('/logout',[TenantUserAuthController::class, 'logout'])->name('logout');

        // Autentikált felhasználói útvonalak
        Route::middleware('tenant-user')->group(function () {
            Route::get('/', [HomeController::class, 'portal'])->name('home');

            // Kulcsnyilvántartó
            Route::get('/keys',                      [HomeController::class, 'keys'])->name('keys.index');
            Route::get('/keys/{location}',           [HomeController::class, 'locationDetail'])->name('keys.show');
            Route::get('/check/{location}',          [CheckController::class, 'show'])->name('check.show');
            Route::post('/check/{location}',         [CheckController::class, 'store'])->name('check.store');
            Route::get('/checks/{check}',            [CheckController::class, 'showResult'])->name('checks.show');
            Route::get('/checks/{check}/edit',       [CheckController::class, 'editResult'])->name('checks.edit');
            Route::put('/checks/{check}',            [CheckController::class, 'updateResult'])->name('checks.update');

            // Oktatások
            Route::get('/training',                          [TrainingController::class, 'index'])->name('training.index');
            Route::get('/training/{training}',               [TrainingController::class, 'show'])->name('training.show');
            Route::post('/training/{training}/result',       [TrainingController::class, 'sendResult'])->name('training.result');
            Route::get('/training/{training}/exam',          [TrainingController::class, 'exam'])->name('training.exam');
            Route::post('/training/{training}/exam/result',  [TrainingController::class, 'sendResult'])->name('training.exam.result');

            // Vizsgák
            Route::get('/exam',                         [ExamController::class, 'index'])->name('exam.index');
            Route::get('/exam-results/{result}',        [ExamController::class, 'showResult'])->name('exam.result.show');
            Route::get('/exam/{exam}',                  [ExamController::class, 'show'])->name('exam.show');
            Route::post('/exam/{exam}/result',          [ExamController::class, 'submitAnswers'])->name('exam.result');

            // Napi jelentés
            Route::get('/security',                        [SecurityReportController::class, 'index'])->name('security.index');
            Route::get('/security/create',                 [SecurityReportController::class, 'create'])->name('security.create');
            Route::post('/security',                       [SecurityReportController::class, 'store'])->name('security.store');
            Route::get('/security/{security}',             [SecurityReportController::class, 'show'])->name('security.show');
            Route::get('/security/{security}/edit',        [SecurityReportController::class, 'edit'])->name('security.edit');
            Route::put('/security/{security}',             [SecurityReportController::class, 'update'])->name('security.update');
            Route::post('/security/{security}/shares',     [SecurityReportController::class, 'updateShares'])->name('security.shares.update');
            Route::post('/security/{security}/review',     [SecurityReportController::class, 'review'])->name('security.review');

            // Váltóüzenetek (user + admin, PM nem látja)
            Route::get('/notes',           [ShiftNoteController::class, 'index'])->name('notes.index');
            Route::post('/notes',          [ShiftNoteController::class, 'store'])->name('notes.store');
            Route::put('/notes/{note}',    [ShiftNoteController::class, 'update'])->name('notes.update');
            Route::delete('/notes/{note}', [ShiftNoteController::class, 'destroy'])->name('notes.destroy');

            // PM üzenetek megtekintése (user + admin)
            Route::get('/messages', [PmMessageController::class, 'index'])->name('messages.index');
            Route::post('/messages/{message}/reply', [PmMessageController::class, 'storeReply'])->name('messages.reply');
            Route::put('/messages/{message}/replies/{reply}', [PmMessageController::class, 'updateReply'])->name('messages.replies.update');
            Route::delete('/messages/{message}/replies/{reply}', [PmMessageController::class, 'destroyReply'])->name('messages.replies.destroy');

            // AI asszisztens (RAG chat + dokumentumok)
            Route::get('/ai',                        [AiChatController::class, 'show'])->name('ai.chat');
            Route::post('/ai/chat/stream',           [AiChatController::class, 'stream'])
                ->middleware('throttle:20,1')
                ->name('ai.chat.stream');
            Route::post('/ai/documents',             [AiDocumentController::class, 'store'])->name('ai.documents.store');
            Route::delete('/ai/documents/{document}',[AiDocumentController::class, 'destroy'])->name('ai.documents.destroy');
            Route::post('/ai/tts',                   [AiChatController::class, 'tts'])
                ->middleware('throttle:30,1')
                ->name('ai.tts');
            Route::get('/ai/sessions/{session}',     [AiChatController::class, 'showSession'])->name('ai.sessions.show');
            Route::delete('/ai/sessions/{session}',  [AiChatController::class, 'destroySession'])->name('ai.sessions.destroy');

            // Profil
            Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

            // Dokumentumok / jegyzőkönyvek (megtekintés: mindenki; létrehozás: canCreateDocuments())
            Route::prefix('documents')->name('documents.')->group(function () {
                Route::get('/', [DocumentController::class, 'index'])->name('index');
                Route::get('/{document}', [DocumentController::class, 'show'])->name('show');
                Route::get('/{document}/preview', [DocumentController::class, 'preview'])->name('preview');
                Route::get('/{document}/download', [DocumentController::class, 'download'])->name('download');
                Route::post('/{document}/review', [DocumentController::class, 'review'])->name('review');
                Route::delete('/{document}', [DocumentController::class, 'destroy'])->name('destroy');

                Route::get('/create/incident-report', [IncidentReportController::class, 'create'])->name('incident-report.create');
                Route::post('/incident-report', [IncidentReportController::class, 'store'])->name('incident-report.store');

                Route::get('/create/vehicle-entry', [VehicleEntryController::class, 'create'])->name('vehicle-entry.create');
                Route::post('/vehicle-entry', [VehicleEntryController::class, 'store'])->name('vehicle-entry.store');

                Route::get('/create/equipment-handover', [EquipmentHandoverController::class, 'create'])->name('equipment-handover.create');
                Route::post('/equipment-handover', [EquipmentHandoverController::class, 'store'])->name('equipment-handover.store');

                Route::get('/create/damage-report', [DamageReportController::class, 'create'])->name('damage-report.create');
                Route::post('/damage-report', [DamageReportController::class, 'store'])->name('damage-report.store');

                Route::get('/create/evacuation-report', [EvacuationReportController::class, 'create'])->name('evacuation-report.create');
                Route::post('/evacuation-report', [EvacuationReportController::class, 'store'])->name('evacuation-report.store');

                Route::get('/create/evacuation-registry', [EvacuationRegistryController::class, 'create'])->name('evacuation-registry.create');
                Route::post('/evacuation-registry', [EvacuationRegistryController::class, 'store'])->name('evacuation-registry.store');

                Route::get('/create/key-card-handover', [KeyCardHandoverController::class, 'create'])->name('key-card-handover.create');
                Route::post('/key-card-handover', [KeyCardHandoverController::class, 'store'])->name('key-card-handover.store');

                Route::get('/create/lost-found-report', [LostFoundReportController::class, 'create'])->name('lost-found-report.create');
                Route::post('/lost-found-report', [LostFoundReportController::class, 'store'])->name('lost-found-report.store');

                Route::get('/create/bomb-threat', [BombThreatController::class, 'create'])->name('bomb-threat.create');
                Route::post('/bomb-threat', [BombThreatController::class, 'store'])->name('bomb-threat.store');

                Route::get('/create/fire-key-issuance', [FireKeyIssuanceController::class, 'create'])->name('fire-key-issuance.create');
                Route::post('/fire-key-issuance', [FireKeyIssuanceController::class, 'store'])->name('fire-key-issuance.store');
            });
        });

        // Web Push feliratkozás — tenant guard-dal (worker, admin és PM egyaránt)
        Route::post('/push/subscribe',   [\App\Http\Controllers\PushSubscriptionController::class, 'store'])
            ->middleware('throttle:20,1')->name('push.subscribe');
        Route::post('/push/unsubscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'destroy'])
            ->middleware('throttle:20,1')->name('push.unsubscribe');

        // WebSocket broadcast auth — tenant guard-dal (worker és PM egyaránt eléri)
        Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
            if (!\Illuminate\Support\Facades\Auth::guard('tenant')->check()) {
                abort(403);
            }
            $request->setUserResolver(fn() => \Illuminate\Support\Facades\Auth::guard('tenant')->user());
            return \Illuminate\Support\Facades\Broadcast::auth($request);
        })->name('broadcasting.auth');

        // Előzmények + napló – csak admin (tenant admin szerepkör)
        Route::middleware('admin')->group(function () {
            Route::get('/history',        [HistoryController::class, 'index'])->name('history.index');
            Route::get('/history/export', [HistoryController::class, 'export'])->name('history.export');
            Route::get('/activity',       [ActivityLogController::class, 'index'])->name('activity.index');
        });

        // Property Manager portál
        Route::prefix('pm')->name('pm.')->middleware('property-manager')->group(function () {
            Route::get('/',              [PropertyManagerController::class, 'dashboard'])->name('dashboard');
            Route::get('/worker/{user}', [PropertyManagerController::class, 'worker'])->name('worker');
            Route::get('/security',           [PropertyManagerController::class, 'securityReports'])->name('security');
            Route::get('/security/{security}', [PropertyManagerController::class, 'securityShow'])->name('security.show');
            Route::get('/checks',        [PropertyManagerController::class, 'checks'])->name('checks');
            Route::get('/activity',      [ActivityLogController::class, 'pmActivity'])->name('activity');
            Route::get('/messages',                        [PropertyManagerController::class, 'messages'])->name('messages');
            Route::post('/messages',                       [PropertyManagerController::class, 'storeMessage'])->name('messages.store');
            Route::post('/messages/{message}/reply',       [PropertyManagerController::class, 'replyToMessage'])->name('messages.reply');
            Route::put('/messages/{message}/replies/{reply}', [PropertyManagerController::class, 'updateReply'])->name('messages.replies.update');
            Route::delete('/messages/{message}/replies/{reply}', [PropertyManagerController::class, 'destroyReply'])->name('messages.replies.destroy');
            Route::get('/messages/{message}/edit',         [PropertyManagerController::class, 'editMessage'])->name('messages.edit');
            Route::put('/messages/{message}',              [PropertyManagerController::class, 'updateMessage'])->name('messages.update');
            Route::delete('/messages/{message}',           [PropertyManagerController::class, 'destroyMessage'])->name('messages.destroy');
        });

        // Területi igazgató portál
        Route::prefix('director')->name('director.')->middleware('area-director')->group(function () {
            Route::get('/',                              [DirectorController::class, 'dashboard'])->name('dashboard');
            Route::post('/leads/{leadId}/goals',         [DirectorController::class, 'setGoal'])->name('set-goal');
            Route::get('/monthly-report',                [DirectorController::class, 'monthlyReport'])->name('monthly-report');
            Route::get('/inventory',                     [DirectorController::class, 'inventory'])->name('inventory');
        });

        // Biztonsági vezető portál
        Route::prefix('security-lead')->name('security-lead.')->middleware('security-lead')->group(function () {
            Route::get('/',           [SecurityLeadController::class, 'dashboard'])->name('dashboard');
            Route::get('/workers',    [SecurityLeadController::class, 'workers'])->name('workers');
            // Dolgozó-részletező: ugyanaz a controller-metódus, mint a PM portálon (location-guard a metóduson belül)
            Route::get('/workers/{user}', [PropertyManagerController::class, 'worker'])->name('worker');
            Route::post('/workers/{user}/exams/{exam}/nudge', [SecurityLeadController::class, 'nudgeExam'])->name('workers.nudge-exam');
            Route::get('/reports',    [SecurityLeadController::class, 'dailyReports'])->name('reports');
            Route::get('/inventory',  [SecurityLeadController::class, 'inventory'])->name('inventory');
            // Leltár mutációk: ugyanaz az Admin\ItemController/ItemGroupController, location-guarddal
            Route::post('/inventory/{location}/items',          [ItemController::class, 'store'])->name('inventory.items.store');
            Route::put('/inventory/{location}/items/{item}',    [ItemController::class, 'update'])->name('inventory.items.update');
            Route::delete('/inventory/{location}/items/{item}', [ItemController::class, 'destroy'])->name('inventory.items.destroy');
            Route::post('/inventory/{location}/groups',               [ItemGroupController::class, 'store'])->name('inventory.groups.store');
            Route::put('/inventory/{location}/groups/{group}',        [ItemGroupController::class, 'update'])->name('inventory.groups.update');
            Route::delete('/inventory/{location}/groups/{group}',     [ItemGroupController::class, 'destroy'])->name('inventory.groups.destroy');
            Route::get('/team',       [SecurityLeadController::class, 'team'])->name('team');
            Route::post('/team/workers',            [SecurityLeadController::class, 'addTeamWorker'])->name('team.workers.store');
            Route::delete('/team/workers/{user}',   [SecurityLeadController::class, 'removeTeamWorker'])->name('team.workers.destroy');
            Route::post('/team/pm',                 [SecurityLeadController::class, 'setTeamPm'])->name('team.pm.store');
            Route::delete('/team/pm/{user}',         [SecurityLeadController::class, 'removeTeamPm'])->name('team.pm.destroy');
        });

        // Ki van bent — NFC beléptetés élő nézete (admin/PM/biztonsági vezető/igazgató)
        Route::get('/presence', [PresenceController::class, 'index'])->name('presence.index')->middleware('tenant-user');

        // NFC beléptetési napló — szűrhető lista (felhasználó, telephely, dátum)
        Route::get('/nfc-log', [NfcAccessLogController::class, 'index'])->name('nfc-log.index')->middleware('tenant-user');

        // NFC értesítési harang (biztonsági vezető/PM kapja meg a be-/kilépés eseményeket)
        Route::middleware('tenant-user')->group(function () {
            Route::get('/nfc-notifications', [NfcNotificationController::class, 'index'])->name('nfc-notifications.index');
            Route::post('/nfc-notifications/read', [NfcNotificationController::class, 'markRead'])->name('nfc-notifications.read');
        });

        // Vezénylés / beosztás — olvasás mindenkinek (PM kivételével, a controller tiltja),
        // szerkesztés admin/igazgató/biztonsági vezető (a controller ellenőrzi irodaházankénnt)
        Route::prefix('vezenyles')->name('vezenyles.')->middleware('tenant-user')->group(function () {
            Route::get('/',                       [VezenylesController::class, 'index'])->name('index');
            Route::post('/areas',                 [VezenylesController::class, 'storeArea'])->name('areas.store');
            Route::put('/areas/{area}',           [VezenylesController::class, 'updateArea'])->name('areas.update');
            Route::delete('/areas/{area}',        [VezenylesController::class, 'destroyArea'])->name('areas.destroy');
            Route::post('/employees',             [VezenylesController::class, 'storeEmployee'])->name('employees.store');
            Route::put('/employees/{employee}',   [VezenylesController::class, 'updateEmployee'])->name('employees.update');
            Route::delete('/employees/{employee}',[VezenylesController::class, 'destroyEmployee'])->name('employees.destroy');
            Route::post('/schedule',              [VezenylesController::class, 'upsertSchedule'])->name('schedule.upsert');
            Route::post('/overrides',             [VezenylesController::class, 'assignCover'])->name('overrides.store');
            Route::delete('/overrides',           [VezenylesController::class, 'removeCover'])->name('overrides.destroy');
            Route::post('/import',                [VezenylesController::class, 'import'])->name('import');
        });

        // ── Admin ──────────────────────────────────────────────────────────────
        Route::prefix('admin')->name('admin.')->group(function () {
            // Egységes belépés: a régi /admin/login a közös /login-ra terel
            // (a szerepkör-alapú átirányítás onnan viszi az admint a dashboardra).
            // A route nevét megtartjuk, hogy a régi könyvjelzők ne 404-eljenek.
            Route::get('/login', fn () => redirect()->route('login'))->name('login');
            Route::post('/logout',[AdminAuthController::class, 'logout'])->name('logout');

            Route::middleware('admin')->group(function () {
                Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

                // Felhasználók
                Route::resource('users', UserController::class)->except(['show']);
                Route::put('users/{user}/exam-overrides', [UserController::class, 'updateExamOverrides'])->name('users.exam-overrides');

                // Profil
                Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
                Route::put('/profile', [AdminProfileController::class, 'update'])->name('profile.update');

                // Helyszínek
                Route::resource('locations', LocationController::class);
                Route::put('locations/{location}/polygon', [LocationController::class, 'updatePolygon'])->name('locations.polygon.update');

                // NFC matricák
                Route::resource('nfc-tags', NfcTagController::class)->except(['show']);
                Route::post('locations/{location}/items',          [ItemController::class, 'store'])->name('locations.items.store');
                Route::put('locations/{location}/items/{item}',    [ItemController::class, 'update'])->name('locations.items.update');
                Route::delete('locations/{location}/items/{item}', [ItemController::class, 'destroy'])->name('locations.items.destroy');

                Route::post('locations/{location}/groups',               [ItemGroupController::class, 'store'])->name('locations.groups.store');
                Route::put('locations/{location}/groups/{group}',        [ItemGroupController::class, 'update'])->name('locations.groups.update');
                Route::delete('locations/{location}/groups/{group}',     [ItemGroupController::class, 'destroy'])->name('locations.groups.destroy');

                // Beállítások
                Route::get('/settings',  [SettingController::class, 'edit'])->name('settings.edit');
                Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

                // Értesítési lista
                Route::resource('emergency-contacts', EmergencyContactController::class)->only(['index', 'store', 'update', 'destroy']);

                // Oktatások
                Route::resource('trainings', AdminTrainingController::class)->except(['show']);
                Route::get('trainings/{training}/steps',                 [TrainingStepController::class, 'index'])->name('trainings.steps.index');
                Route::post('trainings/{training}/steps',                [TrainingStepController::class, 'store'])->name('trainings.steps.store');
                Route::post('trainings/{training}/steps/reorder',        [TrainingStepController::class, 'reorder'])->name('trainings.steps.reorder');
                Route::get('trainings/{training}/steps/{step}/edit',     [TrainingStepController::class, 'edit'])->name('trainings.steps.edit');
                Route::put('trainings/{training}/steps/{step}',          [TrainingStepController::class, 'update'])->name('trainings.steps.update');
                Route::delete('trainings/{training}/steps/{step}',       [TrainingStepController::class, 'destroy'])->name('trainings.steps.destroy');

                // Vizsgák (admin)
                Route::get('exam-results',          [AdminExamController::class, 'results'])->name('exam-results.index');
                Route::get('exam-results/{result}', [AdminExamController::class, 'resultShow'])->name('exam-results.show');
                Route::resource('exams', AdminExamController::class)->except(['show']);
                Route::post('exams/{exam}/import',               [AdminExamController::class, 'importFromTraining'])->name('exams.import');
                Route::get('exams/{exam}/steps',                 [ExamStepController::class, 'index'])->name('exams.steps.index');
                Route::post('exams/{exam}/steps',                [ExamStepController::class, 'store'])->name('exams.steps.store');
                Route::get('exams/{exam}/steps/{step}/edit',     [ExamStepController::class, 'edit'])->name('exams.steps.edit');
                Route::put('exams/{exam}/steps/{step}',          [ExamStepController::class, 'update'])->name('exams.steps.update');
                Route::delete('exams/{exam}/steps/{step}',       [ExamStepController::class, 'destroy'])->name('exams.steps.destroy');
            });
        });
    });
