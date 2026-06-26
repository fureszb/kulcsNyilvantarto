<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamStep;
use App\Models\Training;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamStepController extends Controller
{
    public function index(Exam $exam)
    {
        $steps     = $exam->steps()->with('answers')->orderBy('sort_order')->orderBy('id')->get();
        $trainings = Training::orderBy('title')->get(['id', 'title']);
        return Inertia::render('Admin/Exams/Steps', [
            'exam'      => $exam,
            'steps'     => $steps,
            'trainings' => $trainings,
        ]);
    }

    public function store(Request $request, Exam $exam)
    {
        $type = $request->input('question_type', 'radio');

        $rules = [
            'question'        => 'required|string',
            'question_type'   => 'required|in:radio,checkbox,text',
            'answers'         => 'required|array|min:1',
            'answers.*.text'  => 'required|string|max:500',
        ];

        if ($type === 'radio') {
            $rules['correct'] = 'required|integer';
        } elseif ($type === 'checkbox') {
            $rules['correct']   = 'required|array|min:1';
            $rules['correct.*'] = 'integer';
        }

        $request->validate($rules);

        $step = $exam->steps()->create([
            'question'      => $request->input('question'),
            'question_type' => $type,
            'sort_order'    => $exam->steps()->max('sort_order') + 1,
        ]);

        $this->createAnswers($step, $request, $type);

        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Kérdés hozzáadva!');
    }

    public function edit(Exam $exam, ExamStep $step)
    {
        $step->load('answers');
        return Inertia::render('Admin/Exams/StepEdit', ['exam' => $exam, 'step' => $step]);
    }

    public function update(Request $request, Exam $exam, ExamStep $step)
    {
        $type = $request->input('question_type', $step->question_type ?? 'radio');

        $rules = [
            'question'        => 'required|string',
            'question_type'   => 'required|in:radio,checkbox,text',
            'answers'         => 'required|array|min:1',
            'answers.*.text'  => 'required|string|max:500',
        ];

        if ($type === 'radio') {
            $rules['correct'] = 'required|integer';
        } elseif ($type === 'checkbox') {
            $rules['correct']   = 'required|array|min:1';
            $rules['correct.*'] = 'integer';
        }

        $request->validate($rules);

        $step->update([
            'question'      => $request->input('question'),
            'question_type' => $type,
        ]);

        $step->answers()->delete();
        $this->createAnswers($step, $request, $type);

        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Kérdés frissítve!');
    }

    public function destroy(Exam $exam, ExamStep $step)
    {
        $step->delete();
        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Kérdés törölve!');
    }

    private function createAnswers(ExamStep $step, Request $request, string $type): void
    {
        $answers    = $request->input('answers');
        $correctRaw = $request->input('correct');

        $correctIdxes = match ($type) {
            'radio'    => [(int) $correctRaw],
            'checkbox' => array_map('intval', (array) $correctRaw),
            'text'     => array_keys($answers),
            default    => [0],
        };

        foreach ($answers as $idx => $answerData) {
            $step->answers()->create([
                'text'       => $answerData['text'],
                'is_correct' => in_array($idx, $correctIdxes),
                'sort_order' => $idx,
            ]);
        }
    }
}
