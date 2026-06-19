{{-- Media mező – új lépés formhoz (nincs meglévő tartalom) --}}
{{-- Paraméterek: $field, $xModel, $xUrl, $label, $fileBg --}}
@php
    $urlField  = $field === 'media' ? 'media_url' : 'reveal_url';
    $fileAccept = 'image/*,video/mp4,video/webm';
@endphp
<div>
    <label class="form-label">{{ $label }}</label>

    {{-- Mód váltó --}}
    <div class="flex gap-0.5 mb-2 bg-slate-100 p-0.5 rounded-lg w-fit">
        <button type="button" @click="{{ $xModel }} = 'file'"
                :class="{{ $xModel }} === 'file' ? 'bg-white shadow-sm text-slate-700 font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="px-3 py-1 rounded-md text-xs transition-all flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Fájl
        </button>
        <button type="button" @click="{{ $xModel }} = 'url'"
                :class="{{ $xModel }} === 'url' ? 'bg-white shadow-sm text-slate-700 font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="px-3 py-1 rounded-md text-xs transition-all flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            URL
        </button>
    </div>

    {{-- Fájl input --}}
    <div x-show="{{ $xModel }} === 'file'">
        <input type="file" name="{{ $field }}" accept="{{ $fileAccept }}"
               class="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:{{ $fileBg }} hover:file:opacity-80">
    </div>

    {{-- URL input --}}
    <div x-show="{{ $xModel }} === 'url'">
        <input type="text" x-model="{{ $xUrl }}"
               class="form-input text-sm font-mono" placeholder="https://example.com/kep.gif">
        <p class="text-xs text-slate-400 mt-1">Kép, GIF vagy videó URL. A tartalom erről a linkről töltődik be.</p>
    </div>

    {{-- Hidden input: URL értéket mindig elküldi, de csak ha URL módban van --}}
    <input type="hidden" name="{{ $urlField }}" :value="{{ $xModel }} === 'url' ? {{ $xUrl }} : ''">
</div>
