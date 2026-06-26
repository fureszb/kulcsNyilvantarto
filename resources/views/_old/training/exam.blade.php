@extends('layouts.app')
@section('title', 'Vizsga – ' . $training->title)

@section('content')
<div x-data="examPlayer({{ $stepsData->toJson() }}, '{{ route('training.exam.result', $training) }}', '{{ csrf_token() }}', {{ json_encode(auth('tenant')->user()->name) }}, {{ json_encode(auth('tenant')->user()->email ?? '') }})">

    {{-- Hero --}}
    <div class="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image: linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px); background-size: 32px 32px;"></div>
        <div class="relative px-8 py-7">
            <nav class="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <a href="{{ route('home') }}" class="hover:text-slate-300 transition-colors">Főoldal</a>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                <a href="{{ route('training.index') }}" class="hover:text-slate-300 transition-colors">Oktatások</a>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                <span class="text-slate-400">{{ $training->title }}</span>
            </nav>
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <h1 class="text-2xl font-extrabold text-white tracking-tight">{{ $training->title }}</h1>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        Vizsga
                    </span>
                </div>
                <span class="text-sm text-slate-400 shrink-0 font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
                      x-show="started && !completed"
                      x-text="`${currentStep + 1} / ${steps.length} kérdés`"></span>
                <span class="text-sm font-bold text-emerald-400 shrink-0" x-show="completed">Befejezve</span>
            </div>
            <template x-if="started && !completed">
                <div class="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-400 rounded-full transition-all duration-500"
                         :style="`width: ${((currentStep + 1) / steps.length) * 100}%`"></div>
                </div>
            </template>
            <template x-if="completed">
                <div class="mt-4 h-1.5 bg-white/10 rounded-full">
                    <div class="h-full bg-emerald-400 rounded-full w-full transition-all duration-700"></div>
                </div>
            </template>
        </div>
    </div>

    {{-- ─── START KÉPERNYŐ ─────────────────────────────────────────────────────── --}}
    <div x-show="!started" class="max-w-md mx-auto">
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <div class="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            </div>
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Vizsga megkezdése</h2>
            @if($training->description)
                <p class="text-sm text-slate-500 mb-4 leading-relaxed">{{ $training->description }}</p>
            @else
                <p class="text-sm text-slate-500 mb-4">{{ $stepsData->count() }} kérdéses vizsga.</p>
            @endif
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <div class="flex items-start gap-2.5">
                    <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-sm text-amber-800 leading-relaxed">Vizsga módban <strong>nem látja menet közben</strong>, hogy helyesen válaszolt-e. A helyes válaszok és az értékelés csak a végén jelennek meg.</p>
                </div>
            </div>
            <div class="flex items-center gap-3 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-sm text-slate-600 font-medium" x-text="participantName"></span>
            </div>
            <button @click="startExam()"
                    class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                Vizsga megkezdése
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
        </div>
    </div>

    {{-- ─── KÉRDÉSEK ────────────────────────────────────────────────────────────── --}}
    <template x-if="started && !completed">
        <div>
            <template x-for="(step, idx) in steps" :key="step.id">
                <div x-show="currentStep === idx" x-cloak>
                    <div class="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">

                        <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2"
                           x-text="`${idx + 1}. kérdés / ${steps.length}`"></p>
                        <h2 class="text-lg font-bold text-slate-800 mb-6 leading-snug" x-text="step.question"></h2>

                        {{-- RADIO --}}
                        <template x-if="step.question_type === 'radio'">
                            <div class="space-y-3">
                                <template x-for="answer in step.answers" :key="answer.id">
                                    <button
                                        @click="selectRadio(answer.id, answer.is_correct)"
                                        :disabled="answered"
                                        :class="{
                                            'border-amber-400 bg-amber-50 text-amber-900': answered && selectedAnswerId === answer.id,
                                            'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 cursor-pointer': !answered
                                        }"
                                        class="w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3">
                                        <span class="w-5 h-5 rounded-full border-2 shrink-0"
                                              :class="{
                                                  'border-amber-400 bg-amber-400': answered && selectedAnswerId === answer.id,
                                                  'border-slate-300': !answered || selectedAnswerId !== answer.id
                                              }"></span>
                                        <span x-text="answer.text"></span>
                                    </button>
                                </template>
                            </div>
                        </template>

                        {{-- CHECKBOX --}}
                        <template x-if="step.question_type === 'checkbox'">
                            <div class="space-y-4">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jelöljön meg minden helyes választ:</p>
                                <div class="space-y-3">
                                    <template x-for="answer in step.answers" :key="answer.id">
                                        <button
                                            @click="toggleCheckbox(answer.id)"
                                            :disabled="answered"
                                            :class="{
                                                'border-amber-400 bg-amber-50 text-amber-900': checkedAnswerIds.includes(answer.id) && !answered,
                                                'border-amber-400 bg-amber-50 text-amber-900': answered && checkedAnswerIds.includes(answer.id),
                                                'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 cursor-pointer': !answered && !checkedAnswerIds.includes(answer.id)
                                            }"
                                            class="w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3">
                                            <span class="w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center"
                                                  :class="{
                                                      'border-amber-400 bg-amber-400': checkedAnswerIds.includes(answer.id),
                                                      'border-slate-300': !checkedAnswerIds.includes(answer.id)
                                                  }">
                                                <template x-if="checkedAnswerIds.includes(answer.id)">
                                                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                                </template>
                                            </span>
                                            <span x-text="answer.text"></span>
                                        </button>
                                    </template>
                                </div>
                                <template x-if="!answered">
                                    <button @click="submitCheckbox()"
                                            :disabled="checkedAnswerIds.length === 0"
                                            class="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer">
                                        Válasz leadása
                                    </button>
                                </template>
                            </div>
                        </template>

                        {{-- TEXT --}}
                        <template x-if="step.question_type === 'text'">
                            <div class="space-y-3">
                                <input type="text" x-model="textInput"
                                       @keydown.enter.prevent="!answered && textInput.trim() ? submitText() : null"
                                       :disabled="answered"
                                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400
                                              focus:border-amber-400 focus:bg-white focus:outline-none transition"
                                       placeholder="Írja be a válaszát...">
                                <template x-if="!answered">
                                    <button @click="submitText()"
                                            :disabled="!textInput.trim()"
                                            class="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer">
                                        Válasz leadása
                                    </button>
                                </template>
                            </div>
                        </template>

                        <template x-if="advancing">
                            <p class="text-xs text-slate-400 mt-4 text-center animate-pulse">Következő kérdés...</p>
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </template>

    {{-- ─── EREDMÉNY ────────────────────────────────────────────────────────────── --}}
    <div x-show="completed" x-cloak class="space-y-5">

        {{-- Összesítő kártya --}}
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-8 py-6"
                 :class="scorePercent >= 70 ? 'bg-gradient-to-r from-emerald-600 to-green-500' : (scorePercent >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-600 to-red-500')">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-white/70 text-sm font-semibold">Vizsga teljesítve</p>
                        <h2 class="text-2xl font-extrabold text-white mt-0.5">{{ $training->title }}</h2>
                        <p class="text-white/70 text-sm mt-1">Vizsgázó: <span class="text-white font-semibold" x-text="participantName"></span></p>
                    </div>
                    <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-3 divide-x divide-slate-100">
                <div class="px-6 py-5 text-center">
                    <p class="text-3xl font-extrabold text-slate-800" x-text="score + ' / ' + steps.length"></p>
                    <p class="text-xs font-semibold text-slate-500 mt-1">helyes válasz</p>
                </div>
                <div class="px-6 py-5 text-center">
                    <p class="text-3xl font-extrabold"
                       :class="scorePercent >= 70 ? 'text-emerald-600' : (scorePercent >= 50 ? 'text-amber-600' : 'text-red-600')"
                       x-text="scorePercent + '%'"></p>
                    <p class="text-xs font-semibold text-slate-500 mt-1">teljesítmény</p>
                </div>
                <div class="px-6 py-5 text-center">
                    <p class="text-3xl font-extrabold text-slate-400" x-text="completedAt || '...'"></p>
                    <p class="text-xs font-semibold text-slate-500 mt-1">elvégezve</p>
                </div>
            </div>
        </div>

        {{-- Részletes kiértékelés --}}
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <h3 class="font-bold text-slate-800">Részletes kiértékelés</h3>
            </div>
            <div class="divide-y divide-slate-100">
                <template x-for="(ea, idx) in examAnswers" :key="idx">
                    <div class="p-5" :class="ea.isCorrect ? 'bg-green-50/30' : 'bg-red-50/30'">
                        <div class="flex items-start gap-3 mb-4">
                            <span class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                                  :class="ea.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
                                  x-text="idx + 1"></span>
                            <p class="font-semibold text-slate-800 text-sm" x-text="ea.question"></p>
                        </div>

                        {{-- Radio / Checkbox kiértékelés --}}
                        <template x-if="steps[idx].question_type !== 'text'">
                            <div class="ml-9 space-y-1.5">
                                <template x-for="answer in steps[idx].answers" :key="answer.id">
                                    <div class="px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                                         :class="{
                                             'bg-green-100 border border-green-300 text-green-800': answer.is_correct && ea.selectedIds.includes(answer.id),
                                             'bg-green-50 border border-green-200 text-green-700': answer.is_correct && !ea.selectedIds.includes(answer.id),
                                             'bg-red-100 border border-red-300 text-red-800': !answer.is_correct && ea.selectedIds.includes(answer.id),
                                             'bg-slate-50 border border-slate-200 text-slate-400': !answer.is_correct && !ea.selectedIds.includes(answer.id)
                                         }">
                                        <template x-if="answer.is_correct && ea.selectedIds.includes(answer.id)">
                                            <svg class="w-3.5 h-3.5 shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                        </template>
                                        <template x-if="answer.is_correct && !ea.selectedIds.includes(answer.id)">
                                            <svg class="w-3.5 h-3.5 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/></svg>
                                        </template>
                                        <template x-if="!answer.is_correct && ea.selectedIds.includes(answer.id)">
                                            <svg class="w-3.5 h-3.5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                                        </template>
                                        <template x-if="!answer.is_correct && !ea.selectedIds.includes(answer.id)">
                                            <span class="w-3.5 h-3.5 shrink-0"></span>
                                        </template>
                                        <span x-text="answer.text" class="flex-1"></span>
                                        <span x-show="answer.is_correct && !ea.selectedIds.includes(answer.id)" class="text-xs font-semibold text-green-600 whitespace-nowrap">Helyes válasz</span>
                                        <span x-show="ea.selectedIds.includes(answer.id) && answer.is_correct" class="text-xs font-semibold text-green-700 whitespace-nowrap">Az Ön válasza ✓</span>
                                        <span x-show="ea.selectedIds.includes(answer.id) && !answer.is_correct" class="text-xs font-semibold text-red-600 whitespace-nowrap">Az Ön válasza ✗</span>
                                    </div>
                                </template>
                            </div>
                        </template>

                        {{-- Text kiértékelés --}}
                        <template x-if="steps[idx].question_type === 'text'">
                            <div class="ml-9 space-y-2">
                                <div class="px-3 py-2.5 rounded-lg text-sm border flex items-center gap-2"
                                     :class="ea.isCorrect ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'">
                                    <span class="text-xs font-bold uppercase shrink-0" :class="ea.isCorrect ? 'text-green-600' : 'text-red-600'">Az Ön válasza:</span>
                                    <span class="font-mono" x-text="ea.textInput"></span>
                                    <template x-if="ea.isCorrect">
                                        <svg class="w-4 h-4 text-green-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                    </template>
                                </div>
                                <template x-if="!ea.isCorrect">
                                    <div class="px-3 py-2.5 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800 flex items-center gap-2">
                                        <span class="text-xs font-bold uppercase text-green-600 shrink-0">Helyes válasz:</span>
                                        <span class="font-mono" x-text="steps[idx].answers.map(a => a.text).join(' / ')"></span>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <a href="{{ route('training.index') }}"
               class="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Vissza az oktatásokhoz
            </a>
            <button @click="restart()"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Újra
            </button>
        </div>
    </div>

</div>

<script>
function examPlayer(stepsData, submitUrl, csrfToken, authName, authEmail) {
    return {
        steps:            stepsData,
        started:          false,
        currentStep:      0,
        completed:        false,
        advancing:        false,

        participantName:  authName,
        participantEmail: authEmail,

        selectedAnswerId: null,
        checkedAnswerIds: [],
        textInput:        '',
        answered:         false,

        examAnswers:      [],
        results:          [],
        completedAt:      '',
        submitError:      '',
        score:            0,

        get scorePercent() {
            return this.steps.length > 0 ? Math.round((this.score / this.steps.length) * 100) : 0;
        },

        startExam() {
            this.started = true;
        },

        selectRadio(answerId, isCorrect) {
            if (this.answered || this.advancing) return;
            this.selectedAnswerId = answerId;
            this.answered         = true;
            this.advancing        = true;
            this.recordAnswer(isCorrect, [answerId], '');
            setTimeout(() => { this.advancing = false; this.next(); }, 500);
        },

        toggleCheckbox(answerId) {
            if (this.answered) return;
            if (this.checkedAnswerIds.includes(answerId)) {
                this.checkedAnswerIds = this.checkedAnswerIds.filter(id => id !== answerId);
            } else {
                this.checkedAnswerIds = [...this.checkedAnswerIds, answerId];
            }
        },

        submitCheckbox() {
            if (this.answered || this.checkedAnswerIds.length === 0) return;
            const step       = this.steps[this.currentStep];
            const correctIds = step.answers.filter(a => a.is_correct).map(a => a.id).sort((a,b) => a - b);
            const selected   = [...this.checkedAnswerIds].sort((a,b) => a - b);
            const isCorrect  = JSON.stringify(correctIds) === JSON.stringify(selected);
            this.answered    = true;
            this.advancing   = true;
            this.recordAnswer(isCorrect, this.checkedAnswerIds, '');
            setTimeout(() => { this.advancing = false; this.next(); }, 500);
        },

        submitText() {
            if (this.answered || !this.textInput.trim()) return;
            const step       = this.steps[this.currentStep];
            const acceptable = step.answers.map(a => a.text.trim().toLowerCase());
            const isCorrect  = acceptable.includes(this.textInput.trim().toLowerCase());
            this.answered    = true;
            this.advancing   = true;
            this.recordAnswer(isCorrect, [], this.textInput);
            setTimeout(() => { this.advancing = false; this.next(); }, 500);
        },

        recordAnswer(isCorrect, selectedIds, textInput) {
            this.examAnswers.push({
                question:    this.steps[this.currentStep].question,
                isCorrect:   isCorrect,
                selectedIds: selectedIds,
                textInput:   textInput,
            });
        },

        next() {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.resetStep();
            } else {
                this.score   = this.examAnswers.filter(a => a.isCorrect).length;
                this.results = this.examAnswers.map(a => ({ question: a.question, attempts: 1, correct: a.isCorrect }));
                this.completed = true;
                this.submitResult();
            }
        },

        resetStep() {
            this.selectedAnswerId = null;
            this.checkedAnswerIds = [];
            this.textInput        = '';
            this.answered         = false;
        },

        async submitResult() {
            try {
                const resp = await fetch(submitUrl, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                    body: JSON.stringify({ name: this.participantName, email: this.participantEmail || null, results: this.results }),
                });
                if (!resp.ok) throw new Error();
                const data       = await resp.json();
                this.completedAt = data.completedAt ?? '';
            } catch {
                this.submitError = 'Az eredmény mentése sikertelen.';
                this.completedAt = new Date().toLocaleString('hu-HU', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).replace(',', '');
            }
        },

        restart() {
            this.started          = false;
            this.currentStep      = 0;
            this.completed        = false;
            this.advancing        = false;
            this.examAnswers      = [];
            this.results          = [];
            this.completedAt      = '';
            this.submitError      = '';
            this.score            = 0;
            this.participantName  = authName;
            this.participantEmail = authEmail;
            this.resetStep();
        },
    };
}
</script>
@endsection
