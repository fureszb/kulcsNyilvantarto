<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tenant.{slug}.{userId}', function ($user, string $slug, int $userId) {
    if (!$user) return false;
    return (int) $user->id === $userId && app('tenant')?->slug === $slug;
});

Broadcast::channel('tenant.{slug}', function ($user, string $slug) {
    if (!$user) return false;
    if ($user->isPropertyManager()) return false;
    return app('tenant')?->slug === $slug;
});

Broadcast::channel('tenant.{slug}.presence', function ($user, string $slug) {
    if (!$user) return false;
    if (!$user->canManage()) return false;
    return app('tenant')?->slug === $slug;
});
