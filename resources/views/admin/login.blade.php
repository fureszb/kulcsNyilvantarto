<!DOCTYPE html>
<html lang="hu" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin bejelentkezés</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-full bg-slate-50 flex items-center justify-center" x-data>
    <div class="w-full max-w-sm">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg class="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
            <h1 class="text-2xl font-extrabold text-slate-900">Admin belépés</h1>
            <p class="text-slate-500 text-sm mt-1">Kulcs & Kártya Nyilvántartó</p>
        </div>

        <div class="card p-6 shadow-md">
            @if($errors->any())
                <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {{ $errors->first() }}
                </div>
            @endif
            @if(session('success'))
                <div class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {{ session('success') }}
                </div>
            @endif

            <form method="POST" action="{{ route('admin.authenticate') }}">
                @csrf
                <div class="mb-4">
                    <label class="form-label" for="password">Jelszó</label>
                    <input type="password" id="password" name="password"
                           class="form-input"
                           placeholder="Admin jelszó"
                           autofocus required>
                    <p class="text-xs text-slate-400 mt-1.5">Első belépéskor bármilyen jelszó beállítható.</p>
                </div>
                <button type="submit" class="btn-primary w-full justify-center py-3">
                    Belépés
                </button>
            </form>
        </div>

        <p class="text-center mt-4">
            <a href="{{ route('home') }}" class="text-sm text-slate-500 hover:text-blue-700">← Vissza a főoldalra</a>
        </p>
    </div>
</body>
</html>
