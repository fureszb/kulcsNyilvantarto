@extends('layouts.admin')
@section('title', 'Új oktatás')

@section('content')
<div class="max-w-xl">
    <a href="{{ route('admin.trainings.index') }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Vissza
    </a>
    <div class="card p-6">
        <form method="POST" action="{{ route('admin.trainings.store') }}" class="space-y-4">
            @csrf
            <div>
                <label class="form-label" for="title">Oktatás neve <span class="text-red-500">*</span></label>
                <input type="text" id="title" name="title" class="form-input @error('title') border-red-400 @enderror"
                       value="{{ old('title') }}" placeholder="pl. Sprinkler kezelés, Tűzvédelem" required autofocus>
                @error('title')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
            <div>
                <label class="form-label" for="description">Leírás <span class="text-xs text-slate-400">(opcionális)</span></label>
                <textarea id="description" name="description" rows="3"
                          class="form-input resize-none" placeholder="Rövid leírás a dolgozóknak...">{{ old('description') }}</textarea>
            </div>
            <div>
                <label class="form-label" for="sort_order">Sorrend</label>
                <input type="number" id="sort_order" name="sort_order" class="form-input w-24"
                       value="{{ old('sort_order', 0) }}" min="0">
            </div>
            <div class="flex items-center gap-3 pt-1">
                <input type="checkbox" id="is_active" name="is_active" value="1"
                       class="w-4 h-4 rounded border-slate-300 text-blue-600"
                       {{ old('is_active', true) ? 'checked' : '' }}>
                <label for="is_active" class="text-sm font-medium text-slate-700">Aktív (megjelenik a dolgozóknak)</label>
            </div>
            <div class="flex items-center gap-3">
                <input type="checkbox" id="is_location_knowledge" name="is_location_knowledge" value="1"
                       class="w-4 h-4 rounded border-slate-300 text-blue-600"
                       {{ old('is_location_knowledge') ? 'checked' : '' }}>
                <label for="is_location_knowledge" class="text-sm font-medium text-slate-700">
                    Helyismereti oktatás/vizsga <span class="text-xs text-slate-400">(H – beleszámít a PM helyismeret %-ba)</span>
                </label>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary">Létrehozás és lépések felvétele →</button>
                <a href="{{ route('admin.trainings.index') }}" class="btn-secondary">Mégse</a>
            </div>
        </form>
    </div>
</div>
@endsection
