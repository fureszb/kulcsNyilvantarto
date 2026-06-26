<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Exam;
use App\Models\ExamResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        return Inertia::render('Exam/Index', ['exams' => $exams]);
    }

    public function show(Exam $exam)
    {
        if (!$exam->is_active) {
            abort(404);
        }

        $exam->load('steps.answers');
        $user = Auth::guard('tenant')->user();
        return Inertia::render('Exam/Show', [
            'exam'            => $exam,
            'participantName' => $user?->name ?? '',
        ]);
    }

    public function sendResult(Request $request, Exam $exam)
    {
        $request->validate([
            'results'        => 'required|array',
            'first_try_count'=> 'required|integer|min:0',
        ]);

        $user = Auth::guard('tenant')->user();

        $totalSteps    = $exam->steps()->count();
        $firstTryCount = min((int) $request->input('first_try_count'), $totalSteps);

        ExamResult::create([
            'exam_id'        => $exam->id,
            'user_id'        => $user?->id,
            'name'           => $user?->name ?? 'Vendég',
            'email'          => $user?->email,
            'results'        => $request->input('results'),
            'first_try_count'=> $firstTryCount,
            'total_steps'    => $totalSteps,
            'completed_at'   => now(),
        ]);

        if ($user) {
            $score = $totalSteps > 0
                ? round($firstTryCount / $totalSteps * 100)
                : 0;

            ActivityLog::record('exam.completed', $user,
                "{$user->name} elvégezte a vizsgát: {$exam->title} ({$score}%)",
                ['exam_id' => $exam->id, 'score' => $score]
            );
        }

        return response()->json(['success' => true]);
    }
}
