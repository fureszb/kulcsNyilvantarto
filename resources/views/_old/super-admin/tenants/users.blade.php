@extends('layouts.super-admin')
@section('title', $tenant->name . ' – Felhasználók')

@section('content')

{{-- Edit modal --}}
<div x-data="editModal()" @keydown.escape.window="close()" x-cloak>
    <div x-show="open"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

        <div x-show="open"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 scale-95 translate-y-2"
             x-transition:enter-end="opacity-100 scale-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 scale-100 translate-y-0"
             x-transition:leave-end="opacity-0 scale-95 translate-y-2"
             @click.stop
             class="bg-white rounded-2xl shadow-xl w-full max-w-lg">

            {{-- Modal header --}}
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                    <h2 class="text-base font-bold text-slate-900">Felhasználó szerkesztése</h2>
                    <p class="text-xs text-slate-400 mt-0.5" x-text="editEmail"></p>
                </div>
                <button @click="close()" type="button"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {{-- Modal form --}}
            <form method="POST" :action="updateUrl" class="p-6 space-y-4">
                @csrf
                @method('PATCH')

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teljes név *</label>
                    <input type="text" name="name" x-model="editName"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm"
                           required>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email cím *</label>
                    <input type="email" name="email" x-model="editEmail"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm"
                           required>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Szerepkör *</label>
                        <select name="role" x-model="editRole"
                                class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm">
                            <option value="user">Felhasználó</option>
                            <option value="property_manager">Property Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Belépett a céghez</label>
                        <input type="date" name="employed_since" x-model="editEmployedSince"
                               class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm">
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-4">
                    <p class="text-xs text-slate-400 mb-3">Jelszó – csak ha változtatni szeretnéd</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Új jelszó</label>
                            <input type="password" name="password"
                                   class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm"
                                   placeholder="min. 8 karakter">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Megerősítés</label>
                            <input type="password" name="password_confirmation"
                                   class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm"
                                   placeholder="••••••••">
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-2">
                    <button type="button" @click="close()"
                            class="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                        Mégse
                    </button>
                    <button type="submit"
                            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer">
                        Mentés
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


<div class="mb-8 flex items-center gap-3">
    <a href="{{ route('super-admin.dashboard') }}"
       class="text-slate-400 hover:text-slate-600 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
    </a>
    <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ $tenant->name }} – Felhasználók</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ $users->count() }} felhasználó</p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

    {{-- User lista --}}
    <div class="lg:col-span-3">
        @if($users->isEmpty())
            <div class="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <p class="text-slate-400 text-sm font-medium">Még nincs felhasználó ennél a cégnél.</p>
            </div>
        @else
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                <table class="w-full text-sm min-w-[520px]">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50">
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Név / Email</th>
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Belépett</th>
                            <th class="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Állapot</th>
                            <th class="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        @foreach($users as $user)
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-5 py-3.5">
                                <div class="font-semibold text-slate-800">{{ $user->name }}</div>
                                <div class="text-xs text-slate-400">{{ $user->email }}</div>
                            </td>
                            <td class="px-5 py-3.5">
                                @if($user->role === 'admin')
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Admin</span>
                                @elseif($user->role === 'property_manager')
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Property Manager</span>
                                @else
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Felhasználó</span>
                                @endif
                            </td>
                            <td class="px-5 py-3.5 text-xs text-slate-500">
                                {{ $user->employed_since ? $user->employed_since->format('Y.m.d') : '–' }}
                            </td>
                            <td class="px-5 py-3.5">
                                @if($user->is_active)
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Aktív
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Inaktív
                                    </span>
                                @endif
                            </td>
                            <td class="px-5 py-3.5">
                                <div class="flex items-center justify-end gap-2">
                                    <button type="button"
                                            @click="$dispatch('open-edit-modal', {
                                                id: {{ $user->id }},
                                                name: {{ Js::from($user->name) }},
                                                email: {{ Js::from($user->email) }},
                                                role: '{{ $user->role }}',
                                                employedSince: '{{ $user->employed_since?->format('Y-m-d') ?? '' }}'
                                            })"
                                            class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer">
                                        Szerkesztés
                                    </button>
                                    <form method="POST" action="{{ route('super-admin.tenants.users.toggle', [$tenant, $user->id]) }}">
                                        @csrf @method('PATCH')
                                        <button type="submit"
                                                class="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer
                                                       {{ $user->is_active
                                                          ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                          : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' }}">
                                            {{ $user->is_active ? 'Deaktiválás' : 'Aktiválás' }}
                                        </button>
                                    </form>
                                    <form method="POST" action="{{ route('super-admin.tenants.users.destroy', [$tenant, $user->id]) }}"
                                          onsubmit="return confirm('Biztosan törölni akarod {{ $user->name }} felhasználót?')">
                                        @csrf @method('DELETE')
                                        <button type="submit"
                                                class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                                            Törlés
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                </div>
            </div>
        @endif
    </div>

    {{-- Létrehozó form --}}
    <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <h2 class="text-base font-bold text-slate-900 mb-5">Új felhasználó</h2>

            <form method="POST" action="{{ route('super-admin.tenants.users.store', $tenant) }}">
                @csrf

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teljes név *</label>
                    <input type="text" name="name" value="{{ old('name') }}" autofocus
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('name') border-red-400 @enderror"
                           placeholder="Kovács János">
                    @error('name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email cím *</label>
                    <input type="email" name="email" value="{{ old('email') }}"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('email') border-red-400 @enderror"
                           placeholder="kovacs@ceg.hu">
                    @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Szerepkör *</label>
                    <select name="role"
                            class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm @error('role') border-red-400 @enderror">
                        <option value="user"             {{ old('role', 'user') === 'user'             ? 'selected' : '' }}>Felhasználó</option>
                        <option value="property_manager" {{ old('role') === 'property_manager'         ? 'selected' : '' }}>Property Manager</option>
                        <option value="admin"            {{ old('role') === 'admin'                    ? 'selected' : '' }}>Admin</option>
                    </select>
                    @error('role')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Belépett a céghez</label>
                    <input type="date" name="employed_since" value="{{ old('employed_since') }}"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none transition text-sm">
                </div>

                <div class="mb-4">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jelszó *</label>
                    <input type="password" name="password"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm @error('password') border-red-400 @enderror"
                           placeholder="min. 8 karakter">
                    @error('password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                <div class="mb-6">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jelszó megerősítése *</label>
                    <input type="password" name="password_confirmation"
                           class="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition text-sm"
                           placeholder="••••••••">
                </div>

                <button type="submit"
                        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm cursor-pointer">
                    Felhasználó létrehozása
                </button>
            </form>
        </div>
    </div>

</div>

<script>
function editModal() {
    return {
        open: false,
        updateUrl: '',
        editName: '',
        editEmail: '',
        editRole: 'user',
        editEmployedSince: '',
        baseUrl: '{{ route('super-admin.tenants.users.update', [$tenant, '__ID__']) }}',
        init() {
            window.addEventListener('open-edit-modal', (e) => {
                const d = e.detail;
                this.updateUrl         = this.baseUrl.replace('__ID__', d.id);
                this.editName          = d.name;
                this.editEmail         = d.email;
                this.editRole          = d.role;
                this.editEmployedSince = d.employedSince;
                this.open = true;
            });
        },
        close() { this.open = false; }
    };
}
</script>

@endsection
