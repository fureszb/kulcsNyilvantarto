@extends('layouts.admin')
@section('title', $training->title . ' – Lépések')

@section('header-actions')
    <a href="{{ route('admin.trainings.index') }}" class="btn-secondary text-sm">← Oktatások listája</a>
@endsection

@section('content')
<div class="max-w-3xl space-y-6">

    {{-- Meglévő lépések --}}
    @forelse($steps as $step)
    @php
        $typeBadge = ['radio' => ['Rádiógomb','bg-blue-100 text-blue-700'], 'checkbox' => ['Jelölőnégyzet','bg-violet-100 text-violet-700'], 'text' => ['Szöveges','bg-amber-100 text-amber-700']];
        [$typeLabel, $typeClass] = $typeBadge[$step->question_type ?? 'radio'] ?? $typeBadge['radio'];
    @endphp
    <div class="card overflow-hidden" x-data="{ open: false }">
        <div class="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer select-none"
             @click="open = !open">
            <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {{ $loop->iteration }}
                </span>
                <div class="min-w-0">
                    <span class="font-semibold text-slate-800 block truncate">{{ $step->question }}</span>
                    <span class="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full {{ $typeClass }}">{{ $typeLabel }}</span>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs text-slate-400">{{ $step->answers->count() }} válasz</span>
                <a href="{{ route('admin.trainings.steps.edit', [$training, $step]) }}"
                   @click.stop
                   class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                    Szerkesztés
                </a>
                <form method="POST" action="{{ route('admin.trainings.steps.destroy', [$training, $step]) }}"
                      @click.stop onsubmit="return confirm('Töröljük ezt a lépést?')">
                    @csrf @method('DELETE')
                    <button type="submit" class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Törlés</button>
                </form>
                <svg class="w-4 h-4 text-slate-400 transition-transform" :class="open ? 'rotate-180' : ''"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
        </div>
        <div x-show="open" x-cloak class="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-3">
            @if($step->media_path)
                @php $ext = strtolower(pathinfo(parse_url($step->media_path, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION)); @endphp
                <div>
                    <p class="text-xs font-semibold text-slate-500 mb-1">Kérdés melletti media:</p>
                    @if(in_array($ext, ['mp4','webm','mov']))
                        <video src="{{ $step->resolveMediaUrl($step->media_path) }}" class="h-24 rounded-lg" controls></video>
                    @else
                        <img src="{{ $step->resolveMediaUrl($step->media_path) }}" class="h-24 rounded-lg object-contain border border-slate-200" alt="">
                    @endif
                </div>
            @endif
            @if($step->reveal_media_path)
                @php $ext2 = strtolower(pathinfo(parse_url($step->reveal_media_path, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION)); @endphp
                <div>
                    <p class="text-xs font-semibold text-slate-500 mb-1">Helyes válasz utáni media:</p>
                    @if(in_array($ext2, ['mp4','webm','mov']))
                        <video src="{{ $step->resolveMediaUrl($step->reveal_media_path) }}" class="h-24 rounded-lg" controls></video>
                    @else
                        <img src="{{ $step->resolveMediaUrl($step->reveal_media_path) }}" class="h-24 rounded-lg object-contain border border-slate-200" alt="">
                    @endif
                </div>
            @endif
            <div>
                <p class="text-xs font-semibold text-slate-500 mb-2">
                    @if($step->question_type === 'text') Elfogadott válaszok: @else Válaszok: @endif
                </p>
                <div class="space-y-1.5">
                    @foreach($step->answers as $answer)
                    <div class="flex items-center gap-2 text-sm">
                        @if($step->question_type === 'text')
                            <span class="w-4 h-4 text-slate-400 shrink-0 font-mono text-xs">→</span>
                            <span class="text-slate-700 font-mono">{{ $answer->text }}</span>
                        @elseif($answer->is_correct)
                            <svg class="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-green-800 font-medium">{{ $answer->text }}</span>
                        @else
                            <svg class="w-4 h-4 text-slate-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                            <span class="text-slate-600">{{ $answer->text }}</span>
                        @endif
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
    @empty
        <div class="card p-8 text-center text-slate-400 text-sm">Még nincs lépés. Add hozzá az első lépést alább.</div>
    @endforelse

    {{-- Új lépés form --}}
    <div class="card overflow-hidden" x-data="stepForm()">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <h3 class="font-bold text-slate-800">Új lépés hozzáadása</h3>
        </div>
        <form method="POST" action="{{ route('admin.trainings.steps.store', $training) }}"
              enctype="multipart/form-data" class="p-5 space-y-5">
            @csrf
            <input type="hidden" name="question_type" :value="qtype">

            {{-- Kérdés --}}
            <div>
                <label class="form-label">Kérdés <span class="text-red-500">*</span></label>
                <textarea name="question" rows="2" class="form-input resize-none @error('question') border-red-400 @enderror"
                          placeholder="Mit kell tenni, ha...?" required>{{ old('question') }}</textarea>
                @error('question')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Kérdés típusa --}}
            <div>
                <label class="form-label">Kérdés típusa</label>
                <div class="flex gap-2 flex-wrap">
                    <button type="button" @click="setType('radio')"
                            :class="qtype === 'radio'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'"
                            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-12a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                        Rádiógomb
                        <span class="text-xs font-normal opacity-70">1 helyes</span>
                    </button>
                    <button type="button" @click="setType('checkbox')"
                            :class="qtype === 'checkbox'
                                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'"
                            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        Jelölőnégyzet
                        <span class="text-xs font-normal opacity-70">több helyes</span>
                    </button>
                    <button type="button" @click="setType('text')"
                            :class="qtype === 'text'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'"
                            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Szöveges
                        <span class="text-xs font-normal opacity-70">beírás</span>
                    </button>
                </div>
            </div>

            {{-- Media --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @include('admin.trainings._media_field', ['field' => 'media', 'xModel' => 'mediaMode', 'xUrl' => 'mediaUrl', 'label' => 'Kérdés melletti media', 'fileBg' => 'bg-slate-100 text-slate-700'])
                @include('admin.trainings._media_field', ['field' => 'reveal_media', 'xModel' => 'revealMode', 'xUrl' => 'revealUrl', 'label' => 'Helyes válasz utáni media', 'fileBg' => 'bg-indigo-50 text-indigo-700'])
            </div>

            {{-- Válaszok / szövegek --}}
            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="form-label mb-0">
                        <span x-text="qtype === 'text' ? 'Elfogadott válaszok' : 'Válaszok'"></span>
                        <span class="text-red-500">*</span>
                        <span x-show="qtype === 'radio'" class="text-xs text-slate-400 font-normal"> (jelöld be az egyetlen helyeset)</span>
                        <span x-show="qtype === 'checkbox'" class="text-xs text-slate-400 font-normal"> (jelöld be az összes helyeset)</span>
                        <span x-show="qtype === 'text'" class="text-xs text-slate-400 font-normal"> (az összes elfogadott változat)</span>
                    </label>
                    <button type="button" @click="addAnswer()"
                            class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                        + Hozzáadás
                    </button>
                </div>

                {{-- RADIO: egy helyes --}}
                <div x-show="qtype === 'radio'" class="space-y-2">
                    <template x-for="(answer, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                                <input type="radio" name="_correct_radio" :value="idx" x-model="correctIdx"
                                       class="w-4 h-4 text-green-600 border-slate-300">
                                <span class="text-xs text-slate-500">Helyes</span>
                            </label>
                            <input type="text" :name="`answers[${idx}][text]`" x-model="answer.text"
                                   class="form-input flex-1" placeholder="Válasz szövege..." required>
                            <button type="button" @click="removeAnswer(idx)" x-show="answers.length > 2"
                                    class="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <input type="hidden" name="correct" :value="correctIdx">
                </div>

                {{-- CHECKBOX: több helyes --}}
                <div x-show="qtype === 'checkbox'" class="space-y-2">
                    <template x-for="(answer, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                                <input type="checkbox" :value="idx" @change="toggleCorrect(idx)"
                                       :checked="isCorrectCheckbox(idx)"
                                       class="w-4 h-4 text-green-600 rounded border-slate-300">
                                <span class="text-xs text-slate-500">Helyes</span>
                            </label>
                            <input type="text" :name="`answers[${idx}][text]`" x-model="answer.text"
                                   class="form-input flex-1" placeholder="Válasz szövege..." required>
                            <button type="button" @click="removeAnswer(idx)" x-show="answers.length > 2"
                                    class="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <template x-for="idx in correctIdxes" :key="idx">
                        <input type="hidden" name="correct[]" :value="idx">
                    </template>
                </div>

                {{-- TEXT: elfogadott szövegek --}}
                <div x-show="qtype === 'text'" class="space-y-2">
                    <template x-for="(answer, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <span class="text-slate-400 font-mono text-xs shrink-0 w-5">→</span>
                            <input type="text" :name="`answers[${idx}][text]`" x-model="answer.text"
                                   class="form-input flex-1 font-mono text-sm" placeholder="Elfogadott szöveg..." required>
                            <button type="button" @click="removeAnswer(idx)" x-show="answers.length > 1"
                                    class="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <p class="text-xs text-slate-400 mt-1">A beírás nem érzékeny a kis/nagybetűkre és a vezető/záró szóközökre.</p>
                </div>
            </div>

            <div class="pt-1">
                <button type="submit" class="btn-primary">Lépés hozzáadása</button>
            </div>
        </form>
    </div>

</div>

<script>
function stepForm() {
    return {
        qtype:       'radio',
        answers:     [{ text: '' }, { text: '' }],
        correctIdx:  0,
        correctIdxes:[],
        mediaMode:   'file', mediaUrl:   '',
        revealMode:  'file', revealUrl:  '',

        setType(type) {
            this.qtype = type;
            this.correctIdx   = 0;
            this.correctIdxes = [];
            if (type === 'text' && this.answers.length < 1) {
                this.answers = [{ text: '' }];
            } else if (type !== 'text' && this.answers.length < 2) {
                while (this.answers.length < 2) this.answers.push({ text: '' });
            }
        },

        addAnswer() {
            this.answers.push({ text: '' });
        },

        removeAnswer(idx) {
            const min = this.qtype === 'text' ? 1 : 2;
            if (this.answers.length <= min) return;
            this.answers.splice(idx, 1);
            if (this.qtype === 'radio' && this.correctIdx >= this.answers.length) {
                this.correctIdx = 0;
            }
            if (this.qtype === 'checkbox') {
                this.correctIdxes = this.correctIdxes
                    .filter(i => i !== idx)
                    .map(i => i > idx ? i - 1 : i);
            }
        },

        toggleCorrect(idx) {
            if (this.correctIdxes.includes(idx)) {
                this.correctIdxes = this.correctIdxes.filter(i => i !== idx);
            } else {
                this.correctIdxes = [...this.correctIdxes, idx];
            }
        },

        isCorrectCheckbox(idx) {
            return this.correctIdxes.includes(idx);
        },
    };
}
</script>
@endsection
