@extends('layouts.admin')
@section('title', 'Beállítások')

@section('content')
<div class="max-w-xl space-y-6">

    <div class="card p-6">
        <h2 class="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Email és jelszó beállítások
        </h2>
        <form method="POST" action="{{ route('admin.settings.update') }}" class="space-y-5">
            @csrf
            <div>
                <label class="form-label" for="global_email">Globális értesítési email</label>
                <input type="email" id="global_email" name="global_email" class="form-input @error('global_email') border-red-400 @enderror"
                       value="{{ old('global_email', $globalEmail) }}"
                       placeholder="iroda@pelda.hu">
                <p class="text-xs text-slate-400 mt-1.5">Minden ellenőrzés után erre az email-re is megy értesítés (a helyszín email-je mellett).</p>
                @error('global_email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div class="border-t border-slate-100 pt-5">
                <h3 class="font-semibold text-slate-700 mb-3">Admin jelszó módosítása</h3>
                <div class="space-y-3">
                    <div>
                        <label class="form-label" for="new_password">Új jelszó</label>
                        <input type="password" id="new_password" name="new_password" class="form-input @error('new_password') border-red-400 @enderror"
                               placeholder="Legalább 6 karakter">
                        @error('new_password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label class="form-label" for="new_password_confirmation">Jelszó megerősítése</label>
                        <input type="password" id="new_password_confirmation" name="new_password_confirmation" class="form-input"
                               placeholder="Jelszó ismét">
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Hagyja üresen, ha nem szeretné megváltoztatni a jelszót.</p>
            </div>

            <button type="submit" class="btn-primary">Beállítások mentése</button>
        </form>
    </div>

    <div class="card p-6">
        <h2 class="font-bold text-slate-700 mb-3">Email konfiguráció</h2>
        <p class="text-sm text-slate-500 mb-3">Az email küldéshez szükséges SMTP beállítások a <code class="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> fájlban adhatók meg:</p>
        <pre class="bg-slate-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto leading-relaxed">MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=app_specific_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your@gmail.com
MAIL_FROM_NAME="Kulcs Nyilvántartó"</pre>
    </div>
</div>
@endsection
