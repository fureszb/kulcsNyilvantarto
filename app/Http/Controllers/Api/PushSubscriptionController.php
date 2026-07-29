<?php

namespace App\Http\Controllers\Api;

use App\Models\DeviceToken;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PushSubscriptionController extends Controller
{
    public function subscribeNative(Request $request)
    {
        $data = $request->validate([
            'device_token' => ['required', 'string', 'max:500'],
            'platform'     => ['required', Rule::in(['android', 'ios'])],
        ]);

        $user = $request->user();

        DeviceToken::updateOrCreate(
            ['device_token' => $data['device_token']],
            ['user_id' => $user->id, 'platform' => $data['platform']]
        );

        return response()->json(['status' => 'subscribed']);
    }

    public function unsubscribeNative(Request $request)
    {
        $user = $request->user();

        DeviceToken::where('user_id', $user->id)->delete();

        return response()->json(['status' => 'unsubscribed']);
    }
}
