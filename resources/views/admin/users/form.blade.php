@extends('layouts.admin')
@section('title', $user ? 'Felhasználó szerkesztése' : 'Új felhasználó')

@section('content')
<div class="max-w-lg">
    <div class="flex items-center gap-2 mb-5">
        <a href="{{ route('admin.users.index') }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Felhasználók
        </a>
        <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-sm text-slate-700">{{ $user ? $user->name : 'Új felhasználó' }}</span>
    </div>

    <div class="card p-6">
        <form method="POST" action="{{ $user ? route('admin.users.update', $user) : route('admin.users.store') }}">
            @csrf
            @if($user) @method('PUT') @endif
            <div class="space-y-4">
                <div>
                    <label class="form-label" for="name">Név <span class="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value="{{ old('name', $user?->name) }}"
                           class="form-input" required>
                    @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="form-label" for="email">Email cím <span class="text-red-500">*</span></label>
                    <input type="email" id="email" name="email" value="{{ old('email', $user?->email) }}"
                           class="form-input" required autocomplete="off">
                    @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="form-label" for="role">Szerepkör <span class="text-red-500">*</span></label>
                    <select id="role" name="role" class="form-input">
                        <option value="user"  {{ old('role', $user?->role) === 'user'  ? 'selected' : '' }}>Felhasználó</option>
                        <option value="admin" {{ old('role', $user?->role) === 'admin' ? 'selected' : '' }}>Admin</option>
                    </select>
                </div>
                <div>
                    <label class="form-label" for="password">
                        Jelszó {{ $user ? '(üresen hagyva nem változik)' : '*' }}
                    </label>
                    <input type="password" id="password" name="password"
                           class="form-input" {{ $user ? '' : 'required' }}
                           autocomplete="new-password">
                    @error('password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="form-label" for="password_confirmation">Jelszó megerősítése</label>
                    <input type="password" id="password_confirmation" name="password_confirmation"
                           class="form-input" autocomplete="new-password">
                </div>
                <div class="flex items-center gap-2 pt-1">
                    <input type="checkbox" name="is_active" value="1" id="is_active"
                           class="w-4 h-4 rounded text-blue-600"
                           {{ old('is_active', $user?->is_active ?? true) ? 'checked' : '' }}>
                    <label for="is_active" class="text-sm font-medium text-slate-700 cursor-pointer">Aktív felhasználó</label>
                </div>
            </div>
            <div class="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                <button type="submit" class="btn-primary">
                    {{ $user ? 'Mentés' : 'Létrehozás' }}
                </button>
                <a href="{{ route('admin.users.index') }}" class="btn-secondary">Mégse</a>
            </div>
        </form>
    </div>
</div>
@endsection
