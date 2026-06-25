<?php

namespace App\Http\Controllers;

use App\Mail\TrainingResultMail;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\Training;
use App\Models\TrainingResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class TrainingController extends Controller
{
    public function index()
    {
        $trainings = Training::where('is_active', true)
            ->withCount('steps')
            ->orderBy('sort_order')->orderBy('title')
            ->get();

        return view('training.index', compact('trainings'));
    }

    public function show(Training $training)
    {
        if (!$training->is_active) abort(404);

        $steps = $training->steps()->with('answers')->get();

        $stepsData = $steps->map(function ($step) {
            return [
                'id'            => $step->id,
                'question'      => $step->question,
                'question_type' => $step->question_type ?? 'radio',
                'media_url'     => $step->resolveMediaUrl($step->media_path),
                'media_type'    => $step->mediaType($step->media_path),
                'reveal_url'    => $step->resolveMediaUrl($step->reveal_media_path),
                'reveal_type'   => $step->mediaType($step->reveal_media_path),
                'answers'       => $step->answers->map(fn($a) => [
                    'id'         => $a->id,
                    'text'       => $a->text,
                    'is_correct' => $a->is_correct,
                ])->values(),
            ];
        })->values();

        return view('training.show', compact('training', 'stepsData'));
    }

    public function exam(Training $training)
    {
        if (!$training->is_active) abort(404);

        $steps = $training->steps()->with('answers')->get();

        $stepsData = $steps->map(function ($step) {
            return [
                'id'            => $step->id,
                'question'      => $step->question,
                'question_type' => $step->question_type ?? 'radio',
                'answers'       => $step->answers->map(fn($a) => [
                    'id'         => $a->id,
                    'text'       => $a->text,
                    'is_correct' => $a->is_correct,
                ])->values(),
            ];
        })->values();

        return view('training.exam', compact('training', 'stepsData'));
    }

    public function sendResult(Request $request, Training $training)
    {
        $request->validate([
            'name'               => 'required|string|max:255',
            'email'              => 'nullable|email|max:255',
            'results'            => 'required|array|min:1',
            'results.*.question' => 'required|string',
            'results.*.attempts' => 'required|integer|min:1',
        ]);

        $results     = $request->input('results');
        $firstTry    = collect($results)->filter(fn($r) => ($r['attempts'] ?? 1) === 1 && ($r['correct'] ?? true) !== false)->count();
        $total       = count($results);
        $completedAt = now();
        $tenantName  = app()->bound('tenant') ? app('tenant')->name : config('app.name');

        $routeName   = $request->route()->getName();
        $mode        = str_contains($routeName, 'exam') ? 'exam' : 'training';
        $authUser    = Auth::guard('tenant')->user();

        TrainingResult::create([
            'training_id'     => $training->id,
            'user_id'         => $authUser?->id,
            'mode'            => $mode,
            'name'            => $request->input('name'),
            'email'           => $request->input('email'),
            'results'         => $results,
            'first_try_count' => $firstTry,
            'total_steps'     => $total,
            'completed_at'    => $completedAt,
        ]);

        $scoreLabel = "{$firstTry}/{$total} ({$this->pct($firstTry, $total)}%)";
        $eventType  = $mode === 'exam' ? 'exam.completed' : 'training.completed';
        $label      = $mode === 'exam' ? 'Vizsga' : 'Oktatás';
        ActivityLog::record($eventType, $authUser, "{$label} elvégezve: {$training->title} – {$scoreLabel}", [
            'training_id' => $training->id,
            'mode'        => $mode,
            'score'       => $firstTry,
            'total'       => $total,
        ]);

        $mailable = new TrainingResultMail(
            training:        $training,
            results:         $results,
            firstTryCount:   $firstTry,
            totalSteps:      $total,
            tenantName:      $tenantName,
            completedAt:     $completedAt->format('Y.m.d H:i'),
            participantName: $request->input('name'),
        );

        if ($request->filled('email')) {
            Mail::to($request->input('email'))->send($mailable);
        }

        $notifEmail = Setting::get('training_notification_email');
        if ($notifEmail) {
            Mail::to($notifEmail)->send($mailable);
        }

        return response()->json([
            'ok'          => true,
            'completedAt' => $completedAt->format('Y.m.d H:i'),
        ]);
    }

    private function pct(int $n, int $total): int
    {
        return $total > 0 ? (int) round($n / $total * 100) : 0;
    }
}
