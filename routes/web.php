<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\CheckController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/check/{location}', [CheckController::class, 'show'])->name('check.show');
Route::post('/check/{location}', [CheckController::class, 'store'])->name('check.store');

Route::get('/history', [HistoryController::class, 'index'])->name('history.index');
Route::get('/history/export', [HistoryController::class, 'export'])->name('history.export');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [AdminController::class, 'login'])->name('login');
    Route::post('/login', [AdminController::class, 'authenticate'])->name('authenticate');
    Route::post('/logout', [AdminController::class, 'logout'])->name('logout');

    Route::middleware('admin')->group(function () {
        Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');

        Route::resource('locations', LocationController::class);
        Route::post('locations/{location}/items', [ItemController::class, 'store'])->name('locations.items.store');
        Route::put('locations/{location}/items/{item}', [ItemController::class, 'update'])->name('locations.items.update');
        Route::delete('locations/{location}/items/{item}', [ItemController::class, 'destroy'])->name('locations.items.destroy');

        Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    });
});
