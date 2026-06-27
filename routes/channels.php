<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tenant.{slug}.{userId}', function ($user, string $slug, int $userId) {
    return (int) $user->id === $userId && app('tenant')?->slug === $slug;
});
