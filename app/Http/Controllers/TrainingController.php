<?php

namespace App\Http\Controllers;

use App\Mail\TrainingResultMail;
use App\Models\Setting;
use App\Models\Training;
use App\Models\TrainingResult;
use Illuminate\Http\Request;
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

        TrainingResult::create([
            'training_id'     => $training->id,
            'name'            => $request->input('name'),
            'email'           => $request->input('email'),
            'results'         => $results,
            'first_try_count' => $firstTry,
            'total_steps'     => $total,
            'completed_at'    => $completedAt,
        ]);

        $mailable = new TrainingResultMail(
            training:      $training,
            results:       $results,
            firstTryCount: $firstTry,
            totalSteps:    $total,
            tenantName:    $tenantName,
            completedAt:   $completedAt->format('Y.m.d H:i'),
            participantName: $request->input('name'),
        );

        if ($request->filled('email')) {
            Mail::to($request->input('email'))->send($mailable);
        }

        $notifEmail = Setting::get('training_notification_email')
                   ?: Setting::get('global_email');
        if ($notifEmail) {
            Mail::to($notifEmail)->send($mailable);
        }

        return response()->json([
            'ok'          => true,
            'completedAt' => $completedAt->format('Y.m.d H:i'),
        ]);
    }
}
