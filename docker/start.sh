#!/bin/sh
set -e

mkdir -p /app/database/tenants
chmod -R 775 /app/database

php artisan migrate --force
php artisan storage:link 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache 2>/dev/null || true

php-fpm -D
exec nginx -g "daemon off;"
