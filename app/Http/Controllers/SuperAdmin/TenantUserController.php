<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TenantUserController extends Controller
{
    private function bootTenant(Tenant $tenant): void
    {
        $dbPath = database_path('tenants/' . $tenant->slug . '.sqlite');
        config(['database.connections.tenant.database' => $dbPath]);
        DB::purge('tenant');
    }

    public function index(Tenant $tenant)
    {
        $this->bootTenant($tenant);
        $users = TenantUser::orderByRaw("CASE role WHEN 'admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get();
        return view('super-admin.tenants.users', compact('tenant', 'users'));
    }

    public function store(Request $request, Tenant $tenant)
    {
        $this->bootTenant($tenant);

        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => ['required', 'email', 'max:255', Rule::unique(TenantUser::class)],
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => 'required|in:admin,user,property_manager',
        ], [
            'email.unique'          => 'Ez az email cím már foglalt ennél a cégnél.',
            'password.min'          => 'A jelszó legalább 8 karakter legyen.',
            'password.confirmed'    => 'A két jelszó nem egyezik.',
        ]);

        TenantUser::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'is_active' => true,
        ]);

        return back()->with('success', "{$request->name} sikeresen létrehozva.");
    }

    public function update(Request $request, Tenant $tenant, int $userId)
    {
        $this->bootTenant($tenant);
        $user = TenantUser::findOrFail($userId);

        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => ['required', 'email', 'max:255', Rule::unique(TenantUser::class)->ignore($user->id)],
            'role'           => 'required|in:admin,user,property_manager',
            'employed_since' => 'nullable|date',
            'password'       => 'nullable|string|min:8|confirmed',
        ], [
            'email.unique'       => 'Ez az email cím már foglalt ennél a cégnél.',
            'password.min'       => 'A jelszó legalább 8 karakter legyen.',
            'password.confirmed' => 'A két jelszó nem egyezik.',
        ]);

        $data = [
            'name'           => $request->name,
            'email'          => $request->email,
            'role'           => $request->role,
            'employed_since' => $request->employed_since ?: null,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', "{$user->fresh()->name} adatai frissítve.");
    }

    public function toggle(Tenant $tenant, int $userId)
    {
        $this->bootTenant($tenant);
        $user = TenantUser::findOrFail($userId);
        $user->update(['is_active' => !$user->is_active]);
        $state = $user->fresh()->is_active ? 'aktiválva' : 'deaktiválva';
        return back()->with('success', "{$user->name} {$state}.");
    }

    public function destroy(Tenant $tenant, int $userId)
    {
        $this->bootTenant($tenant);
        $user = TenantUser::findOrFail($userId);
        $name = $user->name;
        $user->delete();
        return back()->with('success', "{$name} törölve.");
    }
}
