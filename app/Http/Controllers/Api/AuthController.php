<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Api\TenantUserResource;
use App\Models\ActivityLog;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = TenantUser::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Hibás email cím vagy jelszó.',
                'errors'  => ['email' => ['Hibás email cím vagy jelszó.']],
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Fiókja inaktív. Vegye fel a kapcsolatot az adminisztrátorral.',
                'errors'  => ['email' => ['Fiókja inaktív. Vegye fel a kapcsolatot az adminisztrátorral.']],
            ], 403);
        }

        ActivityLog::record('user.login', $user, "{$user->name} bejelentkezett (mobil)");

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new TenantUserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user?->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return new TenantUserResource($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => ['required', 'email', Rule::unique(TenantUser::class)->ignore($user->id)],
            'current_password' => 'nullable|required_with:new_password',
            'new_password'     => 'nullable|string|min:8',
        ]);

        if (!empty($data['new_password'])) {
            if (!Hash::check($data['current_password'] ?? '', $user->password)) {
                return response()->json([
                    'message' => 'A jelenlegi jelszó nem helyes.',
                    'errors'  => ['current_password' => ['A jelenlegi jelszó nem helyes.']],
                ], 422);
            }
        }

        $update = ['name' => $data['name'], 'email' => $data['email']];
        if (!empty($data['new_password'])) {
            $update['password'] = Hash::make($data['new_password']);
        }

        $user->update($update);

        return new TenantUserResource($user->fresh());
    }
}
