@extends('layouts.admin')
@section('title', 'Beállítások')

@section('content')
<div class="max-w-2xl space-y-6">

    {{-- Email & jelszó kártya --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </div>
            <div>
                <h2 class="text-base font-bold text-slate-800">Általános beállítások</h2>
                <p class="text-xs text-slate-500 mt-0.5">Email értesítések és admin hozzáférés</p>
            </div>
        </div>

        <form method="POST" action="{{ route('admin.settings.update') }}" class="px-6 py-6 space-y-5">
            @csrf

            {{-- Kulcsnyilvántartó email --}}
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="global_email">
                    Kulcsnyilvántartó – értesítési email
                </label>
                <input type="email" id="global_email" name="global_email"
                       value="{{ old('global_email', $globalEmail) }}"
                       placeholder="iroda@pelda.hu"
                       class="w-full px-4 py-2.5 rounded-xl border @error('global_email') border-red-400 bg-red-50 @else border-slate-200 bg-white @enderror text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors">
                <p class="text-xs text-slate-400 mt-1.5">Minden ellenőrzés után erre az email-re is megy értesítés (a helyszín emailje mellett).</p>
                @error('global_email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Oktatások email --}}
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="training_notification_email">
                    Oktatások – felelős email
                </label>
                <input type="email" id="training_notification_email" name="training_notification_email"
                       value="{{ old('training_notification_email', $trainingNotificationEmail) }}"
                       placeholder="oktatas@pelda.hu"
                       class="w-full px-4 py-2.5 rounded-xl border @error('training_notification_email') border-red-400 bg-red-50 @else border-slate-200 bg-white @enderror text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors">
                <p class="text-xs text-slate-400 mt-1.5">Minden elvégzett oktatás eredménye automatikusan erre a címre kerül elküldésre.</p>
                @error('training_notification_email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Admin jelszó --}}
            <div class="border-t border-slate-100 pt-5">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <h3 class="text-sm font-bold text-slate-700">Admin jelszó módosítása</h3>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="new_password">Új jelszó</label>
                        <input type="password" id="new_password" name="new_password"
                               placeholder="Legalább 6 karakter"
                               class="w-full px-4 py-2.5 rounded-xl border @error('new_password') border-red-400 bg-red-50 @else border-slate-200 bg-white @enderror text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors">
                        @error('new_password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1.5" for="new_password_confirmation">Jelszó megerősítése</label>
                        <input type="password" id="new_password_confirmation" name="new_password_confirmation"
                               placeholder="Jelszó ismét"
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors">
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Hagyja üresen, ha nem szeretné megváltoztatni a jelszót.</p>
            </div>

            <div class="pt-2">
                <button type="submit"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Beállítások mentése
                </button>
            </div>
        </form>
    </div>

    {{-- SMTP info kártya --}}
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            </div>
            <div>
                <h2 class="text-base font-bold text-slate-800">Email konfiguráció</h2>
                <p class="text-xs text-slate-500 mt-0.5">SMTP beállítások a szerver <code class="font-mono bg-slate-100 px-1 rounded">.env</code> fájljában</p>
            </div>
        </div>
        <div class="px-6 py-5">
            <pre class="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=app_specific_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your@gmail.com
MAIL_FROM_NAME="Kulcs Nyilvántartó"</pre>
        </div>
    </div>

</div>
@endsection
