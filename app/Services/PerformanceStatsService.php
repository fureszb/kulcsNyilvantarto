<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Location;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Irodaházankénti teljesítmény-motor.
 *
 * Modell (a jóváhagyott "kész arány − fluktuáció"):
 *   completion% = az irodaház AKTÍV dolgozóinak átlagos készültsége
 *                 (elvégzett oktatások+vizsgák / összes elvárt) × 100
 *   turnover%   = az adott hónapban kilépők aránya (left_at) az adott házban
 *   score       = completion% − turnover%   (mehet mínuszba is)
 *
 * A tenant aktív oktatás/vizsga-listáját a példány egyszer tölti be, így egy
 * kérésen belül több irodaház is olcsón kiszámolható.
 */
class PerformanceStatsService
{
    /** @var int[] */
    private array $activeTrainingIds;
    /** @var int[] */
    private array $activeExamIds;
    private int $expectedPerWorker;

    public function __construct()
    {
        $this->activeTrainingIds = Training::where('is_active', true)->pluck('id')->all();
        $this->activeExamIds = Exam::where('is_active', true)->pluck('id')->all();
        $this->expectedPerWorker = count($this->activeTrainingIds) + count($this->activeExamIds);
    }

    /** Egy irodaház teljesítmény-statisztikája (alapból az aktuális hónapra). */
    public function locationStats(Location $location, ?Carbon $month = null): array
    {
        $month = $month ? $month->copy() : Carbon::now();
        $monthStart = $month->copy()->startOfMonth();
        $monthEnd = $month->copy()->endOfMonth();

        $workers = $location->workers()->get(['users.id', 'is_active', 'left_at']);
        $active = $workers->where('is_active', true);
        $activeIds = $active->pluck('id')->all();

        $completion = $this->completionForWorkers($activeIds);

        $leftThisMonth = $workers->filter(
            fn ($w) => $w->left_at && $w->left_at->betweenIncluded($monthStart, $monthEnd)
        )->count();
        $denominator = $active->count() + $leftThisMonth;
        $turnover = $denominator > 0 ? round($leftThisMonth / $denominator * 100, 1) : 0.0;

        return [
            'location_id'         => $location->id,
            'location_name'       => $location->name,
            'completion_pct'      => round($completion, 1),
            'turnover_pct'        => $turnover,
            'score'               => round($completion - $turnover, 1),
            'active_workers'      => $active->count(),
            'left_this_month'     => $leftThisMonth,
            'expected_per_worker' => $this->expectedPerWorker,
        ];
    }

    /**
     * Egy biztonsági vezető összesített statisztikája + irodaházankénti bontás.
     * Az ÖSSZ completion worker-súlyozott (a nagyobb létszámú ház nagyobb súllyal
     * esik latba); a turnover a teljes kilépő/létszám arányból.
     */
    public function leadStats(TenantUser $lead, ?Carbon $month = null): array
    {
        $locations = $lead->managedLocations()->orderBy('name')->get();
        $perLocation = $locations->map(fn ($loc) => $this->locationStats($loc, $month));

        return [
            'lead_id'      => $lead->id,
            'lead_name'    => $lead->name,
            'lead_email'   => $lead->email,
            'locations'    => $perLocation->values()->all(),
            'overall'      => $this->aggregate($perLocation),
        ];
    }

    /** Egy területi igazgató vezetőnkénti statisztikája. */
    public function directorOverview(TenantUser $director, ?Carbon $month = null): array
    {
        $leads = $director->supervisedLeads()->orderBy('name')->get();
        return $leads->map(fn ($lead) => $this->leadStats($lead, $month))->values()->all();
    }

    /** Több irodaház-stat összesítése (worker-súlyozott completion, össz-turnover). */
    private function aggregate(Collection $stats): array
    {
        $totalActive = $stats->sum('active_workers');
        $totalLeft = $stats->sum('left_this_month');

        $completion = $totalActive > 0
            ? $stats->sum(fn ($s) => $s['completion_pct'] * $s['active_workers']) / $totalActive
            : 0.0;
        $denominator = $totalActive + $totalLeft;
        $turnover = $denominator > 0 ? round($totalLeft / $denominator * 100, 1) : 0.0;

        return [
            'completion_pct'  => round($completion, 1),
            'turnover_pct'    => $turnover,
            'score'           => round($completion - $turnover, 1),
            'active_workers'  => $totalActive,
            'left_this_month' => $totalLeft,
            'location_count'  => $stats->count(),
        ];
    }

    /** Az aktív dolgozók átlagos készültsége (0–100). */
    private function completionForWorkers(array $userIds): float
    {
        if (empty($userIds)) {
            return 0.0;
        }
        if ($this->expectedPerWorker === 0) {
            return 100.0; // nincs elvárt oktatás/vizsga → mindenki "kész"
        }

        $trainDone = empty($this->activeTrainingIds) ? collect() : TrainingResult::whereIn('user_id', $userIds)
            ->whereIn('training_id', $this->activeTrainingIds)
            ->get(['user_id', 'training_id'])
            ->groupBy('user_id')
            ->map(fn ($rows) => $rows->pluck('training_id')->unique()->count());

        $examDone = empty($this->activeExamIds) ? collect() : ExamResult::whereIn('user_id', $userIds)
            ->whereIn('exam_id', $this->activeExamIds)
            ->whereNotNull('completed_at')
            ->get(['user_id', 'exam_id'])
            ->groupBy('user_id')
            ->map(fn ($rows) => $rows->pluck('exam_id')->unique()->count());

        $sum = 0.0;
        foreach ($userIds as $uid) {
            $done = (int) ($trainDone[$uid] ?? 0) + (int) ($examDone[$uid] ?? 0);
            $sum += min(1.0, $done / $this->expectedPerWorker);
        }

        return $sum / count($userIds) * 100;
    }
}
