@extends('layouts.admin')
@section('title', 'Oktatás szerkesztése')

@section('content')
<div class="max-w-xl">
    <a href="{{ route('admin.trainings.index') }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Vissza
    </a>
    <div class="card p-6">
        <form method="POST" action="{{ route('admin.trainings.update', $training) }}" class="space-y-4">
            @csrf @method('PUT')
            <div>
                <label class="form-label" for="title">Oktatás neve <span class="text-red-500">*</span></label>
                <input type="text" id="title" name="title" class="form-input @error('title') border-red-400 @enderror"
                       value="{{ old('title', $training->title) }}" required>
                @error('title')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
            <div>
                <label class="form-label" for="description">Leírás</label>
                <textarea id="description" name="description" rows="3"
                          class="form-input resize-none">{{ old('description', $training->description) }}</textarea>
            </div>
            <div>
                <label class="form-label" for="sort_order">Sorrend</label>
                <input type="number" id="sort_order" name="sort_order" class="form-input w-24"
                       value="{{ old('sort_order', $training->sort_order) }}" min="0">
            </div>
            <div class="flex items-center gap-3 pt-1">
                <input type="checkbox" id="is_active" name="is_active" value="1"
                       class="w-4 h-4 rounded border-slate-300 text-blue-600"
                       {{ old('is_active', $training->is_active) ? 'checked' : '' }}>
                <label for="is_active" class="text-sm font-medium text-slate-700">Aktív</label>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary">Mentés</button>
                <a href="{{ route('admin.trainings.steps.index', $training) }}" class="btn-secondary">Lépések kezelése</a>
            </div>
        </form>
    </div>
</div>
@endsection
