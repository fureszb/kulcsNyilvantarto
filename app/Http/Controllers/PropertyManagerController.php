<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Location;
use App\Models\PmMessage;
use App\Models\PmMessageRecipient;
use App\Models\SecurityDailyReport;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PropertyManagerController extends Controller
{
    public function dashboard()
    {
        $welcomeName = session()->pull('pm_welcome');

        $workers   = TenantUser::where('role', 'user')->where('is_active', true)->orderBy('name')->get();
        $trainings = Training::where('is_active', true)->get();

        $workerIds       = $workers->pluck('id');
        $allTrainResults = TrainingResult::whereIn('user_id', $workerIds)->get()->groupBy('user_id');
        $allExamResults  = ExamResult::whereIn('user_id', $workerIds)->get()->groupBy('user_id');

        $workerStats = $workers->map(fn($w) => $this->buildStats($w, $trainings, $allTrainResults, $allExamResults));

        return view('pm.dashboard', compact('workerStats', 'welcomeName'));
    }

    public function worker(TenantUser $user)
    {
        abort_if($user->role !== 'user', 404);

        $trainings      = Training::where('is_active', true)->withCount('steps')->orderBy('sort_order')->get();
        $trainingResults = TrainingResult::where('user_id', $user->id)->get();

        $trainingRows = $trainings->map(function ($t) use ($trainingResults) {
            $done = $trainingResults->where('training_id', $t->id)->sortByDesc('completed_at')->first();
            return [
                'training'      => $t,
                'training_done' => $done !== null,
                'training_result' => $done,
            ];
        });

        $exams      = Exam::where('is_active', true)->withCount('steps')->orderBy('sort_order')->get();
        $examResults = ExamResult::where('user_id', $user->id)->with('exam')->get();

        $examRows = $exams->map(function ($e) use ($examResults) {
            $results   = $examResults->where('exam_id', $e->id)->sortByDesc('completed_at');
            $lastExam  = $results->first();
            return [
                'exam'       => $e,
                'exam_done'  => $lastExam !== null,
                'last_exam'  => $lastExam,
                'exam_count' => $results->count(),
            ];
        });

        $stats = $this->buildStats($user, $trainings);

        $recentActivity = ActivityLog::where('user_id', $user->id)
            ->orderByDesc('occurred_at')
            ->limit(20)
            ->get();

        return view('pm.worker', compact('user', 'trainingRows', 'examRows', 'stats', 'recentActivity'));
    }

    public function messages(Request $request)
    {
        $query = PmMessage::with('recipients.user')->orderByDesc('created_at');

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('user_id')) {
            $uid = (int) $request->user_id;
            $query->where(function ($q) use ($uid) {
                $q->where('send_to_all', true)
                  ->orWhereHas('recipients', fn($r) => $r->where('user_id', $uid));
            });
        }

        $messages = $query->paginate(20)->withQueryString();

        $workers = TenantUser::where('is_active', true)
            ->where('id', '!=', Auth::guard('tenant')->id())
            ->orderBy('name')->get();

        return view('pm.messages', compact('messages', 'workers'));
    }

    public function storeMessage(Request $request)
    {
        $request->validate([
            'content'      => 'required|string|max:2000',
            'send_to_all'  => 'nullable|boolean',
            'user_ids'     => 'nullable|array',
            'user_ids.*'   => 'integer',
        ]);

        $sendToAll = $request->boolean('send_to_all');

        if (!$sendToAll && empty($request->input('user_ids'))) {
            return back()->withErrors(['user_ids' => 'Válasszon legalább egy dolgozót, vagy küldje mindenkinek.'])->withInput();
        }

        $sender = Auth::guard('tenant')->user();
        $message = PmMessage::create([
            'content'          => $request->content,
            'send_to_all'      => $sendToAll,
            'sent_by_user_id'  => $sender->id,
            'sent_by_name'     => $sender->name,
        ]);

        if (!$sendToAll) {
            foreach ($request->input('user_ids', []) as $userId) {
                PmMessageRecipient::create(['pm_message_id' => $message->id, 'user_id' => (int) $userId]);
            }
        }

        $recipientCount = $sendToAll ? null : count($request->input('user_ids', []));
        $recipientLabel = $sendToAll ? 'mindenkinek' : "{$recipientCount} felhasználónak";
        ActivityLog::record('pm_message.sent', Auth::guard('tenant')->user(),
            "PM üzenet elküldve {$recipientLabel}", [
                'message_id'      => $message->id,
                'send_to_all'     => $sendToAll,
                'recipient_count' => $recipientCount,
                'content'         => mb_substr($request->content, 0, 500),
            ]);

        return back()->with('success', 'Üzenet elküldve.');
    }

    public function destroyMessage(PmMessage $message)
    {
        ActivityLog::record('pm_message.deleted', Auth::guard('tenant')->user(), "PM üzenet törölve", [
            'content' => mb_substr($message->content, 0, 500),
        ]);
        $message->delete();
        return back()->with('success', 'Üzenet törölve.');
    }

    public function editMessage(PmMessage $message)
    {
        $workers   = TenantUser::where('is_active', true)
            ->where('id', '!=', Auth::guard('tenant')->id())
            ->orderBy('name')->get();
        $sharedIds = $message->recipients()->pluck('user_id')->toArray();
        return view('pm.message-edit', compact('message', 'workers', 'sharedIds'));
    }

    public function updateMessage(Request $request, PmMessage $message)
    {
        $request->validate([
            'content'     => 'required|string|max:2000',
            'send_to_all' => 'nullable|boolean',
            'user_ids'    => 'nullable|array',
            'user_ids.*'  => 'integer',
        ]);

        $sendToAll = $request->boolean('send_to_all');

        if (!$sendToAll && empty($request->input('user_ids'))) {
            return back()->withErrors(['user_ids' => 'Válasszon legalább egy dolgozót, vagy küldje mindenkinek.'])->withInput();
        }

        $oldContent  = $message->content;
        $oldSendToAll = $message->send_to_all;

        $message->update(['content' => $request->content, 'send_to_all' => $sendToAll]);

        $message->recipients()->delete();
        if (!$sendToAll) {
            foreach ($request->input('user_ids', []) as $userId) {
                PmMessageRecipient::create(['pm_message_id' => $message->id, 'user_id' => (int) $userId]);
            }
        }

        ActivityLog::record('pm_message.updated', Auth::guard('tenant')->user(),
            "PM üzenet módosítva", [
                'message_id'   => $message->id,
                'old_content'  => mb_substr($oldContent, 0, 500),
                'new_content'  => mb_substr($request->content, 0, 500),
                'old_send_to_all' => $oldSendToAll,
                'new_send_to_all' => $sendToAll,
            ]);

        return redirect()->route('pm.messages')->with('success', 'Üzenet módosítva.');
    }

    public function securityReports(Request $request)
    {
        $query = SecurityDailyReport::orderByDesc('report_date')->orderByDesc('id');

        if ($request->filled('date_from')) {
            $query->whereDate('report_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('report_date', '<=', $request->date_to);
        }
        $reports = $query->paginate(30)->withQueryString();

        if ($request->boolean('incidents_only')) {
            $reports->setCollection(
                $reports->getCollection()->filter(fn($r) => !empty($r->incidents))
            );
        }

        return view('pm.security', compact('reports'));
    }

    public function checks(Request $request)
    {
        $locations = Location::where('is_active', true)->orderBy('name')->get();
        $users     = TenantUser::where('is_active', true)->orderBy('name')->get();

        $query = Check::with('checkItems')
            ->orderByDesc('created_at');

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $checks = $query->paginate(25)->withQueryString();

        $locationMap = $locations->keyBy('id');

        return view('pm.checks', compact('checks', 'locations', 'users', 'locationMap'));
    }

    private function buildStats(TenantUser $worker, $trainings, $allTrainResults = null, $allExamResults = null): array
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
