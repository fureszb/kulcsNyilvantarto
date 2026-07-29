<?php

namespace App\Http\Controllers\Api\Concerns;

use Carbon\Carbon;

/** Közös heti (7 napos, hétfőtől vasárnapig induló utolsó 7 nap) trend-építő a Director
 *  incidens-trendjéhez és a SecurityLead jelenlét-trendjéhez — mindkettő ugyanazt a
 *  "napi darabszám + heti változás előző héthez képest" alakot adja vissza. */
trait BuildsWeeklyTrend
{
    private const WEEKDAY_LABELS_HU = [1 => 'H', 2 => 'K', 3 => 'Sze', 4 => 'Cs', 5 => 'P', 6 => 'Szo', 7 => 'V'];

    /**
     * @param  array<string, int>  $countsByDate  'Y-m-d' => darabszám, a TELJES 14 napos ablakra
     *                                              (ma-13 .. ma) — egyetlen, GROUP BY DATE(...)-es
     *                                              lekérdezéssel előre lekérve (lásd
     *                                              `countsByDateQuery()`), nem 14 külön hívással.
     * @param  bool  $higherIsBetter  Incidenseknél FALSE (kevesebb a jobb), jelenlétnél TRUE
     *                                 (több a jobb) — ez dönti el az `is_improvement` irányát.
     */
    private function buildWeeklyTrend(string $title, array $countsByDate, bool $higherIsBetter = false): array
    {
        $points = collect(range(6, 0))->map(function (int $daysAgo) use ($countsByDate) {
            $day = Carbon::today()->subDays($daysAgo);
            return [
                'day_label' => self::WEEKDAY_LABELS_HU[$day->dayOfWeekIso],
                'value'     => $countsByDate[$day->toDateString()] ?? 0,
                'is_today'  => $day->isToday(),
            ];
        })->values();

        $thisWeekTotal = $points->sum('value');
        $lastWeekTotal = collect(range(13, 7))->sum(
            fn (int $daysAgo) => $countsByDate[Carbon::today()->subDays($daysAgo)->toDateString()] ?? 0
        );

        if ($lastWeekTotal > 0) {
            $changePct = (int) round((($thisWeekTotal - $lastWeekTotal) / $lastWeekTotal) * 100);
            $changeLabel = ($changePct > 0 ? '+' : '') . $changePct . '% a múlt héthez képest';
        } elseif ($thisWeekTotal > 0) {
            $changeLabel = 'Nincs korábbi heti adat az összehasonlításhoz';
        } else {
            $changeLabel = 'Nincs adat ezen a héten';
        }

        return [
            'title'          => $title,
            'change_label'   => $changeLabel,
            'is_improvement' => $higherIsBetter ? $thisWeekTotal >= $lastWeekTotal : $thisWeekTotal <= $lastWeekTotal,
            'points'         => $points,
        ];
    }

    /**
     * Egy már szűrt (WHERE-ekkel felkészített) query-ből EGYETLEN `GROUP BY DATE(...)`-es
     * lekérdezéssel építi fel a 14 napos "dátum => darabszám" térképet — [buildWeeklyTrend]
     * korábban naponta (14x) hívta meg a lekérdezést, ez helyette egyetlen kört fut.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<*>  $query
     * @return array<string, int>
     */
    private function countsByDateMap($query, string $dateColumn): array
    {
        return $query
            ->where($dateColumn, '>=', Carbon::today()->subDays(13)->startOfDay())
            ->selectRaw("DATE({$dateColumn}) as day, COUNT(*) as cnt")
            ->groupBy('day')
            ->pluck('cnt', 'day')
            ->all();
    }
}
