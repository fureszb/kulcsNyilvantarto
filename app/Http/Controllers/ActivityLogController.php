<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\TenantUser;
use Illuminate\Http\Request;

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

        $logs    = $query->get();
        $workers = TenantUser::where('is_active', true)->orderBy('name')->get();

        return view('activity.index', compact('logs', 'date', 'type', 'userId', 'workers'));
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

        $logs    = $query->get();
        $workers = TenantUser::where('is_active', true)->orderBy('name')->get();

        return view('pm.activity', compact('logs', 'date', 'type', 'userId', 'workers'));
    }
}
