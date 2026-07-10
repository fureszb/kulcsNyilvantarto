<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckController;
use App\Http\Controllers\Api\EmergencyContactController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ShiftNoteController;
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
        });
    });
