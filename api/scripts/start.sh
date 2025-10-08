#!/bin/sh

# Wait for database
echo "Waiting for database to be ready..."
npx wait-on -t 30000 tcp:db:5432

# Apply migrations and schema changes
echo "Running database migrations..."
npx prisma migrate deploy

echo "Pushing schema changes..."
npx prisma db push --skip-generate --accept-data-loss

# Start the application
echo "Starting application..."
npm run dev