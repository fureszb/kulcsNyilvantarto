<!DOCTYPE html>
<html lang="hu" class="h-full overflow-x-hidden">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    @routes
    <script>
    window.__REVERB_CONFIG__ = {
        key:     '{{ config("broadcasting.connections.reverb.key") }}',
        wsHost:  '{{ config("reverb.servers.reverb.hostname") }}',
        wsPort:   {{ (int) config("reverb.apps.apps.0.options.port", 443) }},
        forceTLS: {{ config("reverb.apps.apps.0.options.scheme", "https") === "https" ? "true" : "false" }}
    };
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="h-full antialiased" style="background:#0f172a;">

<div id="page-loader" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#0f172a;transition:opacity 0.35s ease;">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px;"></div>
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;">
        <div style="position:relative;width:64px;height:64px;">
            <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid transparent;border-top-color:#3b82f6;border-right-color:rgba(59,130,246,0.3);animation:ldr-spin 0.9s linear infinite;"></div>
            <div style="position:absolute;inset:6px;border-radius:12px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;">
                <svg style="width:22px;height:22px;" fill="none" stroke="#60a5fa" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
            </div>
        </div>
        <div style="width:120px;height:2px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:100%;background:linear-gradient(90deg,#3b82f6,#60a5fa);border-radius:2px;animation:ldr-bar 0.5s cubic-bezier(.16,1,.3,1) forwards;transform-origin:left;"></div>
        </div>
    </div>
    <style>
        @keyframes ldr-spin { to { transform:rotate(360deg); } }
        @keyframes ldr-bar  { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    </style>
</div>
<script>
(function() {
    var loader = document.getElementById('page-loader');
    var start  = Date.now(), MIN = 500;
    var hidden = false;

    function hide() {
        if (hidden) return;
        hidden = true;
        var wait = Math.max(0, MIN - (Date.now() - start));
        setTimeout(function() {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(function() {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
                window.dispatchEvent(new Event('app-loader-done'));
            }, 360);
        }, wait);
    }

    // Show JS errors visually (helpful for mobile debugging)
    window.__jsErrShown = false;
    function showErr(label, msg) {
        if (window.__jsErrShown) return;
        window.__jsErrShown = true;
        hide();
        var div = document.createElement('div');
        div.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0f172a;color:#fca5a5;padding:20px 16px;font:13px/1.5 monospace;overflow:auto;word-break:break-word;white-space:pre-wrap;';
        div.innerHTML = '<b style="color:#f87171;font-size:15px">' + label + '</b>\n\n' + msg;
        document.body.appendChild(div);
    }
    window.addEventListener('error', function(e) {
        // Ignore resource-load errors (img, etc.)
        if (e.target && e.target !== window) return;
        showErr('JavaScript Error', e.message + '\n@ ' + (e.filename || '?') + ':' + e.lineno);
    }, true);
    window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        var msg = reason instanceof Error ? reason.message + '\n\n' + (reason.stack || '') : String(reason);
        showErr('Unhandled Promise Rejection', msg);
    });

    // Hide only after React actually mounts into #app (not just DOMContentLoaded)
    var observer = new MutationObserver(function() {
        var app = document.getElementById('app');
        if (app && app.firstElementChild) {
            observer.disconnect();
            hide();
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        var app = document.getElementById('app');
        if (!app) { hide(); return; }
        if (app.firstElementChild) { hide(); return; }
        observer.observe(app, { childList: true });
        // Safety fallback: max 12 seconds
        setTimeout(function() { observer.disconnect(); hide(); }, 12000);
    });
})();
</script>

    @inertia
</body>
</html>
