<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Training;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::withCount('steps')->orderBy('sort_order')->orderBy('id')->get();
        return view('admin.exams.index', compact('exams'));
    }

    public function create()
    {
        return view('admin.exams.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $exam = Exam::create([
            'title'       => $request->input('title'),
            'description' => $request->input('description'),
            'is_active'   => $request->boolean('is_active', true),
            'sort_order'  => $request->input('sort_order', 0),
        ]);

        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Vizsga létrehozva! Add hozzá a kérdéseket.');
    }

    public function edit(Exam $exam)
    {
        return view('admin.exams.edit', compact('exam'));
    }

    public function update(Request $request, Exam $exam)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $exam->update([
            'title'       => $request->input('title'),
            'description' => $request->input('description'),
            'is_active'   => $request->boolean('is_active'),
            'sort_order'  => $request->input('sort_order', 0),
        ]);

        return redirect()->route('admin.exams.index')
            ->with('success', 'Vizsga frissítve!');
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();
        return redirect()->route('admin.exams.index')
            ->with('success', 'Vizsga törölve!');
    }

    public function importFromTraining(Request $request, Exam $exam)
    {
        $request->validate(['training_id' => 'required|integer']);

        $training = Training::with('steps.answers')->findOrFail($request->input('training_id'));

        $imported = 0;
        foreach ($training->steps as $step) {
            $examStep = $exam->steps()->create([
                'question'      => $step->question,
                'question_type' => $step->question_type ?? 'radio',
                'sort_order'    => $exam->steps()->max('sort_order') + 1,
            ]);

            foreach ($step->answers as $answer) {
                $examStep->answers()->create([
                    'text'       => $answer->text,
                    'is_correct' => $answer->is_correct,
                    'sort_order' => $answer->sort_order ?? 0,
                ]);
            }
            $imported++;
        }

        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', "{$imported} kérdés importálva: {$training->title}");
    }
}
