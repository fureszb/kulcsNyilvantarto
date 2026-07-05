<?php

namespace App\Http\Controllers;

use App\Events\NewPmMessage;
use App\Mail\NewPmMessageMail;
use App\Models\ActivityLog;
use App\Models\Check;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Location;
use App\Models\PmMessage;
use App\Models\PmMessageRecipient;
use App\Models\PmMessageReply;
use App\Models\SecurityDailyReport;
use App\Models\TenantUser;
use App\Models\Training;
use App\Models\TrainingResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

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

        return Inertia::render('PM/Dashboard', ['workerStats' => $workerStats, 'welcomeName' => $welcomeName]);
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

        return Inertia::render('PM/Worker', ['user' => $user, 'trainingRows' => $trainingRows, 'examRows' => $examRows, 'stats' => $stats, 'recentActivity' => $recentActivity]);
    }

    public function messages(Request $request)
    {
        $query = PmMessage::with('recipients.user', 'replies')->orderByDesc('created_at');

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

        return Inertia::render('PM/Messages', [
            'messages' => $messages,
            'workers'  => $workers,
            'filters'  => $request->only(['date_from', 'date_to', 'user_id']),
        ]);
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

        $userIds = [];
        if (!$sendToAll) {
            foreach ($request->input('user_ids', []) as $userId) {
                PmMessageRecipient::create(['pm_message_id' => $message->id, 'user_id' => (int) $userId]);
                $userIds[] = (int) $userId;
            }
        } else {
            $userIds = TenantUser::where('is_active', true)
                ->where('id', '!=', $sender->id)
                ->pluck('id')
                ->toArray();
        }

        $slug = app('tenant')->slug;
        broadcast(new NewPmMessage(
            message: [
                'id'         => $message->id,
                'content'    => $message->content,
                'created_at' => $message->created_at->toISOString(),
                'send_to_all' => $message->send_to_all,
                'sent_by_name' => $message->sent_by_name,
            ],
            tenantSlug: $slug,
            recipientIds: $userIds,
        ))->toOthers();

        \App\Jobs\SendPushJob::dispatch(
            tenantSlug: $slug,
            userIds: $userIds,
            title: 'Új PM üzenet — ' . $sender->name,
            body: $message->content,
            url: route('messages.index'),
            tag: 'pm-message-' . $message->id,
        );

        $tenantName = app('tenant')?->name ?? 'KK Nyilvántartó';
        $loginUrl   = route('login');

        TenantUser::whereIn('id', $userIds)
            ->where('role', '!=', 'property_manager')
            ->whereNotNull('email')
            ->get()
            ->each(function (TenantUser $recipient) use ($sender, $message, $tenantName, $loginUrl) {
                try {
                    Mail::to($recipient->email)->send(new NewPmMessageMail(
                        senderName:      $sender->name,
                        messageContent:  $message->content,
                        recipientName:   $recipient->name,
                        tenantName:      $tenantName,
                        loginUrl:        $loginUrl,
                    ));
                } catch (\Throwable $e) {
                    Log::error('NewPmMessageMail failed: ' . $e->getMessage());
                }
            });

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

    public function replyToMessage(Request $request, PmMessage $message)
    {
        $request->validate(['content' => 'required|string|max:2000']);

        $sender = Auth::guard('tenant')->user();

        $reply = PmMessageReply::create([
            'pm_message_id' => $message->id,
            'sender_id'     => $sender->id,
            'sender_name'   => $sender->name,
            'content'       => $request->content,
        ]);

        // Értesítés a címzetteknek
        $slug = app('tenant')->slug;
        $recipientIds = $message->send_to_all
            ? TenantUser::where('is_active', true)->where('id', '!=', $sender->id)->pluck('id')->toArray()
            : $message->recipients()->pluck('user_id')->toArray();

        try {
            broadcast(new NewPmMessage(
                message: [
                    'id'          => $message->id,
                    'content'     => $reply->content,
                    'created_at'  => $reply->created_at->toISOString(),
                    'send_to_all' => $message->send_to_all,
                    'sent_by_name'=> $sender->name,
                ],
                tenantSlug: $slug,
                recipientIds: $recipientIds,
            ))->toOthers();
        } catch (\Throwable $e) {
            Log::error('PM replyToMessage broadcast failed: ' . $e->getMessage());
        }

        \App\Jobs\SendPushJob::dispatch(
            tenantSlug: $slug,
            userIds: array_values(array_diff($recipientIds, [$sender->id])),
            title: 'PM válasz — ' . $sender->name,
            body: $reply->content,
            url: route('messages.index'),
            tag: 'pm-message-' . $message->id,
        );

        return back()->with('success', 'Válasz elküldve.');
    }

    public function editMessage(PmMessage $message)
    {
        $workers   = TenantUser::where('is_active', true)
            ->where('id', '!=', Auth::guard('tenant')->id())
            ->orderBy('name')->get();
        $sharedIds = $message->recipients()->pluck('user_id')->toArray();
        return Inertia::render('PM/MessageEdit', ['message' => $message, 'workers' => $workers, 'sharedIds' => $sharedIds]);
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

        return Inertia::render('PM/Security', [
            'reports' => $reports,
            'filters' => $request->only(['date_from', 'date_to', 'incidents_only']),
        ]);
    }

    public function securityShow(SecurityDailyReport $security)
    {
        return Inertia::render('PM/SecurityShow', ['report' => $security]);
    }

    public function checks(Request $request)
    {
        $locations = Location::where('is_active', true)->orderBy('name')->get();
        $users     = TenantUser::where('is_active', true)->orderBy('name')->get();

        $query = Check::with(['location', 'checkItems'])
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

        return Inertia::render('PM/Checks', [
            'checks'    => $checks,
            'locations' => $locations,
            'users'     => $users,
            'filters'   => $request->only(['location_id', 'user_id', 'date_from', 'date_to']),
        ]);
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
