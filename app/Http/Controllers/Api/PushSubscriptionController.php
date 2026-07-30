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

        // A device_token opcionális — a meglévő Kotlin kliens (lásd
        // KKnyilvantartoKOTLIN/.../PushSubscriptionApi.kt) üres törzzsel
        // hívja, ezért a régi (a user ÖSSZES eszközét törlő) viselkedést meg
        // kell tartani, ha nincs megadva. HA viszont a hívó (pl. a natív
        // Capacitor híd, lásd resources/js/native/push.ts) elküldi a saját
        // tokenjét, csak AZT az egy eszközt töröljük — enélkül egy
        // többeszközös user egyik eszközön való kijelentkezése a többi
        // eszközén is némán megölte volna a push-t.
        $data = $request->validate([
            'device_token' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        DeviceToken::where('user_id', $user->id)
            ->when(!empty($data['device_token']), fn ($q) => $q->where('device_token', $data['device_token']))
            ->delete();

        return response()->json(['status' => 'unsubscribed']);
    }
}
