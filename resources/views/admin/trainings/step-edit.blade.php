@extends('layouts.admin')
@section('title', 'Lépés szerkesztése')

@section('content')
@php
    $existingType    = $step->question_type ?? 'radio';
    $existingAnswers = $step->answers->map(fn($a) => ['text' => $a->text, 'is_correct' => $a->is_correct])->values();
    $correctIdxes    = $step->answers->map(fn($a, $i) => $a->is_correct ? $i : null)->filter()->values();
    $mediaIsUrl      = \App\Models\TrainingStep::isExternalUrl($step->media_path);
    $revealIsUrl     = \App\Models\TrainingStep::isExternalUrl($step->reveal_media_path);
@endphp

<div class="max-w-2xl">
    <a href="{{ route('admin.trainings.steps.index', $training) }}" class="text-sm text-slate-500 hover:text-blue-700 flex items-center gap-1 mb-5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Vissza: {{ $training->title }}
    </a>

    <div class="card p-6"
         x-data="stepEditForm({{ json_encode($existingType) }}, {{ $existingAnswers->toJson() }}, {{ $correctIdxes->toJson() }}, {{ json_encode($mediaIsUrl ? $step->media_path : '') }}, {{ json_encode($revealIsUrl ? $step->reveal_media_path : '') }})">

        <form method="POST" action="{{ route('admin.trainings.steps.update', [$training, $step]) }}"
              enctype="multipart/form-data" class="space-y-5">
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
                            :class="qtype==='radio' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'"
                            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-12a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                        Rádiógomb <span class="text-xs font-normal opacity-70">1 helyes</span>
                    </button>
                    <button type="button" @click="setType('checkbox')"
                            :class="qtype==='checkbox' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'"
                            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        Jelölőnégyzet <span class="text-xs font-normal opacity-70">több helyes</span>
                    </button>
                    <button type="button" @click="setType('text')"
                            :class="qtype==='text' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'"
                            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Szöveges <span class="text-xs font-normal opacity-70">beírás</span>
                    </button>
                </div>
            </div>

            {{-- Media --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @include('admin.trainings._media_field_edit', [
                    'field'     => 'media',
                    'xModel'    => 'mediaMode',
                    'xUrl'      => 'mediaUrl',
                    'label'     => 'Kérdés melletti media',
                    'fileBg'    => 'bg-slate-100 text-slate-700',
                    'existing'  => $step->media_path,
                    'isUrl'     => $mediaIsUrl,
                    'removeName'=> 'remove_media',
                ])
                @include('admin.trainings._media_field_edit', [
                    'field'     => 'reveal_media',
                    'xModel'    => 'revealMode',
                    'xUrl'      => 'revealUrl',
                    'label'     => 'Helyes válasz utáni media',
                    'fileBg'    => 'bg-indigo-50 text-indigo-700',
                    'existing'  => $step->reveal_media_path,
                    'isUrl'     => $revealIsUrl,
                    'removeName'=> 'remove_reveal',
                ])
            </div>

            {{-- Válaszok --}}
            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="form-label mb-0" x-text="qtype === 'text' ? 'Elfogadott válaszok' : 'Válaszok'"></label>
                    <button type="button" @click="addAnswer()"
                            class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                        + Hozzáadás
                    </button>
                </div>

                {{-- Radio --}}
                <div x-show="qtype === 'radio'" class="space-y-2">
                    <template x-for="(answer, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                                <input type="radio" name="_correct_radio" :value="idx"
                                       :checked="correctIdx == idx" @change="correctIdx = idx"
                                       class="w-4 h-4 text-green-600">
                                <span class="text-xs text-slate-500">Helyes</span>
                            </label>
                            <input type="text" :name="`answers[${idx}][text]`" x-model="answer.text" class="form-input flex-1" required>
                            <button type="button" @click="removeAnswer(idx)" x-show="answers.length > 2"
                                    class="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <input type="hidden" name="correct" :value="correctIdx">
                </div>

                {{-- Checkbox --}}
                <div x-show="qtype === 'checkbox'" class="space-y-2">
                    <template x-for="(answer, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                                <input type="checkbox" :value="idx" @change="toggleCorrect(idx)"
                                       :checked="isCorrectCheckbox(idx)"
                                       class="w-4 h-4 text-green-600 rounded border-slate-300">
                                <span class="text-xs text-slate-500">Helyes</span>
                            </label>
                            <input type="text" :name="`answers[${idx}][text]`" x-model="answer.text" class="form-input flex-1" required>
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

                {{-- Text --}}
                <div x-show="qtype === 'text'" class="space-y-2">
                    <template x-for="(answer, idx) in answers" :key="idx">
                        <div class="flex items-center gap-2">
                            <span class="text-slate-400 font-mono text-xs shrink-0 w-5">→</span>
                            <input type="text" :name="`answers[${idx}][text]`" x-model="answer.text"
                                   class="form-input flex-1 font-mono text-sm" required>
                            <button type="button" @click="removeAnswer(idx)" x-show="answers.length > 1"
                                    class="w-8 h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <p class="text-xs text-slate-400 mt-1">Kis/nagybetű és szóköz nem számít.</p>
                </div>
            </div>

            <div class="flex gap-3 pt-1">
                <button type="submit" class="btn-primary">Mentés</button>
                <a href="{{ route('admin.trainings.steps.index', $training) }}" class="btn-secondary">Mégse</a>
            </div>
        </form>
    </div>
</div>

<script>
function stepEditForm(existingType, existingAnswers, existingCorrectIdxes, existingMediaUrl, existingRevealUrl) {
    const correctRadioIdx = existingType === 'radio'
        ? (existingAnswers.findIndex(a => a.is_correct) >= 0 ? existingAnswers.findIndex(a => a.is_correct) : 0)
        : 0;

    return {
        qtype:        existingType,
        answers:      existingAnswers,
        correctIdx:   correctRadioIdx,
        correctIdxes: existingCorrectIdxes,
        mediaMode:    existingMediaUrl  ? 'url' : 'file',
        mediaUrl:     existingMediaUrl  || '',
        revealMode:   existingRevealUrl ? 'url' : 'file',
        revealUrl:    existingRevealUrl || '',

        setType(type) {
            this.qtype = type;
            this.correctIdx   = 0;
            this.correctIdxes = [];
            if (type !== 'text' && this.answers.length < 2) {
                while (this.answers.length < 2) this.answers.push({ text: '', is_correct: false });
            }
        },

        addAnswer() {
            this.answers.push({ text: '', is_correct: false });
        },

        removeAnswer(idx) {
            const min = this.qtype === 'text' ? 1 : 2;
            if (this.answers.length <= min) return;
            this.answers.splice(idx, 1);
            if (this.qtype === 'radio' && this.correctIdx >= this.answers.length) this.correctIdx = 0;
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
