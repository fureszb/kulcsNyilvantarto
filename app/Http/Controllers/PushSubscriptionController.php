<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Worker, admin és PM is feliratkozhat — de kizárólag hitelesítve
        abort_unless(Auth::guard('tenant')->check(), 401);

        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:500', 'url'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['sometimes', 'nullable', 'string', 'max:32'],
        ]);

        // Kizárólag hitelesített tenant-felhasználóhoz kötve (vendég kizárva
        // route-szinten is); a feliratkozás a tenant DB-ben tárolódik
        Auth::guard('tenant')->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth'],
            $validated['contentEncoding'] ?? 'aes128gcm',
        );

        return response()->json(['status' => 'subscribed']);
    }

    public function destroy(Request $request): JsonResponse
    {
        abort_unless(Auth::guard('tenant')->check(), 401);

        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:500'],
        ]);

        // Csak a saját feliratkozását törölheti
        Auth::guard('tenant')->user()->deletePushSubscription($validated['endpoint']);

        return response()->json(['status' => 'unsubscribed']);
    }
}
