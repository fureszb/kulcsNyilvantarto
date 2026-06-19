<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::latest()->get();
        return view('super-admin.dashboard', compact('tenants'));
    }

    public function create()
    {
        return view('super-admin.tenants.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9\-]+$/', 'unique:tenants,slug'],
        ], [
            'slug.regex' => 'A slug csak kisbetűket, számokat és kötőjelet tartalmazhat.',
            'slug.unique' => 'Ez a slug már foglalt.',
        ]);

        $slug = $request->slug;
        $dbPath = database_path('tenants/' . $slug . '.sqlite');

        if (!is_dir(database_path('tenants'))) {
            mkdir(database_path('tenants'), 0755, true);
        }

        touch($dbPath);

        config(['database.connections.tenant.database' => $dbPath]);
        DB::purge('tenant');
        $prev = DB::getDefaultConnection();
        DB::setDefaultConnection('tenant');

        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path'     => 'database/migrations/tenant',
            '--force'    => true,
        ]);

        DB::setDefaultConnection($prev);
        DB::purge('tenant');

        Tenant::create(['name' => $request->name, 'slug' => $slug]);

        return redirect()->route('super-admin.dashboard')
            ->with('success', "\"{$request->name}\" sikeresen létrehozva! URL: " . url($slug));
    }

    public function toggle(Tenant $tenant)
    {
        $tenant->update(['is_active' => !$tenant->is_active]);
        $state = $tenant->fresh()->is_active ? 'aktiválva' : 'deaktiválva';
        return back()->with('success', "{$tenant->name} {$state}.");
    }

    public function destroy(Tenant $tenant)
    {
        $name   = $tenant->name;
        $dbPath = $tenant->database_path;

        $tenant->delete();

        if (file_exists($dbPath)) {
            unlink($dbPath);
        }

        return redirect()->route('super-admin.dashboard')
            ->with('success', "{$name} törölve.");
    }
}
