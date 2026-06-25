@extends('layouts.admin')
@section('title', 'Kérdés szerkesztése')

@section('content')
@php
    $existingType    = $step->question_type ?? 'radio';
    $existingAnswers = $step->answers->map(fn($a) => ['text' => $a->text, 'is_correct' => $a->is_correct])->values();
    $correctIdxes    = $step->answers->map(fn($a, $i) => $a->is_correct ? $i : null)->filter()->values();
@endphp

<div class="max-w-2xl">
    <a href="{{ route('admin.exams.steps.index', $exam) }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Vissza: {{ $exam->title }}
    </a>

    <div class="card p-6"
         x-data="examStepEditForm({{ json_encode($existingType) }}, {{ $existingAnswers->toJson() }}, {{ $correctIdxes->toJson() }})">

        <form method="POST" action="{{ route('admin.exams.steps.update', [$exam, $step]) }}" class="space-y-5">
            @csrf @method('PUT')
            <input type="hidden" name="question_type" :value="qtype">

            {{-- Kérdés --}}
            <div>
                <label class="form-label">Kérdés <span class="text-red-500">*</span></label>
                <textarea name="question" rows="2" class="form-input resize-none" required>{{ old('question', $step->question) }}</textarea>
            </div>

            {{-- Típus --}}
            <div>
                <label class="form-label">Kérdés típusa</label>
                <div class="flex gap-2 flex-wrap">
                    <button type="button" @click="setType('radio')"
                            :class="qtype==='radio' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'"
                            class="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all">
                        Rádiógomb (1 helyes)
                    </button>
                    <button type="button" @click="setType('checkbox')"
                            :class="qtype==='checkbox' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'"
                            class="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all">
                        Jelölőnégyzet (több helyes)
                    </button>
                    <button type="button" @click="setType('text')"
                            :class="qtype==='text' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'"
                            class="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all">
                        Szöveges válasz
                    </button>
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
                                <input type="radio" name="correct" :value="idx"
                                       :checked="correctRadio === idx"
                                       @change="correctRadio = idx"
                                       class="shrink-0 text-amber-500">
                            </template>
                            <template x-if="qtype === 'checkbox'">
                                <input type="checkbox" :value="idx"
                                       :checked="correctCheckboxes.includes(idx)"
                                       @change="toggleCorrect(idx, $event)"
                                       class="shrink-0 text-amber-500">
                            </template>
                            <input type="text" :name="'answers[' + idx + '][text]'"
                                   x-model="ans.text"
                                   class="form-input flex-1 text-sm" required>
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
                <template x-if="qtype === 'radio'">
                    <input type="hidden" name="correct" :value="correctRadio">
                </template>
                <template x-if="qtype === 'checkbox'">
                    <template x-for="c in correctCheckboxes" :key="c">
                        <input type="hidden" name="correct[]" :value="c">
                    </template>
                </template>
            </div>

            <div class="flex gap-3 pt-2">
                <button type="submit" class="btn-primary">Mentés</button>
                <a href="{{ route('admin.exams.steps.index', $exam) }}" class="btn-secondary">Mégse</a>
            </div>
        </form>
    </div>
</div>

<script>
function examStepEditForm(existingType, existingAnswers, correctIdxes) {
    return {
        qtype: existingType,
        answers: existingAnswers.length ? existingAnswers : [{ text: '' }, { text: '' }],
        correctRadio: correctIdxes.length ? correctIdxes[0] : 0,
        correctCheckboxes: correctIdxes,
        setType(t) { this.qtype = t; },
        addAnswer() { this.answers.push({ text: '', is_correct: false }); },
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
