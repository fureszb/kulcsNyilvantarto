<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TrainingController extends Controller
{
    public function index()
    {
        $trainings = Training::withCount('steps')->orderBy('sort_order')->orderBy('title')->get();
        return view('admin.trainings.index', compact('trainings'));
    }

    public function create()
    {
        return view('admin.trainings.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $training = Training::create($validated + [
            'is_active'  => $request->boolean('is_active', true),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('admin.trainings.steps.index', $training)
            ->with('success', 'Oktatás létrehozva! Add hozzá az első lépést.');
    }

    public function edit(Training $training)
    {
        return view('admin.trainings.edit', compact('training'));
    }

    public function update(Request $request, Training $training)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $training->update($validated + [
            'is_active'  => $request->boolean('is_active', false),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('admin.trainings.index')->with('success', 'Oktatás frissítve!');
    }

    public function destroy(Training $training)
    {
        // Töröljük a feltöltött médiafájlokat
        foreach ($training->steps as $step) {
            if ($step->media_path) Storage::disk('public')->delete($step->media_path);
            if ($step->reveal_media_path) Storage::disk('public')->delete($step->reveal_media_path);
        }

        $training->delete();
        return redirect()->route('admin.trainings.index')->with('success', 'Oktatás törölve!');
    }
}
