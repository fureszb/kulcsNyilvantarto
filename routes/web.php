<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TrainingController as AdminTrainingController;
use App\Http\Controllers\Admin\TrainingStepController;
use App\Http\Controllers\CheckController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\SuperAdmin;
use Illuminate\Support\Facades\Route;

// Root → super admin
Route::get('/', fn() => redirect()->route('super-admin.login'));

// ─── Super Admin ───────────────────────────────────────────────────────────────
Route::prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/login',  [SuperAdmin\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [SuperAdmin\AuthController::class, 'login'])->name('authenticate');
    Route::post('/logout',[SuperAdmin\AuthController::class, 'logout'])->name('logout');

    Route::middleware('super-admin')->group(function () {
        Route::get('/',                        [SuperAdmin\TenantController::class, 'index'])->name('dashboard');
        Route::get('/tenants/create',          [SuperAdmin\TenantController::class, 'create'])->name('tenants.create');
        Route::post('/tenants',                [SuperAdmin\TenantController::class, 'store'])->name('tenants.store');
        Route::patch('/tenants/{tenant}/toggle',[SuperAdmin\TenantController::class, 'toggle'])->name('tenants.toggle');
        Route::delete('/tenants/{tenant}',     [SuperAdmin\TenantController::class, 'destroy'])->name('tenants.destroy');
    });
});

// ─── Tenant útvonalak ──────────────────────────────────────────────────────────
Route::prefix('{tenant}')
    ->where(['tenant' => '[a-z0-9\-]+'])
    ->middleware('tenant')
    ->group(function () {

        // Portal landing (2 kártya)
        Route::get('/', [HomeController::class, 'portal'])->name('home');

        // Kulcsnyilvántartó
        Route::get('/keys',            [HomeController::class, 'keys'])->name('keys.index');
        Route::get('/check/{location}',[CheckController::class, 'show'])->name('check.show');
        Route::post('/check/{location}',[CheckController::class, 'store'])->name('check.store');

        // Előzmények
        Route::get('/history',        [HistoryController::class, 'index'])->name('history.index');
        Route::get('/history/export', [HistoryController::class, 'export'])->name('history.export');

        // Oktatások
        Route::get('/training',                            [TrainingController::class, 'index'])->name('training.index');
        Route::get('/training/{training}',                 [TrainingController::class, 'show'])->name('training.show');
        Route::post('/training/{training}/result',         [TrainingController::class, 'sendResult'])->name('training.result');

        // ── Admin ──────────────────────────────────────────────────────────────
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/login',  [AdminController::class, 'login'])->name('login');
            Route::post('/login', [AdminController::class, 'authenticate'])->name('authenticate');
            Route::post('/logout',[AdminController::class, 'logout'])->name('logout');

            Route::middleware('admin')->group(function () {
                Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

                // Helyszínek
                Route::resource('locations', LocationController::class);
                Route::post('locations/{location}/items',          [ItemController::class, 'store'])->name('locations.items.store');
                Route::put('locations/{location}/items/{item}',    [ItemController::class, 'update'])->name('locations.items.update');
                Route::delete('locations/{location}/items/{item}', [ItemController::class, 'destroy'])->name('locations.items.destroy');

                // Beállítások
                Route::get('/settings',  [SettingController::class, 'edit'])->name('settings.edit');
                Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

                // Oktatások
                Route::resource('trainings', AdminTrainingController::class)->except(['show']);
                Route::get('trainings/{training}/steps',                      [TrainingStepController::class, 'index'])->name('trainings.steps.index');
                Route::post('trainings/{training}/steps',                     [TrainingStepController::class, 'store'])->name('trainings.steps.store');
                Route::get('trainings/{training}/steps/{step}/edit',          [TrainingStepController::class, 'edit'])->name('trainings.steps.edit');
                Route::put('trainings/{training}/steps/{step}',               [TrainingStepController::class, 'update'])->name('trainings.steps.update');
                Route::delete('trainings/{training}/steps/{step}',            [TrainingStepController::class, 'destroy'])->name('trainings.steps.destroy');
            });
        });
    });
