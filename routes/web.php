<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\Admin\ItemGroupController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TrainingController as AdminTrainingController;
use App\Http\Controllers\Admin\TrainingStepController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CheckController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TenantUserAuthController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\SuperAdmin;
use App\Http\Controllers\SuperAdmin\TenantUserController as SuperAdminUserController;
use Illuminate\Support\Facades\Route;

// Root → super admin
Route::get('/', fn() => redirect()->route('super-admin.login'));

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
            Route::get('/keys',             [HomeController::class, 'keys'])->name('keys.index');
            Route::get('/check/{location}', [CheckController::class, 'show'])->name('check.show');
            Route::post('/check/{location}',[CheckController::class, 'store'])->name('check.store');

            // Előzmények
            Route::get('/history',        [HistoryController::class, 'index'])->name('history.index');
            Route::get('/history/export', [HistoryController::class, 'export'])->name('history.export');

            // Oktatások
            Route::get('/training',                    [TrainingController::class, 'index'])->name('training.index');
            Route::get('/training/{training}',         [TrainingController::class, 'show'])->name('training.show');
            Route::post('/training/{training}/result', [TrainingController::class, 'sendResult'])->name('training.result');

            // Profil
            Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        });

        // ── Admin ──────────────────────────────────────────────────────────────
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/login',  [AdminAuthController::class, 'showLogin'])->name('login');
            Route::post('/login', [AdminAuthController::class, 'login'])->name('authenticate')->middleware('throttle:login');
            Route::post('/logout',[AdminAuthController::class, 'logout'])->name('logout');

            Route::middleware('admin')->group(function () {
                Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

                // Felhasználók
                Route::resource('users', UserController::class)->except(['show']);

                // Profil
                Route::get('/profile', [AdminProfileController::class, 'edit'])->name('profile.edit');
                Route::put('/profile', [AdminProfileController::class, 'update'])->name('profile.update');

                // Helyszínek
                Route::resource('locations', LocationController::class);
                Route::post('locations/{location}/items',          [ItemController::class, 'store'])->name('locations.items.store');
                Route::put('locations/{location}/items/{item}',    [ItemController::class, 'update'])->name('locations.items.update');
                Route::delete('locations/{location}/items/{item}', [ItemController::class, 'destroy'])->name('locations.items.destroy');

                Route::post('locations/{location}/groups',               [ItemGroupController::class, 'store'])->name('locations.groups.store');
                Route::put('locations/{location}/groups/{group}',        [ItemGroupController::class, 'update'])->name('locations.groups.update');
                Route::delete('locations/{location}/groups/{group}',     [ItemGroupController::class, 'destroy'])->name('locations.groups.destroy');

                // Beállítások
                Route::get('/settings',  [SettingController::class, 'edit'])->name('settings.edit');
                Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

                // Oktatások
                Route::resource('trainings', AdminTrainingController::class)->except(['show']);
                Route::get('trainings/{training}/steps',                 [TrainingStepController::class, 'index'])->name('trainings.steps.index');
                Route::post('trainings/{training}/steps',                [TrainingStepController::class, 'store'])->name('trainings.steps.store');
                Route::get('trainings/{training}/steps/{step}/edit',     [TrainingStepController::class, 'edit'])->name('trainings.steps.edit');
                Route::put('trainings/{training}/steps/{step}',          [TrainingStepController::class, 'update'])->name('trainings.steps.update');
                Route::delete('trainings/{training}/steps/{step}',       [TrainingStepController::class, 'destroy'])->name('trainings.steps.destroy');
            });
        });
    });
