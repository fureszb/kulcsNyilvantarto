<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AiDocumentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckController;
use App\Http\Controllers\Api\DirectorController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\Documents\BombThreatController;
use App\Http\Controllers\Api\Documents\DamageReportController;
use App\Http\Controllers\Api\Documents\EquipmentHandoverController;
use App\Http\Controllers\Api\Documents\EvacuationRegistryController;
use App\Http\Controllers\Api\Documents\EvacuationReportController;
use App\Http\Controllers\Api\Documents\FireKeyIssuanceController;
use App\Http\Controllers\Api\Documents\IncidentReportController;
use App\Http\Controllers\Api\Documents\KeyCardHandoverController;
use App\Http\Controllers\Api\Documents\LostFoundReportController;
use App\Http\Controllers\Api\Documents\VehicleEntryController;
use App\Http\Controllers\Api\EmergencyContactController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\PmMessageController;
use App\Http\Controllers\Api\PropertyManagerController;
use App\Http\Controllers\Api\SecurityLeadController;
use App\Http\Controllers\Api\SecurityReportController;
use App\Http\Controllers\Api\ShiftNoteController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\VezenylesController;
use Illuminate\Support\Facades\Route;

// ─── Mobil (Kotlin Multiplatform) REST API ─────────────────────────────────
// Ugyanaz a {tenant} slug-mintázat, mint a webes route-oknál (routes/web.php),
// a TenantMiddleware guard-agnosztikus, ezért változtatás nélkül újrahasználható.
Route::prefix('{tenant}')
    ->where(['tenant' => '[a-z0-9\-]+'])
    ->middleware('tenant')
    ->group(function () {

        // Publikus auth végpontok
        Route::post('/auth/login', [AuthController::class, 'login'])
            ->middleware('throttle:login')
            ->name('api.auth.login');

        // Bearer tokennel hitelesített végpontok
        Route::middleware('api-tenant-auth')->group(function () {
            Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
            Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
            Route::put('/auth/profile', [AuthController::class, 'updateProfile'])->name('api.auth.profile.update');

            // Home dashboard
            Route::get('/home', [HomeController::class, 'dashboard'])->name('api.home');

            // Locations / Items / Checks
            Route::get('/locations', [CheckController::class, 'locations'])->name('api.locations.index');
            Route::get('/locations/{location}/checklist', [CheckController::class, 'checklist'])->name('api.locations.checklist');
            Route::post('/locations/{location}/checks', [CheckController::class, 'store'])->name('api.checks.store');
            Route::get('/checks/{check}', [CheckController::class, 'show'])->name('api.checks.show');
            Route::put('/checks/{check}', [CheckController::class, 'update'])->name('api.checks.update');

            // Vezénylés (napi-szintű, terepi funkciók)
            Route::get('/vezenyles', [VezenylesController::class, 'index'])->name('api.vezenyles.index');
            Route::post('/vezenyles/schedule', [VezenylesController::class, 'upsertSchedule'])->name('api.vezenyles.schedule');
            Route::post('/vezenyles/overrides', [VezenylesController::class, 'assignCover'])->name('api.vezenyles.overrides.store');
            Route::delete('/vezenyles/overrides', [VezenylesController::class, 'removeCover'])->name('api.vezenyles.overrides.destroy');

            // Váltóüzenetek
            Route::get('/shift-notes', [ShiftNoteController::class, 'index'])->name('api.shift-notes.index');
            Route::post('/shift-notes', [ShiftNoteController::class, 'store'])->name('api.shift-notes.store');
            Route::put('/shift-notes/{note}', [ShiftNoteController::class, 'update'])->name('api.shift-notes.update');
            Route::delete('/shift-notes/{note}', [ShiftNoteController::class, 'destroy'])->name('api.shift-notes.destroy');

            // Vészhelyzeti kapcsolatok
            Route::get('/emergency-contacts', [EmergencyContactController::class, 'index'])->name('api.emergency-contacts.index');

            // Oktatások
            Route::get('/trainings', [TrainingController::class, 'index'])->name('api.trainings.index');
            Route::get('/trainings/{training}', [TrainingController::class, 'show'])->name('api.trainings.show');
            Route::post('/trainings/{training}/results', [TrainingController::class, 'storeResult'])->name('api.trainings.results.store');

            // Vizsgák
            Route::get('/exams', [ExamController::class, 'index'])->name('api.exams.index');
            Route::get('/exams/{exam}', [ExamController::class, 'show'])->name('api.exams.show');
            Route::post('/exams/{exam}/answers', [ExamController::class, 'submitAnswers'])->name('api.exams.answers.store');

            // PM üzenetek
            Route::get('/pm-messages', [PmMessageController::class, 'index'])->name('api.pm-messages.index');
            Route::get('/pm-messages/recipients', [PmMessageController::class, 'recipients'])->name('api.pm-messages.recipients');
            Route::post('/pm-messages', [PmMessageController::class, 'store'])->name('api.pm-messages.store');
            Route::post('/pm-messages/{message}/replies', [PmMessageController::class, 'storeReply'])->name('api.pm-messages.replies.store');
            Route::put('/pm-messages/{message}', [PmMessageController::class, 'update'])->name('api.pm-messages.update');
            Route::delete('/pm-messages/{message}', [PmMessageController::class, 'destroy'])->name('api.pm-messages.destroy');

            // Napi biztonsági jelentések
            Route::get('/security-reports', [SecurityReportController::class, 'index'])->name('api.security-reports.index');
            Route::get('/security-reports/{security}', [SecurityReportController::class, 'show'])->name('api.security-reports.show');
            Route::post('/security-reports', [SecurityReportController::class, 'store'])->name('api.security-reports.store');
            Route::put('/security-reports/{security}', [SecurityReportController::class, 'update'])->name('api.security-reports.update');
            Route::put('/security-reports/{security}/shares', [SecurityReportController::class, 'updateShares'])->name('api.security-reports.shares.update');

            // Dokumentumok / jegyzőkönyvek
            Route::prefix('documents')->name('api.documents.')->group(function () {
                Route::get('/', [DocumentController::class, 'index'])->name('index');
                Route::get('/workers', [DocumentController::class, 'workers'])->name('workers');
                Route::get('/{document}', [DocumentController::class, 'show'])->name('show');
                Route::get('/{document}/pdf', [DocumentController::class, 'pdf'])->name('pdf');
                Route::delete('/{document}', [DocumentController::class, 'destroy'])->name('destroy');

                Route::get('/key-card-handovers/{document}', [KeyCardHandoverController::class, 'show'])->name('key-card-handovers.show');
                Route::post('/key-card-handovers', [KeyCardHandoverController::class, 'store'])->name('key-card-handovers.store');

                Route::get('/vehicle-entries/{document}', [VehicleEntryController::class, 'show'])->name('vehicle-entries.show');
                Route::post('/vehicle-entries', [VehicleEntryController::class, 'store'])->name('vehicle-entries.store');

                Route::get('/equipment-handovers/{document}', [EquipmentHandoverController::class, 'show'])->name('equipment-handovers.show');
                Route::post('/equipment-handovers', [EquipmentHandoverController::class, 'store'])->name('equipment-handovers.store');

                Route::get('/lost-found-reports/{document}', [LostFoundReportController::class, 'show'])->name('lost-found-reports.show');
                Route::post('/lost-found-reports', [LostFoundReportController::class, 'store'])->name('lost-found-reports.store');

                Route::get('/evacuation-registries/{document}', [EvacuationRegistryController::class, 'show'])->name('evacuation-registries.show');
                Route::post('/evacuation-registries', [EvacuationRegistryController::class, 'store'])->name('evacuation-registries.store');

                Route::get('/fire-key-issuances/{document}', [FireKeyIssuanceController::class, 'show'])->name('fire-key-issuances.show');
                Route::post('/fire-key-issuances', [FireKeyIssuanceController::class, 'store'])->name('fire-key-issuances.store');

                Route::get('/incident-reports/{document}', [IncidentReportController::class, 'show'])->name('incident-reports.show');
                Route::post('/incident-reports', [IncidentReportController::class, 'store'])->name('incident-reports.store');

                Route::get('/damage-reports/{document}', [DamageReportController::class, 'show'])->name('damage-reports.show');
                Route::post('/damage-reports', [DamageReportController::class, 'store'])->name('damage-reports.store');

                Route::get('/evacuation-reports/{document}', [EvacuationReportController::class, 'show'])->name('evacuation-reports.show');
                Route::post('/evacuation-reports', [EvacuationReportController::class, 'store'])->name('evacuation-reports.store');

                Route::get('/bomb-threats/{document}', [BombThreatController::class, 'show'])->name('bomb-threats.show');
                Route::post('/bomb-threats', [BombThreatController::class, 'store'])->name('bomb-threats.store');
            });

            // Területi igazgató
            Route::prefix('director')->name('api.director.')->group(function () {
                Route::get('/overview', [DirectorController::class, 'overview'])->name('overview');
                Route::get('/monthly-history', [DirectorController::class, 'monthlyHistory'])->name('monthly-history');
                Route::post('/leads/{leadId}/goal', [DirectorController::class, 'setGoal'])->name('leads.goal');
            });

            // Biztonsági vezető
            Route::prefix('security-lead')->name('api.security-lead.')->group(function () {
                Route::get('/dashboard', [SecurityLeadController::class, 'dashboard'])->name('dashboard');
                Route::get('/workers', [SecurityLeadController::class, 'workers'])->name('workers');
                Route::get('/inventory', [SecurityLeadController::class, 'inventory'])->name('inventory');
                Route::get('/team', [SecurityLeadController::class, 'team'])->name('team');
                Route::post('/team/workers', [SecurityLeadController::class, 'addTeamWorker'])->name('team.workers.store');
                Route::delete('/team/workers/{user}', [SecurityLeadController::class, 'removeTeamWorker'])->name('team.workers.destroy');
                Route::post('/team/pm', [SecurityLeadController::class, 'setTeamPm'])->name('team.pm.store');
                Route::delete('/team/pm/{user}', [SecurityLeadController::class, 'removeTeamPm'])->name('team.pm.destroy');
            });

            // Property Manager
            Route::prefix('pm')->name('api.pm.')->group(function () {
                Route::get('/dashboard', [PropertyManagerController::class, 'dashboard'])->name('dashboard');
                Route::get('/security-reports', [PropertyManagerController::class, 'securityReports'])->name('security-reports');
                Route::get('/checks', [PropertyManagerController::class, 'checks'])->name('checks');
            });

            // Worker Detail — megosztott PM + Security Lead végpont
            Route::get('/workers/{user}', [PropertyManagerController::class, 'worker'])->name('api.workers.show');

            // AI asszisztens (RAG chat + dokumentumok)
            Route::get('/ai/chat', [AiChatController::class, 'show'])->name('api.ai.chat');
            Route::get('/ai/chat/sessions/{session}', [AiChatController::class, 'showSession'])->name('api.ai.sessions.show');
            Route::delete('/ai/chat/sessions/{session}', [AiChatController::class, 'destroySession'])->name('api.ai.sessions.destroy');
            Route::post('/ai/chat/stream', [AiChatController::class, 'stream'])
                ->middleware('throttle:20,1')->name('api.ai.chat.stream');
            Route::post('/ai/chat/tts', [AiChatController::class, 'tts'])
                ->middleware('throttle:30,1')->name('api.ai.tts');
            Route::post('/ai/documents', [AiDocumentController::class, 'store'])->name('api.ai.documents.store');
            Route::delete('/ai/documents/{document}', [AiDocumentController::class, 'destroy'])->name('api.ai.documents.destroy');
        });
    });
