<?php

namespace App\Http\Controllers;

use App\Models\DirectorLeadGoal;
use App\Models\DirectorMessage;
use App\Models\TenantUser;
use App\Services\PerformanceStatsService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DirectorController extends Controller
{
    public function dashboard(PerformanceStatsService $stats): Response
    {
        $user = Auth::guard('tenant')->user();
        $now  = Carbon::now();

        $leadsData = $stats->directorOverview($user);

        $goals = DirectorLeadGoal::where('director_id', $user->id)
            ->where('period_type', 'monthly')
            ->where('year', $now->year)
            ->where('period', $now->month)
            ->get();

        $overallGoals  = $goals->whereNull('location_id')->keyBy('lead_id');
        $locationGoals = $goals->whereNotNull('location_id')->groupBy('lead_id');

        $leads = array_map(function ($lead) use ($overallGoals, $locationGoals) {
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

        // A névtelen visszajelzés a tenant összes igazgatójának szól, nem csak
        // annak, akit a küldéskor rögzítettünk a to_user_id-ba (lásd feedback()).
        $unreadMessages = DirectorMessage::where('is_anonymous', true)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Director/Dashboard', [
            'welcomeName'    => $user->name,
            'leads'          => $leads,
            'currentPeriod'  => ['year' => $now->year, 'month' => $now->month],
            'unreadFeedback' => $unreadMessages,
        ]);
    }

    public function setGoal(Request $request, int $leadId): RedirectResponse
    {
        $request->validate([
            'target_completion_pct' => 'required|numeric|min:0|max:100',
            'target_turnover_pct'   => 'required|numeric|min:0|max:100',
            'year'                  => 'required|integer|min:2020|max:2100',
            'month'                 => 'required|integer|min:1|max:12',
            'location_id'           => 'nullable|integer',
        ]);

        $director = Auth::guard('tenant')->user();

        $lead = $director->supervisedLeads()->where('users.id', $leadId)->first();
        abort_unless($lead, 403);

        $locationId = $request->input('location_id');
        if ($locationId !== null) {
            abort_unless($lead->managedLocations()->where('locations.id', $locationId)->exists(), 403);
        }

        DirectorLeadGoal::updateOrCreate(
            [
                'director_id' => $director->id,
                'lead_id'     => $leadId,
                'location_id' => $locationId,
                'period_type' => 'monthly',
                'year'        => $request->year,
                'period'      => $request->month,
            ],
            [
                'target_completion_pct' => $request->target_completion_pct,
                'target_turnover_pct'   => $request->target_turnover_pct,
            ]
        );

        return back()->with('success', 'Célkitűzés mentve.');
    }

    public function monthlyReport(PerformanceStatsService $stats): Response
    {
        $user = Auth::guard('tenant')->user();

        return Inertia::render('Director/MonthlyReport', [
            'welcomeName' => $user->name,
            'history'     => $stats->monthlyHistory($user),
        ]);
    }

    /** A tenant összes igazgatója látja az összes névtelen dolgozói visszajelzést —
     *  a to_user_id a küldéskor csak egy (tetszőleges) aktív igazgatóra mutat a
     *  kötelező oszlop miatt, de itt szándékosan nem szűrünk rá, mert több igazgató
     *  esetén mindegyiküknek látnia kell mindent. */
    public function feedback(): Response
    {
        $user = Auth::guard('tenant')->user();

        $unreadCount = DirectorMessage::where('is_anonymous', true)
            ->whereNull('read_at')
            ->count();

        $feedback = DirectorMessage::where('is_anonymous', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'content'    => $m->content,
                'created_at' => $m->created_at->format('Y.m.d H:i'),
                'is_new'     => is_null($m->read_at),
            ]);

        // Olvasottnak jelöljük (bármelyik igazgató megnyitja, mindenkinél olvasottá válik)
        DirectorMessage::where('is_anonymous', true)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Director/Feedback', [
            'welcomeName' => $user->name,
            'feedback'    => $feedback,
            'unreadCount' => $unreadCount,
        ]);
    }
}
