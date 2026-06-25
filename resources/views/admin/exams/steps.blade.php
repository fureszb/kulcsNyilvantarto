@extends('layouts.admin')
@section('title', $exam->title . ' – Kérdések')

@section('header-actions')
    <a href="{{ route('admin.exams.index') }}" class="btn-secondary text-sm">← Vizsgák listája</a>
@endsection

@section('content')
<div class="max-w-3xl space-y-6">

    {{-- Oktatásból import --}}
    @php $trainings = \App\Models\Training::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get(); @endphp
    @if($trainings->count())
    <div class="card p-5" x-data="{ open: false }">
        <button type="button" @click="open = !open"
                class="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Kérdések importálása oktatásból
            <svg class="w-4 h-4 transition-transform" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
        </button>
        <div x-show="open" x-cloak class="mt-4">
            <p class="text-xs text-slate-500 mb-3">Az oktatás összes kérdése és válasza átmásolódik ebbe a vizsgába. A másolatot utána szabadon szerkesztheted.</p>
            <form method="POST" action="{{ route('admin.exams.import', $exam) }}"
                  onsubmit="return confirm('Importálod a kiválasztott oktatás összes kérdését?')">
                @csrf
                <div class="flex items-center gap-3">
                    <select name="training_id" class="form-input flex-1" required>
                        <option value="">Válassz oktatást…</option>
                        @foreach($trainings as $t)
                            <option value="{{ $t->id }}">{{ $t->title }}</option>
                        @endforeach
                    </select>
                    <button type="submit" class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
                        Importálás
                    </button>
                </div>
            </form>
        </div>
    </div>
    @endif

    @if(session('success'))
        <div class="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            {{ session('success') }}
        </div>
    @endif

    {{-- Meglévő kérdések --}}
    @forelse($steps as $step)
    @php
        $typeBadge = ['radio' => ['Rádiógomb','bg-blue-100 text-blue-700'], 'checkbox' => ['Jelölőnégyzet','bg-violet-100 text-violet-700'], 'text' => ['Szöveges','bg-amber-100 text-amber-700']];
        [$typeLabel, $typeClass] = $typeBadge[$step->question_type ?? 'radio'] ?? $typeBadge['radio'];
    @endphp
    <div class="card overflow-hidden" x-data="{ open: false }">
        <div class="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer select-none"
             @click="open = !open">
            <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {{ $loop->iteration }}
                </span>
                <div class="min-w-0">
                    <span class="font-semibold text-slate-800 block truncate">{{ $step->question }}</span>
                    <span class="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full {{ $typeClass }}">{{ $typeLabel }}</span>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs text-slate-400">{{ $step->answers->count() }} válasz</span>
                <a href="{{ route('admin.exams.steps.edit', [$exam, $step]) }}"
                   @click.stop
                   class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                    Szerkesztés
                </a>
                <form method="POST" action="{{ route('admin.exams.steps.destroy', [$exam, $step]) }}"
                      @click.stop onsubmit="return confirm('Töröljük ezt a kérdést?')">
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
        <div class="card p-8 text-center text-slate-400 text-sm">Még nincs kérdés. Add hozzá az első kérdést alább, vagy importáld oktatásból.</div>
    @endforelse

    {{-- Új kérdés form --}}
    <div class="card overflow-hidden" x-data="examStepForm()">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <h3 class="font-bold text-slate-800">Új kérdés hozzáadása</h3>
        </div>
        <form method="POST" action="{{ route('admin.exams.steps.store', $exam) }}" class="p-5 space-y-5">
            @csrf
            <input type="hidden" name="question_type" :value="qtype">

            {{-- Kérdés --}}
            <div>
                <label class="form-label">Kérdés <span class="text-red-500">*</span></label>
                <textarea name="question" rows="2" class="form-input resize-none @error('question') border-red-400 @enderror"
                          placeholder="Kérdés szövege…" required>{{ old('question') }}</textarea>
                @error('question')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Típus --}}
            <div>
                <label class="form-label">Kérdés típusa</label>
                <div class="flex gap-3 mt-1">
                    <template x-for="(label, val) in {radio:'Rádiógomb (1 helyes)',checkbox:'Jelölőnégyzet (több helyes)',text:'Szöveges válasz'}" :key="val">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" :value="val" x-model="qtype" class="text-amber-500">
                            <span class="text-sm text-slate-700" x-text="label"></span>
                        </label>
                    </template>
                </div>
            </div>

            {{-- Válaszok --}}
            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="form-label mb-0">
                        <span x-show="qtype !== 'text'">Válaszlehetőségek</span>
                        <span x-show="qtype === 'text'" x-cloak>Elfogadott válaszok</span>
                        <span class="text-red-500">*</span>
                    </label>
                    <button type="button" @click="addAnswer()"
                            class="text-xs font-semibold text-amber-600 hover:text-amber-800">
                        + Válasz hozzáadása
                    </button>
                </div>
                <div class="space-y-2">
                    <template x-for="(ans, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <template x-if="qtype === 'radio'">
                                <input type="radio" :name="'correct'" :value="idx"
                                       x-model="correctRadio"
                                       class="shrink-0 text-amber-500" title="Helyes válasz">
                            </template>
                            <template x-if="qtype === 'checkbox'">
                                <input type="checkbox" :name="'correct[]'" :value="idx"
                                       @change="toggleCorrect(idx, $event)"
                                       :checked="correctCheckboxes.includes(idx)"
                                       class="shrink-0 text-amber-500" title="Helyes válasz">
                            </template>
                            <input type="text" :name="'answers[' + idx + '][text]'"
                                   x-model="ans.text"
                                   class="form-input flex-1 text-sm"
                                   :placeholder="qtype === 'text' ? 'Elfogadott válasz szövege' : 'Válasz szövege'"
                                   required>
                            <button type="button" @click="removeAnswer(idx)"
                                    x-show="answers.length > 1"
                                    class="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </template>
                </div>
                {{-- Hidden fields for correct answers --}}
                <template x-if="qtype === 'radio'">
                    <input type="hidden" name="correct" :value="correctRadio">
                </template>
                <template x-if="qtype === 'checkbox'">
                    <template x-for="c in correctCheckboxes" :key="c">
                        <input type="hidden" name="correct[]" :value="c">
                    </template>
                </template>
            </div>

            <div class="pt-2">
                <button type="submit" class="btn-primary">Kérdés hozzáadása</button>
            </div>
        </form>
    </div>
</div>

<script>
function examStepForm() {
    return {
        qtype: 'radio',
        answers: [{ text: '' }, { text: '' }],
        correctRadio: 0,
        correctCheckboxes: [],
        addAnswer() { this.answers.push({ text: '' }); },
        removeAnswer(idx) {
            this.answers.splice(idx, 1);
            if (this.correctRadio >= this.answers.length) this.correctRadio = 0;
            this.correctCheckboxes = this.correctCheckboxes.filter(c => c < this.answers.length);
        },
        toggleCorrect(idx, event) {
            if (event.target.checked) {
                if (!this.correctCheckboxes.includes(idx)) this.correctCheckboxes.push(idx);
            } else {
                this.correctCheckboxes = this.correctCheckboxes.filter(c => c !== idx);
            }
        },
    };
}
</script>
@endsection
