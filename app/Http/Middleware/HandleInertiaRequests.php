<?php

namespace App\Http\Middleware;

use App\Models\NfcNotification;
use App\Models\PmMessage;
use App\Models\ShiftNote;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        try {
            $tenantUser = auth('tenant')->user();
        } catch (\Throwable $e) {
            $tenantUser = null;
        }
        $tenant     = app()->bound('tenant') ? app('tenant') : null;

        $newNotes    = 0;
        $newMessages = 0;
        $newNfcNotifications = 0;

        if ($tenantUser && ! $tenantUser->isPropertyManager()) {
            $since = $tenantUser->notes_read_at ?? Carbon::parse('1970-01-01');
            $newNotes = ShiftNote::where('created_at', '>', $since)
                ->where('user_id', '!=', $tenantUser->id)
                ->count();

            $since = $tenantUser->messages_read_at ?? Carbon::parse('1970-01-01');
            $newMessages = PmMessage::visibleTo($tenantUser->id)
                ->where('created_at', '>', $since)
                ->count();
        }

        if ($tenantUser) {
            $newNfcNotifications = NfcNotification::where('user_id', $tenantUser->id)->whereNull('read_at')->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $tenantUser ? [
                    'id'                => $tenantUser->id,
                    'name'              => $tenantUser->name,
                    'email'             => $tenantUser->email,
                    'role'              => $tenantUser->role,
                    'is_admin'          => $tenantUser->isAdmin(),
                    'is_property_manager' => $tenantUser->isPropertyManager(),
                ] : null,
                'superAdmin' => session('super_admin_logged_in') ? ['loggedIn' => true] : null,
            ],
            'tenant' => $tenant ? [
                'name' => $tenant->name,
                'slug' => $tenant->slug,
            ] : null,
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
            'nav' => [
                'newNotes'    => $newNotes,
                'newMessages' => $newMessages,
                'newNfcNotifications' => $newNfcNotifications,
            ],
        ];
    }
}
