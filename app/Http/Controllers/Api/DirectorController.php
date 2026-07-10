<?php

namespace App\Http\Controllers\Api;

use App\Models\DirectorLeadGoal;
use App\Services\PerformanceStatsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DirectorController extends Controller
{
    private function mergeGoals(array $leadsData, $director, Carbon $now): array
    {
        $goals = DirectorLeadGoal::where('director_id', $director->id)
            ->where('period_type', 'monthly')
            ->where('year', $now->year)
            ->where('period', $now->month)
            ->get();

        $overallGoals = $goals->whereNull('location_id')->keyBy('lead_id');
        $locationGoals = $goals->whereNotNull('location_id')->groupBy('lead_id');

        return array_map(function ($lead) use ($overallGoals, $locationGoals) {
            $goal = $overallGoals->get($lead['lead_id']);
            $lead['goal'] = $goal ? [
                'target_completion_pct' => $goal->target_completion_pct,
                'target_turnover_pct'   => $goal->target_turnover_pct,
            ] : null;

            $leadLocGoals = $locationGoals->get($lead['lead_id'])?->keyBy('location_id');
            $lead['locations'] = array_map(function ($loc) use ($leadLocGoals) {
                $locGoal = $leadLocGoals?->get($loc['location_id']);
                $loc['goal'] = $locGoal ? [
                    'target_completion_pct' => $locGoal->target_completion_pct,
                    'target_turnover_pct'   => $locGoal->target_turnover_pct,
                ] : null;
                return $loc;
            }, $lead['locations']);

            return $lead;
        }, $leadsData);
    }

    public function overview(Request $request, PerformanceStatsService $stats)
    {
        $user = $request->user();
        abort_unless($user->isAreaDirector(), 403);
        $now = Carbon::now();

        $leads = $this->mergeGoals($stats->directorOverview($user), $user, $now);

        return response()->json([
            'leads'         => $leads,
            'currentPeriod' => ['year' => $now->year, 'month' => $now->month],
        ]);
    }

    public function monthlyHistory(Request $request, PerformanceStatsService $stats)
    {
        $user = $request->user();
        abort_unless($user->isAreaDirector(), 403);

        $months = (int) $request->input('months', 6);

        return response()->json($stats->monthlyHistory($user, $months));
    }

    public function setGoal(Request $request, int $leadId)
    {
        $director = $request->user();
        abort_unless($director->isAreaDirector(), 403);

        $data = $request->validate([
            'target_completion_pct' => 'required|numeric|min:0|max:100',
            'target_turnover_pct'   => 'required|numeric|min:0|max:100',
            'year'                  => 'required|integer|min:2020|max:2100',
            'month'                 => 'required|integer|min:1|max:12',
            'location_id'           => 'nullable|integer',
        ]);

        $lead = $director->supervisedLeads()->where('users.id', $leadId)->first();
        abort_unless($lead, 403);

        $locationId = $data['location_id'] ?? null;
        if ($locationId !== null) {
            abort_unless($lead->managedLocations()->where('locations.id', $locationId)->exists(), 403);
        }

        $goal = DirectorLeadGoal::updateOrCreate(
            [
                'director_id' => $director->id,
                'lead_id'     => $leadId,
                'location_id' => $locationId,
                'period_type' => 'monthly',
                'year'        => $data['year'],
                'period'      => $data['month'],
            ],
            [
                'target_completion_pct' => $data['target_completion_pct'],
                'target_turnover_pct'   => $data['target_turnover_pct'],
            ]
        );

        return response()->json([
            'target_completion_pct' => $goal->target_completion_pct,
            'target_turnover_pct'   => $goal->target_turnover_pct,
            'year'                  => $goal->year,
            'month'                 => $goal->period,
            'location_id'           => $goal->location_id,
        ]);
    }
}
