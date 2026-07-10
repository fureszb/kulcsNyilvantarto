<?php

namespace App\Http\Controllers\Api;

use App\Models\ActivityLog;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\UserExamOverride;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $exams = Exam::withCount('steps')->where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        $user = $request->user();

        $myResults = ExamResult::with('exam:id,title')
            ->where('user_id', $user->id)
            ->orderByDesc('completed_at')
            ->get()
            ->map(fn ($r) => [
                'id'             => $r->id,
                'exam_title'     => $r->exam?->title ?? '—',
                'score'          => $r->first_try_count,
                'total'          => $r->total_steps,
                'score_percent'  => $r->scorePercent(),
                'completed_at'   => optional($r->completed_at)->toIso8601String(),
                'tab_violations' => $r->tab_violations ?? 0,
            ])->values();

        return response()->json([
            'exams'      => $exams->map(fn ($e) => [
                'id'          => $e->id,
                'title'       => $e->title,
                'description' => $e->description,
                'steps_count' => $e->steps_count,
            ])->values(),
            'my_results' => $myResults,
        ]);
    }

    public function show(Request $request, Exam $exam)
    {
        if (!$exam->is_active) {
            abort(404);
        }

        $exam->load('steps.answers');
        $user = $request->user();

        $attemptsUsed = ExamResult::where('exam_id', $exam->id)->where('user_id', $user->id)->count();

        $override = UserExamOverride::where('user_id', $user->id)->where('exam_id', $exam->id)->first();
        $maxAttempts = $override?->max_attempts ?? $exam->max_attempts;

        $blocked = false;
        $cooldownRemaining = 0;

        if ($maxAttempts !== null && $attemptsUsed >= $maxAttempts) {
            $blocked = true;
        }

        if (!$blocked && $exam->cooldown_minutes > 0 && $attemptsUsed > 0) {
            $lastCompleted = ExamResult::where('exam_id', $exam->id)
                ->where('user_id', $user->id)
                ->orderByDesc('completed_at')
                ->value('completed_at');

            if ($lastCompleted) {
                $elapsed = now()->getTimestamp() - strtotime($lastCompleted);
                $cooldownSeconds = $exam->cooldown_minutes * 60;
                if ($elapsed < $cooldownSeconds) {
                    $cooldownRemaining = (int) ceil(($cooldownSeconds - $elapsed) / 60);
                    $blocked = true;
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

        return response()->json([
            'id'                 => $exam->id,
            'title'              => $exam->title,
            'description'        => $exam->description,
            'time_limit_minutes' => $exam->time_limit_minutes,
            'steps'              => $steps,
            'attempt_status'     => [
                'attempts_used'              => $attemptsUsed,
                'max_attempts'               => $maxAttempts,
                'cooldown_remaining_minutes' => $cooldownRemaining,
                'blocked'                    => $blocked,
            ],
        ]);
    }

    public function submitAnswers(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'answers'                  => 'required|array',
            'answers.*.step_id'        => 'required|integer',
            'answers.*.selected_ids'   => 'nullable|array',
            'answers.*.selected_ids.*' => 'integer',
            'answers.*.text_input'     => 'nullable|string|max:1000',
            'tab_violations'           => 'nullable|integer|min:0',
            'started_at'               => 'nullable|string',
        ]);

        $user = $request->user();

        $attemptsUsed = ExamResult::where('exam_id', $exam->id)->where('user_id', $user->id)->count();
        $override = UserExamOverride::where('user_id', $user->id)->where('exam_id', $exam->id)->first();
        $maxAttempts = $override?->max_attempts ?? $exam->max_attempts;

        if ($maxAttempts !== null && $attemptsUsed >= $maxAttempts) {
            return response()->json(['error' => 'Elérted a kísérletek maximális számát.'], 403);
        }

        $exam->load('steps.answers');
        $stepsById = $exam->steps->keyBy('id');

        $results = [];
        $correctCount = 0;

        foreach ($data['answers'] as $userAnswer) {
            $stepId = $userAnswer['step_id'];
            $step = $stepsById->get($stepId);
            if (!$step) {
                continue;
            }

            $selectedIds = $userAnswer['selected_ids'] ?? [];
            $textInput = $userAnswer['text_input'] ?? '';
            $isCorrect = false;

            if (in_array($step->question_type, ['radio', 'checkbox'])) {
                $correctIds = $step->answers->where('is_correct', true)->pluck('id')->sort()->values()->toArray();
                $selectedSorted = collect($selectedIds)->sort()->values()->toArray();
                $isCorrect = $correctIds === $selectedSorted;
            } elseif ($step->question_type === 'text') {
                $acceptable = $step->answers->pluck('text')->map(fn ($t) => strtolower(trim($t)))->toArray();
                $isCorrect = in_array(strtolower(trim($textInput)), $acceptable, true);
            }

            if ($isCorrect) {
                $correctCount++;
            }

            $results[] = [
                'step_id'       => $stepId,
                'question'      => $step->question,
                'question_type' => $step->question_type,
                'is_correct'    => $isCorrect,
                'selected_ids'  => $selectedIds,
                'text_input'    => $textInput,
                'answers'       => $step->answers->map(fn ($a) => [
                    'id'         => $a->id,
                    'text'       => $a->text,
                    'is_correct' => $a->is_correct,
                ])->values()->toArray(),
            ];
        }

        $totalSteps = $exam->steps->count();
        $timeTaken = null;
        $startedAt = null;

        if (!empty($data['started_at'])) {
            try {
                $ts = strtotime($data['started_at']);
                $startedAt = $ts ? \Carbon\Carbon::createFromTimestamp($ts) : null;
                $timeTaken = $startedAt ? (int) now()->diffInSeconds($startedAt) : null;
            } catch (\Throwable) {
            }
        }

        ExamResult::create([
            'exam_id'            => $exam->id,
            'user_id'            => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'results'            => $results,
            'first_try_count'    => $correctCount,
            'total_steps'        => $totalSteps,
            'completed_at'       => now(),
            'started_at'         => $startedAt,
            'tab_violations'     => $data['tab_violations'] ?? 0,
            'ip_address'         => $request->ip(),
            'time_taken_seconds' => $timeTaken,
        ]);

        $score = $totalSteps > 0 ? round($correctCount / $totalSteps * 100) : 0;
        ActivityLog::record('exam.completed', $user,
            "{$user->name} elvégezte a vizsgát: {$exam->title} ({$score}%)",
            ['exam_id' => $exam->id, 'score' => $score, 'tab_violations' => $data['tab_violations'] ?? 0]
        );

        return response()->json([
            'score'   => $correctCount,
            'total'   => $totalSteps,
            'results' => $results,
        ]);
    }
}
