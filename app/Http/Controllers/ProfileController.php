<?php

namespace App\Http\Controllers;

use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::guard('tenant')->user();
        return Inertia::render('Profile/Edit', ['user' => auth('tenant')->user()]);
    }

    public function update(Request $request)
    {
        $user = Auth::guard('tenant')->user();

        $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => ['required', 'email', Rule::unique(TenantUser::class)->ignore($user->id)],
            'current_password' => 'nullable|required_with:password',
            'password'         => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'A jelenlegi jelszó nem helyes.']);
            }
        }

        $data = [
            'name'  => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'Profil sikeresen frissítve!');
    }
}
