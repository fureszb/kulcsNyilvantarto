<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = TenantUser::orderBy('role')->orderBy('name')->get();
        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        return view('admin.users.form', ['user' => null]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => ['required', 'email', 'max:255', Rule::unique(TenantUser::class)],
            'password'       => 'required|string|min:8|confirmed',
            'role'           => 'required|in:admin,user,property_manager',
            'employed_since' => 'nullable|date',
        ]);

        TenantUser::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'password'       => Hash::make($validated['password']),
            'role'           => $validated['role'],
            'is_active'      => $request->boolean('is_active', true),
            'employed_since' => $validated['employed_since'] ?? null,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Felhasználó sikeresen létrehozva!');
    }

    public function edit(TenantUser $user)
    {
        return view('admin.users.form', compact('user'));
    }

    public function update(Request $request, TenantUser $user)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => ['required', 'email', 'max:255', Rule::unique(TenantUser::class)->ignore($user->id)],
            'password'       => 'nullable|string|min:8|confirmed',
            'role'           => 'required|in:admin,user,property_manager',
            'employed_since' => 'nullable|date',
        ]);

        $data = [
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'role'           => $validated['role'],
            'is_active'      => $request->boolean('is_active', false),
            'employed_since' => $validated['employed_since'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return redirect()->route('admin.users.index')->with('success', 'Felhasználó sikeresen frissítve!');
    }

    public function destroy(TenantUser $user)
    {
        if ($user->id === Auth::guard('tenant')->id()) {
            return back()->with('error', 'Saját magát nem törölheti!');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Felhasználó törölve!');
    }
}
