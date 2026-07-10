<?php

namespace App\Http\Controllers\Api;

use App\Mail\TrainingResultMail;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\Training;
use App\Models\TrainingResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TrainingController extends Controller
{
    public function index()
    {
        $trainings = Training::where('is_active', true)
            ->withCount('steps')
            ->orderBy('sort_order')->orderBy('title')
            ->get();

        return response()->json($trainings->map(fn ($t) => [
            'id'                    => $t->id,
            'title'                 => $t->title,
            'description'           => $t->description,
            'is_active'             => $t->is_active,
            'sort_order'            => $t->sort_order,
            'is_location_knowledge' => $t->is_location_knowledge,
            'steps_count'           => $t->steps_count,
        ])->values());
    }

    public function show(Training $training)
    {
        if (!$training->is_active) {
            abort(404);
        }

        $steps = $training->steps()->with('answers')->get();

        return response()->json([
            'id'                    => $training->id,
            'title'                 => $training->title,
            'description'           => $training->description,
            'is_location_knowledge' => $training->is_location_knowledge,
            'steps'                 => $steps->map(fn ($step) => [
                'id'                 => $step->id,
                'question'           => $step->question,
                'question_type'      => $step->question_type ?? 'radio',
                'media_url'          => $step->resolveMediaUrl($step->media_path),
                'media_type'         => $step->mediaType($step->media_path),
                'media_width'        => $step->media_width ?? 100,
                'reveal_url'         => $step->resolveMediaUrl($step->reveal_media_path),
                'reveal_type'        => $step->mediaType($step->reveal_media_path),
                'reveal_media_width' => $step->reveal_media_width ?? 100,
                'answers'            => $step->answers->map(fn ($a) => [
                    'id'         => $a->id,
                    'text'       => $a->text,
                    'is_correct' => $a->is_correct,
                ])->values(),
            ])->values(),
        ]);
    }

    public function storeResult(Request $request, Training $training)
    {
        $data = $request->validate([
            'mode'                => 'required|in:training,exam',
            'name'                => 'required|string|max:255',
            'email'               => 'nullable|email|max:255',
            'results'             => 'required|array|min:1',
            'results.*.question'  => 'required|string',
            'results.*.attempts'  => 'required|integer|min:1',
            'results.*.correct'   => 'required|boolean',
        ]);

        $results = $data['results'];
        $firstTry = collect($results)->filter(fn ($r) => (int) $r['attempts'] === 1 && $r['correct'] === true)->count();
        $total = count($results);
        $completedAt = now();
        $tenantName = app()->bound('tenant') ? app('tenant')->name : config('app.name');
        $authUser = $request->user();

        TrainingResult::create([
            'training_id'     => $training->id,
            'user_id'         => $authUser->id,
            'mode'            => $data['mode'],
            'name'            => $data['name'],
            'email'           => $data['email'] ?? null,
            'results'         => $results,
            'first_try_count' => $firstTry,
            'total_steps'     => $total,
            'completed_at'    => $completedAt,
        ]);

        $scoreLabel = "{$firstTry}/{$total} ({$this->pct($firstTry, $total)}%)";
        $eventType = $data['mode'] === 'exam' ? 'exam.completed' : 'training.completed';
        $label = $data['mode'] === 'exam' ? 'Vizsga' : 'Oktatás';
        ActivityLog::record($eventType, $authUser, "{$label} elvégezve: {$training->title} – {$scoreLabel}", [
            'training_id' => $training->id,
            'mode'        => $data['mode'],
            'score'       => $firstTry,
            'total'       => $total,
        ]);

        $mailable = new TrainingResultMail(
            training: $training,
            results: $results,
            firstTryCount: $firstTry,
            totalSteps: $total,
            tenantName: $tenantName,
            completedAt: $completedAt->format('Y.m.d H:i'),
            participantName: $data['name'],
        );

        if (!empty($data['email'])) {
            Mail::to($data['email'])->send($mailable);
        }

        $notifEmail = Setting::get('training_notification_email');
        if ($notifEmail) {
            Mail::to($notifEmail)->send($mailable);
        }

        return response()->json([
            'ok'          => true,
            'completedAt' => $completedAt->toIso8601String(),
        ]);
    }

    private function pct(int $n, int $total): int
    {
        return $total > 0 ? (int) round($n / $total * 100) : 0;
    }
}
