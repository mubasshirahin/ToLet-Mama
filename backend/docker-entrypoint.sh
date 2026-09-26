#!/bin/bash
set -e

# Install vendor if autoload is missing
if [ ! -f "vendor/autoload.php" ]; then
    echo "Installing composer dependencies..."
    if [ "${APP_ENV:-local}" = "production" ]; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        composer install --optimize-autoloader --no-interaction
    fi
fi

# Cache configuration
php artisan storage:link --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Populate a fresh local database with browseable demo listings.
if [ "${APP_ENV:-local}" = "local" ] && [ "${SEED_DEMO_DATA:-true}" = "true" ]; then
    php artisan db:seed --class=ListingSeeder --force
fi

exec "$@"
