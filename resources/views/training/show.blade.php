@extends('layouts.app')
@section('title', $training->title)

@section('content')
<div x-data="trainingPlayer({{ $stepsData->toJson() }}, '{{ route('training.result', $training) }}', '{{ csrf_token() }}')">

    {{-- Fejléc hero --}}
    <div class="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
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
                <h1 class="text-2xl font-extrabold text-white tracking-tight">{{ $training->title }}</h1>
                <span class="text-sm text-slate-400 shrink-0 font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
                      x-show="started && !completed"
                      x-text="`${currentStep + 1} / ${steps.length} lépés`"></span>
                <span class="text-sm font-bold text-emerald-400 shrink-0" x-show="completed">
                    Befejezve
                </span>
            </div>
            <template x-if="started && !completed">
                <div class="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-400 rounded-full transition-all duration-500"
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

    {{-- ─── START KÉPERNYŐ ────────────────────────────────────────────────────── --}}
    <div x-show="!started" class="max-w-md mx-auto">
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <div class="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5">
                <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
            </div>
            <h2 class="text-xl font-extrabold text-slate-900 mb-1">Oktatás megkezdése</h2>
            @if($training->description)
                <p class="text-sm text-slate-500 mb-6 leading-relaxed">{{ $training->description }}</p>
            @else
                <p class="text-sm text-slate-400 mb-6">{{ $stepsData->count() }} kérdéses oktatás. Az eredményt emailben is elküldjük.</p>
            @endif
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Teljes neve <span class="text-red-500">*</span></label>
                    <input type="text" x-model="participantName" @keydown.enter.prevent="startTraining()"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                           placeholder="Pl. Kovács János" autofocus>
                    <p x-show="nameError" class="text-red-500 text-xs mt-1">Adja meg a nevét a folytatáshoz.</p>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                        Email-cím <span class="text-xs text-slate-400 font-normal">(opcionális – az eredményt ide is elküldjük)</span>
                    </label>
                    <input type="email" x-model="participantEmail" @keydown.enter.prevent="startTraining()"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400
                                  focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                           placeholder="nev@pelda.hu">
                </div>
                <div class="pt-1">
                    <button @click="startTraining()"
                            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        Oktatás megkezdése
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- ─── KIÉRTÉKELŐ LAP ────────────────────────────────────────────────────── --}}
    <div x-show="completed" x-cloak class="space-y-5">
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-indigo-200 text-sm font-semibold">Oktatás teljesítve!</p>
                        <h2 class="text-2xl font-extrabold text-white mt-0.5">{{ $training->title }}</h2>
                        <p class="text-indigo-200 text-sm mt-1">Kitöltő: <span class="text-white font-semibold" x-text="participantName"></span></p>
                    </div>
                    <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                        </svg>
                    </div>
                </div>
                <div class="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 w-fit">
                    <svg class="w-4 h-4 text-indigo-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <template x-if="completedAt">
                        <span class="text-sm font-semibold text-white" x-text="'Elvégezve: ' + completedAt"></span>
                    </template>
                    <template x-if="!completedAt">
                        <span class="text-sm text-indigo-200">Mentés folyamatban...</span>
                    </template>
                </div>
            </div>
            <div class="grid grid-cols-2 divide-x divide-slate-100">
                <div class="px-8 py-5 text-center">
                    <p class="text-3xl font-extrabold text-green-600" x-text="firstTryCount + '/' + steps.length"></p>
                    <p class="text-xs font-semibold text-slate-500 mt-1">első kísérletből helyes</p>
                </div>
                <div class="px-8 py-5 text-center">
                    <p class="text-3xl font-extrabold text-indigo-600" x-text="steps.length + '/' + steps.length"></p>
                    <p class="text-xs font-semibold text-slate-500 mt-1">teljesített lépés</p>
                </div>
            </div>
        </div>

        {{-- Email státusz --}}
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 space-y-2">
            <p class="text-sm font-semibold text-slate-700">Email értesítések</p>
            <template x-if="participantEmail">
                <div class="flex items-center gap-2 text-sm" :class="submitError ? 'text-red-600' : 'text-green-700'">
                    <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <template x-if="!submitError"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></template>
                        <template x-if="submitError"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></template>
                    </svg>
                    <span x-show="!submitError">Eredmény elküldve: <strong x-text="participantEmail"></strong></span>
                    <span x-show="submitError" x-text="submitError"></span>
                </div>
            </template>
            <template x-if="!participantEmail">
                <p class="text-sm text-slate-400">Nem adott meg email-t – az eredmény nem lett elküldve Önnek.</p>
            </template>
            <div class="flex items-center gap-2 text-sm text-slate-500">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                A felelős személy automatikusan értesítve lett az eredményről.
            </div>
        </div>

        {{-- Eredménytábla --}}
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <h3 class="font-bold text-slate-800">Részletes eredmény</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-8">#</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kérdés</th>
                            <th class="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Kísérletek</th>
                            <th class="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Eredmény</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="(r, idx) in results" :key="idx">
                            <tr class="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                <td class="px-5 py-3.5 text-sm text-slate-400" x-text="idx + 1"></td>
                                <td class="px-5 py-3.5 text-sm text-slate-700 font-medium" x-text="r.question"></td>
                                <td class="px-5 py-3.5 text-center">
                                    <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                                          :class="r.attempts === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                                          x-text="r.attempts + '×'"></span>
                                </td>
                                <td class="px-5 py-3.5 text-center">
                                    <template x-if="r.correct !== false">
                                        <span class="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                        </span>
                                    </template>
                                    <template x-if="r.correct === false">
                                        <span class="inline-flex items-center justify-center w-6 h-6 bg-red-500 rounded-full">
                                            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                                        </span>
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <a href="{{ route('training.index') }}"
               class="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                Vissza az oktatásokhoz
            </a>
            <button @click="restart()"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Újra elvégzés
            </button>
        </div>
    </div>

    {{-- ─── LÉPÉSEK ────────────────────────────────────────────────────────────── --}}
    <template x-if="started && !completed">
        <div>
            <template x-for="(step, idx) in steps" :key="step.id">
                <div x-show="currentStep === idx" x-cloak>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {{-- Bal: kérdés + media --}}
                        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                            <h2 class="text-lg font-bold text-slate-800 leading-snug" x-text="step.question"></h2>

                            <template x-if="step.media_url">
                                <div class="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                                    <template x-if="step.media_type === 'video'">
                                        <video :src="step.media_url" class="w-full max-h-64 object-contain" controls loop></video>
                                    </template>
                                    <template x-if="step.media_type !== 'video'">
                                        <img :src="step.media_url" class="w-full max-h-64 object-contain" alt="">
                                    </template>
                                </div>
                            </template>

                            {{-- Reveal --}}
                            <template x-if="step.reveal_url && isCorrect">
                                <div class="rounded-xl overflow-hidden border-2 border-green-300 bg-green-50">
                                    <div class="px-3 py-2 bg-green-100 border-b border-green-200 flex items-center gap-1.5">
                                        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                        <span class="text-xs font-semibold text-green-700">Helyes! Nézze meg a demonstrációt:</span>
                                    </div>
                                    <template x-if="step.reveal_type === 'video'">
                                        <video :src="step.reveal_url" class="w-full max-h-56 object-contain" autoplay loop controls x-ref="reveal"></video>
                                    </template>
                                    <template x-if="step.reveal_type !== 'video'">
                                        <img :src="step.reveal_url" class="w-full max-h-56 object-contain" alt="">
                                    </template>
                                </div>
                            </template>
                        </div>

                        {{-- Jobb: válasz UI --}}
                        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between gap-4">

                            {{-- RADIO --}}
                            <template x-if="step.question_type === 'radio'">
                                <div class="flex flex-col gap-4">
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Válasszon egyet:</p>
                                    <div class="flex flex-col gap-3">
                                        <template x-for="answer in step.answers" :key="answer.id">
                                            <button
                                                @click="selectRadio(answer.id, answer.is_correct)"
                                                :disabled="isCorrect"
                                                :class="{
                                                    'border-green-400 bg-green-50 text-green-800 shadow-md shadow-green-100': isCorrect && answer.is_correct,
                                                    'border-red-300 bg-red-50 text-red-700': wrongAnswers.includes(answer.id),
                                                    'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer': !isCorrect && !wrongAnswers.includes(answer.id)
                                                }"
                                                class="w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3">
                                                <span class="w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold"
                                                      :class="{
                                                          'border-green-500 bg-green-500 text-white': isCorrect && answer.is_correct,
                                                          'border-red-400 bg-red-100 text-red-600': wrongAnswers.includes(answer.id),
                                                          'border-slate-300': !isCorrect && !wrongAnswers.includes(answer.id)
                                                      }">
                                                    <template x-if="isCorrect && answer.is_correct">
                                                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                                    </template>
                                                    <template x-if="wrongAnswers.includes(answer.id) && !answer.is_correct">
                                                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                                                    </template>
                                                </span>
                                                <span x-text="answer.text"></span>
                                            </button>
                                        </template>
                                    </div>
                                    <template x-if="wrongAnswers.length > 0 && !isCorrect">
                                        <p class="text-sm text-red-600 font-medium text-center">Helytelen válasz – próbálja újra!</p>
                                    </template>
                                </div>
                            </template>

                            {{-- CHECKBOX --}}
                            <template x-if="step.question_type === 'checkbox'">
                                <div class="flex flex-col gap-4">
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jelölje be az összes helyes választ:</p>
                                    <div class="flex flex-col gap-3">
                                        <template x-for="answer in step.answers" :key="answer.id">
                                            <button
                                                @click="toggleCheckbox(answer.id)"
                                                :disabled="isCorrect"
                                                :class="{
                                                    'border-green-400 bg-green-50 text-green-800': isCorrect && answer.is_correct,
                                                    'border-indigo-400 bg-indigo-50 text-indigo-800': !isCorrect && checkedAnswers.includes(answer.id) && !wrongAnswers.includes(answer.id),
                                                    'border-red-300 bg-red-50 text-red-700': wrongAnswers.includes(answer.id),
                                                    'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer': !isCorrect && !checkedAnswers.includes(answer.id) && !wrongAnswers.includes(answer.id)
                                                }"
                                                class="w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium text-sm transition-all flex items-center gap-3">
                                                <span class="w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center text-xs font-bold"
                                                      :class="{
                                                          'border-green-500 bg-green-500 text-white': isCorrect && answer.is_correct,
                                                          'border-indigo-500 bg-indigo-500 text-white': !isCorrect && checkedAnswers.includes(answer.id) && !wrongAnswers.includes(answer.id),
                                                          'border-red-400 bg-red-100 text-red-600': wrongAnswers.includes(answer.id),
                                                          'border-slate-300': !isCorrect && !checkedAnswers.includes(answer.id) && !wrongAnswers.includes(answer.id)
                                                      }">
                                                    <template x-if="isCorrect && answer.is_correct">
                                                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                                    </template>
                                                    <template x-if="!isCorrect && checkedAnswers.includes(answer.id)">
                                                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                                    </template>
                                                </span>
                                                <span x-text="answer.text"></span>
                                            </button>
                                        </template>
                                    </div>
                                    <template x-if="!isCorrect">
                                        <div class="flex flex-col gap-2">
                                            <button @click="checkCheckbox()"
                                                    :disabled="checkedAnswers.length === 0"
                                                    class="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer">
                                                Ellenőrzés
                                            </button>
                                            <template x-if="checkboxError">
                                                <p class="text-sm text-red-600 font-medium text-center" x-text="checkboxError"></p>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </template>

                            {{-- TEXT --}}
                            <template x-if="step.question_type === 'text'">
                                <div class="flex flex-col gap-4">
                                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Írja be a választ:</p>
                                    <div class="flex flex-col gap-3">
                                        <input type="text" x-model="textInput"
                                               @keydown.enter.prevent="!textSubmitted && textInput.trim() ? submitText() : null"
                                               :disabled="textSubmitted"
                                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400
                                                      focus:border-indigo-400 focus:bg-white focus:outline-none transition"
                                               placeholder="Írja be a válaszát...">
                                        <template x-if="!textSubmitted">
                                            <button @click="submitText()"
                                                    :disabled="!textInput.trim()"
                                                    class="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer">
                                                Tovább
                                            </button>
                                        </template>
                                        <template x-if="textSubmitted">
                                            <div class="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                                                <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                <span class="font-semibold text-slate-700 font-mono" x-text="textInput"></span>
                                                <span class="text-xs text-slate-400 ml-auto">Rögzítve</span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>

                            {{-- Tovább gomb (közös) --}}
                            <template x-if="isCorrect || (step.question_type === 'text' && textSubmitted)">
                                <button @click="next()"
                                        class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                    <span x-text="currentStep < steps.length - 1 ? 'Következő lépés' : 'Befejezés és kiértékelés'"></span>
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </template>
                        </div>

                    </div>
                </div>
            </template>
        </div>
    </template>

</div>

<script>
function trainingPlayer(stepsData, submitUrl, csrfToken) {
    return {
        steps:            stepsData,
        started:          false,
        currentStep:      0,
        isCorrect:        false,
        completed:        false,
        attemptsPerStep:  [],

        // radio
        wrongAnswers:     [],

        // checkbox
        checkedAnswers:   [],
        checkboxError:    '',

        // text
        textInput:        '',
        textError:        '',
        textWrongAttempts:[],
        textSubmitted:    false,
        textCorrect:      false,

        // participant
        participantName:  '',
        participantEmail: '',
        nameError:        false,

        // result
        results:          [],
        completedAt:      '',
        submitError:      '',

        init() {
            this.attemptsPerStep = stepsData.map(() => 0);
        },

        get firstTryCount() {
            return this.results.filter(r => r.attempts === 1 && r.correct !== false).length;
        },

        startTraining() {
            if (!this.participantName.trim()) { this.nameError = true; return; }
            this.nameError = false;
            this.started   = true;
        },

        // ── Radio ──────────────────────────────────────────────────────────────
        selectRadio(answerId, correct) {
            if (this.isCorrect) return;
            if (correct) {
                this.isCorrect = true;
                this.$nextTick(() => {
                    const vid = document.querySelector('[x-ref="reveal"]');
                    if (vid) vid.play().catch(() => {});
                });
            } else {
                this.attemptsPerStep[this.currentStep]++;
                this.wrongAnswers = [...this.wrongAnswers, answerId];
            }
        },

        // ── Checkbox ───────────────────────────────────────────────────────────
        toggleCheckbox(answerId) {
            if (this.isCorrect) return;
            if (this.checkedAnswers.includes(answerId)) {
                this.checkedAnswers = this.checkedAnswers.filter(id => id !== answerId);
            } else {
                this.checkedAnswers = [...this.checkedAnswers, answerId];
            }
        },

        checkCheckbox() {
            if (this.isCorrect || this.checkedAnswers.length === 0) return;
            const step       = this.steps[this.currentStep];
            const correctIds = step.answers.filter(a => a.is_correct).map(a => a.id).sort((a,b) => a-b);
            const selected   = [...this.checkedAnswers].sort((a,b) => a-b);
            const ok         = JSON.stringify(correctIds) === JSON.stringify(selected);

            if (ok) {
                this.isCorrect    = true;
                this.checkboxError= '';
                this.$nextTick(() => {
                    const vid = document.querySelector('[x-ref="reveal"]');
                    if (vid) vid.play().catch(() => {});
                });
            } else {
                this.attemptsPerStep[this.currentStep]++;
                const wrongSelected = this.checkedAnswers.filter(id => !correctIds.includes(id));
                this.wrongAnswers   = [...new Set([...this.wrongAnswers, ...wrongSelected])];
                this.checkboxError  = 'Nem a megfelelő kombináció – próbálja újra!';
                this.checkedAnswers = [];
            }
        },

        // ── Text ───────────────────────────────────────────────────────────────
        submitText() {
            if (this.textSubmitted || !this.textInput.trim()) return;
            const step       = this.steps[this.currentStep];
            const acceptable = step.answers.map(a => a.text.trim().toLowerCase());
            this.textCorrect  = acceptable.includes(this.textInput.trim().toLowerCase());
            this.textSubmitted = true;
        },

        // ── Navigation ─────────────────────────────────────────────────────────
        next() {
            const step = this.steps[this.currentStep];
            this.results.push({
                question: step.question,
                attempts: this.attemptsPerStep[this.currentStep] + 1,
                correct:  step.question_type === 'text' ? this.textCorrect : true,
            });

            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.resetStep();
            } else {
                this.completed = true;
                this.submitResult();
            }
        },

        resetStep() {
            this.isCorrect        = false;
            this.wrongAnswers     = [];
            this.checkedAnswers   = [];
            this.checkboxError    = '';
            this.textInput        = '';
            this.textError        = '';
            this.textWrongAttempts= [];
            this.textSubmitted    = false;
            this.textCorrect      = false;
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
                this.submitError = 'Az eredmény mentése sikertelen – kérjük jelezze az adminisztrátornak.';
                this.completedAt = new Date().toLocaleString('hu-HU', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).replace(',','');
            }
        },

        restart() {
            this.currentStep      = 0;
            this.started          = false;
            this.completed        = false;
            this.attemptsPerStep  = this.steps.map(() => 0);
            this.results          = [];
            this.participantName  = '';
            this.participantEmail = '';
            this.completedAt      = '';
            this.submitError      = '';
            this.nameError        = false;
            this.resetStep();
        }
    };
}
</script>
@endsection
