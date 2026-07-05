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
            ->get()
            ->keyBy('lead_id');

        $leads = array_map(function ($lead) use ($goals) {
            $goal = $goals->get($lead['lead_id']);
            $lead['goal'] = $goal ? [
                'target_completion_pct' => $goal->target_completion_pct,
                'target_turnover_pct'   => $goal->target_turnover_pct,
            ] : null;
            return $lead;
        }, $leadsData);

        $unreadMessages = DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', true)
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
        ]);

        $director = Auth::guard('tenant')->user();

        if (!$director->supervisedLeads()->where('users.id', $leadId)->exists()) {
            abort(403);
        }

        DirectorLeadGoal::updateOrCreate(
            [
                'director_id' => $director->id,
                'lead_id'     => $leadId,
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

    public function messages(): Response
    {
        $user  = Auth::guard('tenant')->user();
        $leads = $user->supervisedLeads()->orderBy('name')->get();

        $allSent = DirectorMessage::where('from_user_id', $user->id)
            ->where('is_anonymous', false)
            ->orderBy('created_at', 'desc')
            ->get();

        $threads = $leads->map(function ($lead) use ($allSent) {
            return [
                'lead_id'   => $lead->id,
                'lead_name' => $lead->name,
                'messages'  => $allSent
                    ->where('to_user_id', $lead->id)
                    ->values()
                    ->map(fn ($m) => [
                        'id'         => $m->id,
                        'content'    => $m->content,
                        'created_at' => $m->created_at->format('Y.m.d H:i'),
                    ]),
            ];
        });

        $unreadCount = DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', true)
            ->whereNull('read_at')
            ->count();

        $feedback = DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'content'    => $m->content,
                'created_at' => $m->created_at->format('Y.m.d H:i'),
                'is_new'     => is_null($m->read_at),
            ]);

        // Olvasottnak jelöljük
        DirectorMessage::where('to_user_id', $user->id)
            ->where('is_anonymous', true)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Director/Messages', [
            'welcomeName' => $user->name,
            'threads'     => $threads->values(),
            'feedback'    => $feedback,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function sendMessage(Request $request, int $leadId): RedirectResponse
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $director = Auth::guard('tenant')->user();

        if (!$director->supervisedLeads()->where('users.id', $leadId)->exists()) {
            abort(403);
        }

        DirectorMessage::create([
            'from_user_id' => $director->id,
            'to_user_id'   => $leadId,
            'content'      => $request->content,
            'is_anonymous' => false,
        ]);

        return back()->with('success', 'Üzenet elküldve.');
    }
}
