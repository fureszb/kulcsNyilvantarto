#!/bin/sh
set -e

mkdir -p /app/storage/database/tenants
chmod -R 775 /app/storage/database

mkdir -p /app/storage/app/public

php artisan migrate --force
php artisan tenant:migrate-all
php artisan storage:link --force 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache 2>/dev/null || true

chown -R www-data:www-data /app/storage /app/bootstrap/cache

php-fpm -D
exec nginx -g "daemon off;"
