<?php

namespace App\Http\Controllers;

use App\Models\AiDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiChatController extends Controller
{
    public function show(): Response
    {
        $user = Auth::guard('tenant')->user();

        return Inertia::render('Ai/Chat', [
            'documents' => AiDocument::where('user_id', $user->id)
                ->latest()
                ->get(['id', 'original_name', 'status', 'chunk_count', 'size_bytes', 'error_message', 'created_at']),
        ]);
    }

    public function stream(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:4000'],
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:8000'],
        ]);

        // Az izolációs azonosítók KIZÁRÓLAG a szerveroldali kontextusból
        // származnak — a kliens csak kérdést és előzményt küldhet.
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        return response()->stream(function () use ($validated, $tenant, $user) {
            try {
                $response = Http::withHeaders([
                        'X-Internal-Token' => config('services.rag.token'),
                        'Accept' => 'text/event-stream',
                    ])
                    ->withOptions(['stream' => true])
                    ->timeout(300)
                    ->post(config('services.rag.url') . '/chat/stream', [
                        'tenant_id' => $tenant->slug,
                        'user_id' => (string) $user->id,
                        'question' => $validated['question'],
                        'history' => $validated['history'] ?? [],
                    ]);
            } catch (\Throwable) {
                echo "event: error\ndata: Az AI szolgáltatás jelenleg nem érhető el.\n\n";
                flush();
                return;
            }

            if ($response->failed()) {
                echo "event: error\ndata: Az AI szolgáltatás jelenleg nem érhető el.\n\n";
                flush();
                return;
            }

            $body = $response->toPsrResponse()->getBody();

            while (!$body->eof()) {
                $chunk = $body->read(1024);
                if ($chunk !== '') {
                    echo $chunk;
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }
                if (connection_aborted()) {
                    break;
                }
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // nginx: bufferelés kikapcsolása
        ]);
    }
}
