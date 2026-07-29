<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamStep;
use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
            'media'           => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:51200',
            'media_url'       => 'nullable|url|max:2048',
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

        $slug = app('tenant')->slug;

        $step = $exam->steps()->create([
            'question'      => $request->input('question'),
            'question_type' => $type,
            'media_path'    => $this->resolveUpload($request, 'media', "exams/{$slug}"),
            'media_width'   => (int) $request->input('media_width', 100),
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
            'media'           => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:51200',
            'media_url'       => 'nullable|url|max:2048',
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

        $slug = app('tenant')->slug;

        $mediaPath = $this->updateMedia($request, $step, "exams/{$slug}");

        $step->update([
            'question'      => $request->input('question'),
            'question_type' => $type,
            'media_path'    => $mediaPath,
            'media_width'   => (int) $request->input('media_width', 100),
        ]);

        $step->answers()->delete();
        $this->createAnswers($step, $request, $type);

        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Kérdés frissítve!');
    }

    public function destroy(Exam $exam, ExamStep $step)
    {
        if ($step->media_path && !ExamStep::isExternalUrl($step->media_path)) {
            Storage::disk('public')->delete($step->media_path);
        }
        $step->delete();
        return redirect()->route('admin.exams.steps.index', $exam)
            ->with('success', 'Kérdés törölve!');
    }

    /**
     * Resolve a new media path for store(): file upload wins, then URL input, else null.
     */
    private function resolveUpload(Request $request, string $field, string $dir): ?string
    {
        if ($request->hasFile($field)) {
            Storage::disk('public')->makeDirectory($dir);
            try {
                return $request->file($field)->store($dir, 'public');
            } catch (\Throwable $e) {
                Log::error("File store failed [{$field}]: " . $e->getMessage());
                return null;
            }
        }
        return $request->filled('media_url') ? $request->input('media_url') : null;
    }

    /**
     * Resolve updated media for update(): handles remove, file upload, URL, and fallback to existing.
     */
    private function updateMedia(Request $request, ExamStep $step, string $dir): ?string
    {
        $existing    = $step->media_path;
        $shouldClear = $request->boolean('remove_media') || $request->hasFile('media') || $request->filled('media_url');

        if ($shouldClear && $existing && !ExamStep::isExternalUrl($existing)) {
            Storage::disk('public')->delete($existing);
        }

        if ($request->hasFile('media')) {
            Storage::disk('public')->makeDirectory($dir);
            try {
                return $request->file('media')->store($dir, 'public');
            } catch (\Throwable $e) {
                Log::error("File store failed [media]: " . $e->getMessage());
                return $existing;
            }
        }
        if ($request->filled('media_url')) {
            return $request->input('media_url');
        }
        if ($request->boolean('remove_media')) {
            return null;
        }
        return $existing;
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
