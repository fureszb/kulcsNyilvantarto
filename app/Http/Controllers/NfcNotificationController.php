<?php

namespace App\Http\Controllers;

use App\Models\NfcNotification;
use Illuminate\Support\Facades\Auth;

class NfcNotificationController extends Controller
{
    public function index()
    {
        $user = Auth::guard('tenant')->user();

        $notifications = NfcNotification::where('user_id', $user->id)
            ->orderByDesc('occurred_at')
            ->limit(20)
            ->get(['id', 'actor_name', 'location_name', 'type', 'occurred_at', 'read_at']);

        return response()->json([
            'unread_count'  => NfcNotification::where('user_id', $user->id)->whereNull('read_at')->count(),
            'notifications' => $notifications,
        ]);
    }

    public function markRead()
    {
        $user = Auth::guard('tenant')->user();

        NfcNotification::where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
