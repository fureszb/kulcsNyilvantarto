<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\TenantUser;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $date    = $request->input('date', now()->toDateString());
        $type    = $request->input('type', 'all');
        $userId  = $request->input('user_id');

        $query = ActivityLog::whereDate('occurred_at', $date)
            ->orderByDesc('occurred_at');

        if ($type !== 'all') {
            $query->where('event_type', $type);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $logs    = $query->paginate(50)->withQueryString();
        $workers = TenantUser::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Activity/Index', ['logs' => $logs, 'date' => $date, 'type' => $type, 'userId' => $userId, 'workers' => $workers]);
    }

    public function pmActivity(Request $request)
    {
        $date   = $request->input('date', now()->toDateString());
        $type   = $request->input('type', 'all');
        $userId = $request->input('user_id');

        $query = ActivityLog::whereDate('occurred_at', $date)
            ->orderByDesc('occurred_at');

        if ($type !== 'all') {
            $query->where('event_type', $type);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $logs    = $query->paginate(50)->withQueryString();
        $workers = TenantUser::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Activity/Index', ['logs' => $logs, 'date' => $date, 'type' => $type, 'userId' => $userId, 'workers' => $workers, 'isPm' => true]);
    }
}
