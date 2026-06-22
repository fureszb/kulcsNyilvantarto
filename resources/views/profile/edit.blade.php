@extends('layouts.app')
@section('title', 'Profilom')

@section('content')
<div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-slate-800 mb-6">Profilom</h1>
    <div class="card p-6">
        <form method="POST" action="{{ route('profile.update') }}">
            @csrf @method('PUT')
            <div class="space-y-4">
                <div>
                    <label class="form-label" for="name">Név <span class="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value="{{ old('name', $user->name) }}"
                           class="form-input" required>
                    @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div>
                    <label class="form-label" for="email">Email cím <span class="text-red-500">*</span></label>
                    <input type="email" id="email" name="email" value="{{ old('email', $user->email) }}"
                           class="form-input" required>
                    @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>
                <div class="pt-2 border-t border-slate-100">
                    <p class="text-xs text-slate-500 mb-4">Jelszóváltoztatáshoz töltse ki az alábbi mezőket</p>
                    <div class="space-y-4">
                        <div>
                            <label class="form-label" for="current_password">Jelenlegi jelszó</label>
                            <input type="password" id="current_password" name="current_password"
                                   class="form-input" autocomplete="current-password">
                            @error('current_password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                        </div>
                        <div>
                            <label class="form-label" for="password">Új jelszó</label>
                            <input type="password" id="password" name="password"
                                   class="form-input" autocomplete="new-password">
                            @error('password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                        </div>
                        <div>
                            <label class="form-label" for="password_confirmation">Új jelszó megerősítése</label>
                            <input type="password" id="password_confirmation" name="password_confirmation"
                                   class="form-input" autocomplete="new-password">
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <button type="submit" class="btn-primary">Mentés</button>
            </div>
        </form>
    </div>
</div>
@endsection
