@extends('layouts.admin')
@section('title', 'Helyszín szerkesztése')

@section('content')
<div class="max-w-xl">
    <a href="{{ route('admin.locations.index') }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Vissza
    </a>

    <div class="card p-6">
        <form method="POST" action="{{ route('admin.locations.update', $location) }}" class="space-y-4">
            @csrf @method('PUT')
            <div>
                <label class="form-label" for="name">Helyszín neve <span class="text-red-500">*</span></label>
                <input type="text" id="name" name="name" class="form-input @error('name') border-red-400 @enderror"
                       value="{{ old('name', $location->name) }}" required>
                @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
            <div>
                <label class="form-label" for="responsible_person">Felelős személy</label>
                <input type="text" id="responsible_person" name="responsible_person" class="form-input"
                       value="{{ old('responsible_person', $location->responsible_person) }}">
            </div>
            <div>
                <label class="form-label" for="email">Email cím</label>
                <input type="email" id="email" name="email" class="form-input @error('email') border-red-400 @enderror"
                       value="{{ old('email', $location->email) }}">
                @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
            <div class="flex items-center gap-3 pt-1">
                <input type="checkbox" id="is_active" name="is_active" value="1"
                       class="w-4 h-4 rounded border-slate-300 text-blue-600"
                       {{ old('is_active', $location->is_active) ? 'checked' : '' }}>
                <label for="is_active" class="text-sm font-medium text-slate-700">Aktív</label>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary">Mentés</button>
                <a href="{{ route('admin.locations.index') }}" class="btn-secondary">Mégse</a>
            </div>
        </form>
    </div>
</div>
@endsection
