<?php

namespace App\Http\Controllers;

use App\Models\AiChatSession;
use App\Models\AiDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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
        $isAdmin = $user->isAdmin();

        return Inertia::render('Ai/Chat', [
            // A tudásbázis cégszintű — a fájllistát csak az admin látja
            'documents' => $isAdmin
                ? AiDocument::latest()
                    ->get(['id', 'original_name', 'status', 'chunk_count', 'size_bytes', 'error_message', 'created_at'])
                : [],
            'sessions' => AiChatSession::where('user_id', $user->id)
                ->latest('updated_at')
                ->limit(50)
                ->get(['id', 'title', 'updated_at']),
            'isAdmin' => $isAdmin,
            // A dolgozó csak azt tudja, van-e egyáltalán tudásbázis (fájlnevek nélkül)
            'kbReady' => AiDocument::where('status', 'ready')->exists(),
        ]);
    }

    public function showSession(AiChatSession $session): JsonResponse
    {
        $user = Auth::guard('tenant')->user();
        abort_unless($session->user_id === $user->id, 403);

        $messages = $session->messages()
            ->orderBy('id')
            ->get(['role', 'content', 'sources']);

        // Forrásokat csak admin láthat
        if (!$user->isAdmin()) {
            $messages->each(fn ($m) => $m->sources = null);
        }

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
            'messages' => $messages,
        ]);
    }

    public function destroySession(AiChatSession $session): RedirectResponse
    {
        $user = Auth::guard('tenant')->user();
        abort_unless($session->user_id === $user->id, 403);

        $session->delete(); // üzenetek cascade-del törlődnek

        return back()->with('success', 'Beszélgetés törölve.');
    }

    public function stream(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:4000'],
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:8000'],
            'session_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        // Az izolációs azonosítók KIZÁRÓLAG a szerveroldali kontextusból
        // származnak — a kliens csak kérdést és előzményt küldhet.
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        // Session: meglévő folytatása (csak a sajátja!) vagy új nyitása
        $session = null;
        if (!empty($validated['session_id'])) {
            $session = AiChatSession::where('user_id', $user->id)
                ->find($validated['session_id']);
        }
        if (!$session) {
            $session = AiChatSession::create([
                'user_id' => $user->id,
                'title' => mb_substr($validated['question'], 0, 80),
            ]);
        }

        $session->messages()->create([
            'role' => 'user',
            'content' => $validated['question'],
        ]);

        // Cégszintű tudásbázis: minden kész dokumentum a keresés alapja
        $filenames = AiDocument::where('status', 'ready')
            ->pluck('original_name')
            ->all();
        $withSources = $user->isAdmin();

        return response()->stream(function () use ($validated, $tenant, $user, $session, $filenames, $withSources) {
            // Első SSE esemény: a session azonosító, hogy a kliens folytathassa
            echo "event: session\ndata: {$session->id}\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();

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
                        'filenames' => $filenames,
                        // Dolgozói nézetben a FastAPI sem sources eseményt,
                        // sem fájlnév-említést nem ad a válaszban
                        'with_sources' => $withSources,
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
            $raw = '';

            while (!$body->eof()) {
                $chunk = $body->read(1024);
                if ($chunk !== '') {
                    $raw .= $chunk;
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

            // A stream végén az asszisztens-válasz mentése (megszakadásnál a részleges is)
            $this->persistAssistantMessage($session, $raw);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // nginx: bufferelés kikapcsolása
        ]);
    }

    public function tts(Request $request): \Illuminate\Http\Response
    {
        $validated = $request->validate([
            'text' => ['required', 'string', 'max:4000'],
        ]);

        $response = Http::withHeaders([
                'X-Internal-Token' => config('services.rag.token'),
            ])
            ->timeout(60)
            ->post(config('services.rag.url') . '/tts', ['text' => $validated['text']]);

        abort_if($response->failed(), 503, 'A hangszintézis nem érhető el.');

        return response($response->body(), 200, [
            'Content-Type' => 'audio/wav',
            'Cache-Control' => 'no-store',
        ]);
    }

    private function persistAssistantMessage(AiChatSession $session, string $raw): void
    {
        $answer = '';
        $sources = null;

        // SSE parse — a sorvég lehet \n vagy \r\n (sse-starlette \r\n-t küld)
        foreach (preg_split('/\r?\n\r?\n/', $raw) as $event) {
            if (!preg_match('/^event: (\w+)\r?$/m', $event, $m)) {
                continue;
            }
            preg_match_all('/^data: (.*?)\r?$/m', $event, $dm);
            $data = implode("\n", $dm[1]);

            if ($m[1] === 'token') {
                $answer .= $data;
            } elseif ($m[1] === 'sources') {
                $decoded = json_decode($data, true);
                $sources = is_array($decoded) ? $decoded : null;
            }
        }

        if ($answer !== '') {
            $session->messages()->create([
                'role' => 'assistant',
                'content' => $answer,
                'sources' => $sources,
            ]);
        }

        $session->touch();
    }
}
