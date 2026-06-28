<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Training;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::withCount('steps')->orderBy('sort_order')->orderBy('id')->get();
        return Inertia::render('Admin/Exams/Index', ['exams' => $exams]);
    }

    public function create()
    {
        return Inertia::render('Admin/Exams/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'               => 'required|string|max:255',
            'description'         => 'nullable|string',
            'sort_order'          => 'nullable|integer|min:0',
            'max_attempts'        => 'nullable|integer|min:1',
            'cooldown_minutes'    => 'nullable|integer|min:0',
            'time_limit_minutes'  => 'nullable|integer|min:1',
        ]);

        $exam = Exam::create([
            'title'               => $request->input('title'),
            'description'         => $request->input('description'),
            'is_active'           => $request->boolean('is_active', true),
            'sort_order'          => $request->input('sort_order', 0),
            'max_attempts'        => $request->input('max_attempts') ?: null,
            'cooldown_minutes'    => $request->input('cooldown_minutes', 0),
            'shuffle_questions'   => $request->boolean('shuffle_questions', false),
            'shuffle_answers'     => $request->boolean('shuffle_answers', false),
            'time_limit_minutes'  => $request->input('time_limit_minutes') ?: null,
        ]);

        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Vizsga létrehozva! Add hozzá a kérdéseket.');
    }

    public function edit(Exam $exam)
    {
        return Inertia::render('Admin/Exams/Edit', ['exam' => $exam]);
    }

    public function update(Request $request, Exam $exam)
    {
        $request->validate([
            'title'               => 'required|string|max:255',
            'description'         => 'nullable|string',
            'sort_order'          => 'nullable|integer|min:0',
            'max_attempts'        => 'nullable|integer|min:1',
            'cooldown_minutes'    => 'nullable|integer|min:0',
            'time_limit_minutes'  => 'nullable|integer|min:1',
        ]);

        $exam->update([
            'title'               => $request->input('title'),
            'description'         => $request->input('description'),
            'is_active'           => $request->boolean('is_active'),
            'sort_order'          => $request->input('sort_order', 0),
            'max_attempts'        => $request->input('max_attempts') ?: null,
            'cooldown_minutes'    => $request->input('cooldown_minutes', 0),
            'shuffle_questions'   => $request->boolean('shuffle_questions', false),
            'shuffle_answers'     => $request->boolean('shuffle_answers', false),
            'time_limit_minutes'  => $request->input('time_limit_minutes') ?: null,
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

    public function results(Request $request)
    {
        $query = ExamResult::with('exam:id,title')
            ->orderByDesc('completed_at');

        if ($request->filled('exam_id')) {
            $query->where('exam_id', $request->integer('exam_id'));
        }

        $results = $query->paginate(50)->through(fn($r) => [
            'id'             => $r->id,
            'exam_title'     => $r->exam?->title ?? '—',
            'name'           => $r->name,
            'email'          => $r->email,
            'score'          => $r->first_try_count,
            'total'          => $r->total_steps,
            'score_percent'  => $r->scorePercent(),
            'completed_at'   => $r->completed_at?->format('Y. m. d. H:i'),
            'tab_violations' => $r->tab_violations ?? 0,
        ]);

        $exams = Exam::orderBy('title')->get(['id', 'title']);

        return Inertia::render('Admin/Exams/Results', [
            'results' => $results,
            'exams'   => $exams,
            'filters' => $request->only(['exam_id']),
        ]);
    }

    public function resultShow(ExamResult $result)
    {
        $result->load('exam:id,title', 'user:id,name,email');

        return Inertia::render('Admin/Exams/ResultShow', [
            'result' => [
                'id'                  => $result->id,
                'exam_id'             => $result->exam_id,
                'exam_title'          => $result->exam?->title ?? '—',
                'user_id'             => $result->user_id,
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
        ]);
    }

    public function importFromTraining(Request $request, Exam $exam)
    {
        $request->validate(['training_id' => 'required|integer']);

        $training = Training::with('steps.answers')->findOrFail($request->input('training_id'));

        $imported = 0;
        $stepsToImport = $training->steps->filter(fn($s) => !empty(trim($s->question ?? '')));

        foreach ($stepsToImport as $step) {
            $examStep = $exam->steps()->create([
                'question'      => $step->question,
                'question_type' => $step->question_type ?? 'radio',
                'sort_order'    => $exam->steps()->max('sort_order') + 1,
            ]);

            foreach ($step->answers->filter(fn($a) => !empty(trim($a->text ?? ''))) as $answer) {
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
