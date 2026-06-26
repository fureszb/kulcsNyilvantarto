@extends('layouts.admin')
@section('title', 'Helyszín szerkesztése')

@section('content')
<div class="max-w-xl">
    <a href="{{ route('admin.locations.index') }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Vissza
    </a>

    <div class="card p-6">
        <form method="POST" action="{{ route('admin.locations.update', $location) }}" enctype="multipart/form-data" class="space-y-4">
            @csrf @method('PUT')
            <div>
                <label class="form-label" for="name">Helyszín neve <span class="text-red-500">*</span></label>
                <input type="text" id="name" name="name" class="form-input @error('name') border-red-400 @enderror"
                       value="{{ old('name', $location->name) }}" required>
                @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Ikon szekció --}}
            @php $hasLogo = !empty($location->logo_path); $initTab = $hasLogo ? 'logo' : 'emoji'; @endphp
            <div>
                <label class="form-label">Ikon <span class="text-xs text-slate-400">(opcionális)</span></label>
                <div class="flex gap-2 mb-3">
                    <button type="button" id="tab-emoji"
                            onclick="iconTab('emoji')"
                            class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors {{ $initTab === 'emoji' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50' }}">
                        Emoji
                    </button>
                    <button type="button" id="tab-logo"
                            onclick="iconTab('logo')"
                            class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors {{ $initTab === 'logo' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50' }}">
                        Logó feltöltése
                    </button>
                </div>

                <div id="panel-emoji" {{ $hasLogo ? 'style=display:none' : '' }}>
                    <input type="text" name="icon" id="icon"
                           class="form-input text-xl w-32"
                           value="{{ old('icon', $location->icon) }}"
                           placeholder="🏢"
                           maxlength="10">
                    <p class="text-xs text-slate-400 mt-1">Illesszen be egy emojit (Win+. vagy ⌘+Ctrl+Space)</p>
                </div>

                <div id="panel-logo" {{ !$hasLogo ? 'style=display:none' : '' }}>
                    @if($location->logo_path)
                        <div class="flex items-center gap-3 mb-2">
                            <img src="{{ Storage::url($location->logo_path) }}"
                                 class="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1">
                            <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" name="remove_logo" value="1" id="remove_logo"
                                       class="w-4 h-4 rounded border-slate-300">
                                Logó törlése
                            </label>
                        </div>
                    @endif
                    <input type="file" name="logo" id="logo" accept="image/*"
                           class="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                    @error('logo')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                    <p class="text-xs text-slate-400 mt-1">Max. 1 MB, PNG/JPG/SVG/WebP</p>
                </div>
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

<script>
function iconTab(tab) {
    const isEmoji = tab === 'emoji';
    document.getElementById('panel-emoji').style.display = isEmoji ? '' : 'none';
    document.getElementById('panel-logo').style.display  = isEmoji ? 'none' : '';
    document.getElementById('tab-emoji').className = isEmoji
        ? 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors bg-blue-50 border-blue-300 text-blue-700'
        : 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors border-slate-200 text-slate-500 hover:bg-slate-50';
    document.getElementById('tab-logo').className = isEmoji
        ? 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors border-slate-200 text-slate-500 hover:bg-slate-50'
        : 'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors bg-blue-50 border-blue-300 text-blue-700';
    if (isEmoji) { const f = document.getElementById('logo'); if(f) f.value = ''; }
    else document.getElementById('icon').value = '';
}
</script>
@endsection
