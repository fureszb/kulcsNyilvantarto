<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Super Admin – Bejelentkezés</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body {
            min-height: 100vh;
            background-color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            margin: 0;
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body>
    <div style="width:100%;max-width:24rem;">

        <div style="text-align:center;margin-bottom:2rem;">
            <div style="width:3.5rem;height:3.5rem;background:#4f46e5;border-radius:1rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                <svg style="width:1.75rem;height:1.75rem;color:white" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            </div>
            <h1 style="font-size:1.5rem;font-weight:700;color:white;margin:0;">Super Admin</h1>
            <p style="color:#94a3b8;font-size:0.875rem;margin:0.25rem 0 0;">KK Nyilvántartó – Rendszeradmin</p>
        </div>

        <div style="background:white;border-radius:1.25rem;box-shadow:0 25px 50px rgba(0,0,0,.4);padding:1.75rem;">
            <form method="POST" action="{{ route('super-admin.authenticate') }}">
                @csrf
                <div style="margin-bottom:1.25rem;">
                    <label style="display:block;font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem;">
                        Admin jelszó
                    </label>
                    <input type="password" name="password" autofocus
                           style="width:100%;box-sizing:border-box;border-radius:0.5rem;border:2px solid {{ $errors->has('password') ? '#f87171' : '#e2e8f0' }};padding:0.75rem 1rem;font-size:0.875rem;color:#0f172a;outline:none;transition:border-color .15s;"
                           placeholder="••••••••"
                           onfocus="this.style.borderColor='#6366f1'"
                           onblur="this.style.borderColor='{{ $errors->has('password') ? '#f87171' : '#e2e8f0' }}'">
                    @error('password')
                        <p style="color:#ef4444;font-size:0.75rem;margin:.375rem 0 0;">{{ $message }}</p>
                    @enderror
                </div>
                <button type="submit"
                        style="width:100%;padding:0.75rem;background:#4f46e5;color:white;font-weight:700;font-size:0.875rem;border:none;border-radius:0.75rem;cursor:pointer;transition:background .15s;"
                        onmouseover="this.style.background='#4338ca'"
                        onmouseout="this.style.background='#4f46e5'">
                    Bejelentkezés
                </button>
            </form>
        </div>

    </div>
</body>
</html>
