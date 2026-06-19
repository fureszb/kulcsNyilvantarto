<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $connection = 'tenant';

    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $prefix = static::cachePrefix();
        return Cache::rememberForever("{$prefix}setting_{$key}", function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget(static::cachePrefix() . "setting_{$key}");
    }

    private static function cachePrefix(): string
    {
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        return $tenant ? $tenant->slug . '_' : '';
    }
}
