<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\UserExamOverride;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::withCount('steps')->where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        $user  = Auth::guard('tenant')->user();

        $myResults = collect();
        if ($user) {
            $myResults = ExamResult::with('exam:id,title')
                ->where('user_id', $user->id)
                ->orderByDesc('completed_at')
                ->get()
                ->map(fn($r) => [
                    'id'             => $r->id,
                    'exam_title'     => $r->exam?->title ?? '—',
                    'score'          => $r->first_try_count,
                    'total'          => $r->total_steps,
                    'score_percent'  => $r->scorePercent(),
                    'completed_at'   => $r->completed_at?->format('Y. m. d. H:i'),
                    'tab_violations' => $r->tab_violations ?? 0,
                ]);
        }

        return Inertia::render('Exam/Index', [
            'exams'     => $exams,
            'myResults' => $myResults,
        ]);
    }

    public function show(Exam $exam)
    {
        if (!$exam->is_active) {
            abort(404);
        }

        $exam->load('steps.answers');
        $user = Auth::guard('tenant')->user();

        $attemptsUsed      = 0;
        $maxAttempts       = null;
        $cooldownRemaining = 0;
        $blocked           = false;

        if ($user) {
            $attemptsUsed = ExamResult::where('exam_id', $exam->id)
                ->where('user_id', $user->id)
                ->count();

            $override    = UserExamOverride::where('user_id', $user->id)->where('exam_id', $exam->id)->first();
            $maxAttempts = $override?->max_attempts ?? $exam->max_attempts;

            if ($maxAttempts !== null && $attemptsUsed >= $maxAttempts) {
                $blocked = true;
            }

            if (!$blocked && $exam->cooldown_minutes > 0 && $attemptsUsed > 0) {
                $lastCompleted = ExamResult::where('exam_id', $exam->id)
                    ->where('user_id', $user->id)
                    ->orderByDesc('completed_at')
                    ->value('completed_at');

                if ($lastCompleted) {
                    $elapsed         = now()->getTimestamp() - strtotime($lastCompleted);
                    $cooldownSeconds = $exam->cooldown_minutes * 60;
                    if ($elapsed < $cooldownSeconds) {
                        $cooldownRemaining = (int) ceil(($cooldownSeconds - $elapsed) / 60);
                        $blocked           = true;
                    }
                }
            }
        }

        $steps = $exam->steps->map(function ($step) use ($exam) {
            $answers = $step->answers->toArray();
            if ($exam->shuffle_answers) {
                shuffle($answers);
            }
            foreach ($answers as &$a) {
                unset($a['is_correct']);
            }
            return [
                'id'            => $step->id,
                'question'      => $step->question,
                'question_type' => $step->question_type,
                'answers'       => array_values($answers),
            ];
        })->toArray();

        if ($exam->shuffle_questions) {
            shuffle($steps);
        }

        return Inertia::render('Exam/Show', [
            'exam'              => [
                'id'                 => $exam->id,
                'title'              => $exam->title,
                'description'        => $exam->description,
                'time_limit_minutes' => $exam->time_limit_minutes,
            ],
            'stepsData'         => $steps,
            'participantName'   => $user?->name ?? '',
            'attemptsUsed'      => $attemptsUsed,
            'maxAttempts'       => $maxAttempts,
            'cooldownRemaining' => $cooldownRemaining,
            'blocked'           => $blocked,
        ]);
    }

    public function submitAnswers(Request $request, Exam $exam)
    {
        $request->validate([
            'answers'                  => 'required|array',
            'answers.*.step_id'        => 'required|integer',
            'answers.*.selected_ids'   => 'nullable|array',
            'answers.*.selected_ids.*' => 'integer',
            'answers.*.text_input'     => 'nullable|string|max:1000',
            'tab_violations'           => 'nullable|integer|min:0',
            'started_at'               => 'nullable|string',
        ]);

        $user = Auth::guard('tenant')->user();

        $attemptsUsed = $user
            ? ExamResult::where('exam_id', $exam->id)->where('user_id', $user->id)->count()
            : 0;

        $override    = $user ? UserExamOverride::where('user_id', $user->id)->where('exam_id', $exam->id)->first() : null;
        $maxAttempts = $override?->max_attempts ?? $exam->max_attempts;

        if ($maxAttempts !== null && $attemptsUsed >= $maxAttempts) {
            return response()->json(['error' => 'Elérted a kísérletek maximális számát.'], 403);
        }

        $exam->load('steps.answers');
        $stepsById = $exam->steps->keyBy('id');

        $results      = [];
        $correctCount = 0;

        foreach ($request->input('answers') as $userAnswer) {
            $stepId  = $userAnswer['step_id'];
            $step    = $stepsById->get($stepId);
            if (!$step) continue;

            $selectedIds = $userAnswer['selected_ids'] ?? [];
            $textInput   = $userAnswer['text_input']   ?? '';
            $isCorrect   = false;

            if (in_array($step->question_type, ['radio', 'checkbox'])) {
                $correctIds     = $step->answers->where('is_correct', true)->pluck('id')->sort()->values()->toArray();
                $selectedSorted = collect($selectedIds)->sort()->values()->toArray();
                $isCorrect      = $correctIds === $selectedSorted;
            } elseif ($step->question_type === 'text') {
                $acceptable = $step->answers->pluck('text')->map(fn($t) => strtolower(trim($t)))->toArray();
                $isCorrect  = in_array(strtolower(trim($textInput)), $acceptable, true);
            }

            if ($isCorrect) $correctCount++;

            $results[] = [
                'step_id'       => $stepId,
                'question'      => $step->question,
                'question_type' => $step->question_type,
                'is_correct'    => $isCorrect,
                'selected_ids'  => $selectedIds,
                'text_input'    => $textInput,
                'answers'       => $step->answers->map(fn($a) => [
                    'id'         => $a->id,
                    'text'       => $a->text,
                    'is_correct' => $a->is_correct,
                ])->values()->toArray(),
            ];
        }

        $totalSteps = $exam->steps->count();
        $timeTaken  = null;
        $startedAt  = null;

        if ($request->input('started_at')) {
            try {
                $ts        = strtotime($request->input('started_at'));
                $startedAt = $ts ? \Carbon\Carbon::createFromTimestamp($ts) : null;
                $timeTaken = $startedAt ? (int) now()->diffInSeconds($startedAt) : null;
            } catch (\Throwable) {}
        }

        ExamResult::create([
            'exam_id'            => $exam->id,
            'user_id'            => $user?->id,
            'name'               => $user?->name ?? 'Vendég',
            'email'              => $user?->email,
            'results'            => $results,
            'first_try_count'    => $correctCount,
            'total_steps'        => $totalSteps,
            'completed_at'       => now(),
            'started_at'         => $startedAt,
            'tab_violations'     => $request->integer('tab_violations', 0),
            'ip_address'         => $request->ip(),
            'time_taken_seconds' => $timeTaken,
        ]);

        if ($user) {
            $score = $totalSteps > 0 ? round($correctCount / $totalSteps * 100) : 0;
            ActivityLog::record('exam.completed', $user,
                "{$user->name} elvégezte a vizsgát: {$exam->title} ({$score}%)",
                ['exam_id' => $exam->id, 'score' => $score, 'tab_violations' => $request->integer('tab_violations', 0)]
            );
        }

        return response()->json([
            'score'   => $correctCount,
            'total'   => $totalSteps,
            'results' => $results,
        ]);
    }

    public function showResult(ExamResult $result)
    {
        $user = Auth::guard('tenant')->user();

        if (!$user) abort(403);
        if ($user->role !== 'admin' && $result->user_id !== $user->id) abort(403);

        $result->load('exam:id,title');

        return Inertia::render('Exam/Result', [
            'result' => [
                'id'                  => $result->id,
                'exam_title'          => $result->exam?->title ?? '—',
                'name'                => $result->name,
                'email'               => $result->email,
                'score'               => $result->first_try_count,
                'total'               => $result->total_steps,
                'score_percent'       => $result->scorePercent(),
                'completed_at'        => $result->completed_at?->format('Y. m. d. H:i'),
                'tab_violations'      => $result->tab_violations ?? 0,
                'ip_address'          => $result->ip_address,
                'time_taken_seconds'  => $result->time_taken_seconds,
                'results'             => $result->results ?? [],
            ],
            'isAdmin' => $user->role === 'admin',
        ]);
    }
}
