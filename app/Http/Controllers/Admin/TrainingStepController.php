<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingAnswer;
use App\Models\TrainingStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TrainingStepController extends Controller
{
    public function index(Training $training)
    {
        $steps = $training->steps()->with('answers')->get();
        return Inertia::render('Admin/Trainings/Steps', ['training' => $training, 'steps' => $steps]);
    }

    public function store(Request $request, Training $training)
    {
        $type = $request->input('question_type', 'radio');

        $rules = [
            'question'        => 'required|string',
            'question_type'   => 'required|in:radio,checkbox,text',
            'media'           => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:20480',
            'media_url'       => 'nullable|url|max:2048',
            'reveal_media'    => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:20480',
            'reveal_url'      => 'nullable|url|max:2048',
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

        $step = $training->steps()->create([
            'question'          => $request->input('question'),
            'question_type'     => $type,
            'media_path'        => $this->resolveUpload($request, 'media', "trainings/{$slug}"),
            'reveal_media_path' => $this->resolveUpload($request, 'reveal_media', "trainings/{$slug}"),
            'sort_order'        => $training->steps()->max('sort_order') + 1,
        ]);

        $this->createAnswers($step, $request, $type);

        return redirect()->route('admin.trainings.steps.index', $training)
            ->with('success', 'Lépés hozzáadva!');
    }

    public function edit(Training $training, TrainingStep $step)
    {
        $step->load('answers');
        return Inertia::render('Admin/Trainings/StepEdit', ['training' => $training, 'step' => $step]);
    }

    public function update(Request $request, Training $training, TrainingStep $step)
    {
        $type = $request->input('question_type', $step->question_type ?? 'radio');

        $rules = [
            'question'        => 'required|string',
            'question_type'   => 'required|in:radio,checkbox,text',
            'media'           => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:20480',
            'media_url'       => 'nullable|url|max:2048',
            'reveal_media'    => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm|max:20480',
            'reveal_url'      => 'nullable|url|max:2048',
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

        $mediaPath = $this->updateMedia($request, $step, 'media', "trainings/{$slug}");
        $revealPath = $this->updateMedia($request, $step, 'reveal_media', "trainings/{$slug}");

        $step->update([
            'question'          => $request->input('question'),
            'question_type'     => $type,
            'media_path'        => $mediaPath,
            'reveal_media_path' => $revealPath,
        ]);

        $step->answers()->delete();
        $this->createAnswers($step, $request, $type);

        return redirect()->route('admin.trainings.steps.index', $training)
            ->with('success', 'Lépés frissítve!');
    }

    public function destroy(Training $training, TrainingStep $step)
    {
        if ($step->media_path) Storage::disk('public')->delete($step->media_path);
        if ($step->reveal_media_path) Storage::disk('public')->delete($step->reveal_media_path);
        $step->delete();

        return redirect()->route('admin.trainings.steps.index', $training)
            ->with('success', 'Lépés törölve!');
    }

    /**
     * Resolve a new media path for store(): file upload wins, then URL input, else null.
     */
    private function resolveUpload(Request $request, string $field, string $dir): ?string
    {
        if ($request->hasFile($field)) {
            return $request->file($field)->store($dir, 'public');
        }
        $urlField = $field === 'media' ? 'media_url' : 'reveal_url';
        return $request->filled($urlField) ? $request->input($urlField) : null;
    }

    /**
     * Resolve updated media for update(): handles remove, file upload, URL, and fallback to existing.
     */
    private function updateMedia(Request $request, TrainingStep $step, string $field, string $dir): ?string
    {
        $removeField = $field === 'media' ? 'remove_media' : 'remove_reveal';
        $urlField    = $field === 'media' ? 'media_url'    : 'reveal_url';
        $existing    = $field === 'media' ? $step->media_path : $step->reveal_media_path;

        $shouldClear = $request->boolean($removeField) || $request->hasFile($field) || $request->filled($urlField);

        if ($shouldClear && $existing && !\App\Models\TrainingStep::isExternalUrl($existing)) {
            Storage::disk('public')->delete($existing);
        }

        if ($request->hasFile($field)) {
            return $request->file($field)->store($dir, 'public');
        }
        if ($request->filled($urlField)) {
            return $request->input($urlField);
        }
        if ($request->boolean($removeField)) {
            return null;
        }
        return $existing;
    }

    private function createAnswers(TrainingStep $step, Request $request, string $type): void
    {
        $answers    = $request->input('answers');
        $correctRaw = $request->input('correct');

        $correctIdxes = match($type) {
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
