<?php

namespace App\Http\Controllers;

use App\Models\DirectorMessage;
use App\Models\TenantUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/** Névtelen visszajelzés — minden bejelentkezett tenant-user elérheti (nem
 *  csak a biztonsági vezető). A küldő a rendszerben tárolva van, de a
 *  fogadó (igazgató) sosem látja — csak a tartalmat. Ha a tenantban több
 *  igazgató van, csak az elsőt (aktív) kapja meg a visszajelzés. */
class FeedbackController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $user = Auth::guard('tenant')->user();
        $director = TenantUser::where('role', 'area_director')->where('is_active', true)->first();
        abort_unless($director, 422, 'Nincs igazgató a rendszerben, nem lehet elküldeni.');

        DirectorMessage::create([
            'from_user_id' => $user->id, // DB-ben tárolva, de a fogadónak soha nem exponáljuk
            'to_user_id'   => $director->id,
            'content'      => $request->content,
            'is_anonymous' => true,
        ]);

        return back()->with('success', 'Visszajelzés névtelenül elküldve.');
    }

    /** A bejelentkezett user saját korábban elküldött visszajelzései (csak ő látja). */
    public function index(): JsonResponse
    {
        $user = Auth::guard('tenant')->user();

        $feedback = DirectorMessage::where('from_user_id', $user->id)
            ->where('is_anonymous', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'content'    => $m->content,
                'created_at' => $m->created_at->format('Y.m.d H:i'),
                'is_read'    => $m->read_at !== null,
            ]);

        return response()->json(['feedback' => $feedback]);
    }
}
