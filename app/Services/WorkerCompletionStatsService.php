<?php

namespace App\Services;

use App\Models\ExamResult;
use App\Models\TenantUser;
use App\Models\TrainingResult;
use Illuminate\Support\Collection;

/**
 * Dolgozónkénti oktatás/vizsga-készültség számítása. Kiemelve a
 * PropertyManagerController-ből, hogy a SecurityLeadController is
 * ugyanazt a logikát használhassa a saját dolgozói nézetéhez.
 */
class WorkerCompletionStatsService
{
    /**
     * @param Collection $trainings aktív Training-ek (is_location_knowledge flaggel)
     * @param Collection|null $allTrainResults user_id szerint csoportosított TrainingResult-ok (N+1 elkerülésére)
     * @param Collection|null $allExamResults user_id szerint csoportosított ExamResult-ok
     */
    public function buildStats(TenantUser $worker, Collection $trainings, ?Collection $allTrainResults = null, ?Collection $allExamResults = null): array
    {
        $total         = $trainings->count();
        $locationTotal = $trainings->where('is_location_knowledge', true)->count();

        $trainingResults = $allTrainResults
            ? ($allTrainResults->get($worker->id) ?? collect())
            : TrainingResult::where('user_id', $worker->id)->get();

        $doneIds     = $trainingResults->pluck('training_id')->unique();
        $trainingPct = $total > 0 ? (int) round($doneIds->count() / $total * 100) : 0;

        $locKnownIds  = $trainings->where('is_location_knowledge', true)->pluck('id');
        $locDoneCount = $doneIds->intersect($locKnownIds)->count();
        $locationPct  = $locationTotal > 0 ? (int) round($locDoneCount / $locationTotal * 100) : 0;

        $examResults = $allExamResults
            ? ($allExamResults->get($worker->id) ?? collect())
            : ExamResult::where('user_id', $worker->id)->get();
        $profPct = $examResults->isEmpty() ? null
            : (int) round($examResults->avg(fn($r) => $r->total_steps > 0 ? $r->first_try_count / $r->total_steps * 100 : 0));

        return [
            'worker'       => $worker,
            'training_pct' => $trainingPct,
            'location_pct' => $locationPct,
            'prof_pct'     => $profPct,
        ];
    }
}
