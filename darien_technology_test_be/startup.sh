#!/bin/sh
set -e

echo "Running database migrations..."
yarn migration:run || {
    echo "Migration failed"
    exit 1
}

echo "Seeding database..."
yarn seed || {
    echo "Seeding failed"
    exit 1
}

echo "Starting application..."
node ./dist/src/main.js
