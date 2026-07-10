<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken;

class TenantPersonalAccessToken extends PersonalAccessToken
{
    protected $connection = 'tenant';
    protected $table = 'personal_access_tokens';
}
