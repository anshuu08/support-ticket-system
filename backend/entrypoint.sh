#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "import psycopg2; psycopg2.connect(host='$POSTGRES_HOST', dbname='$POSTGRES_DB', user='$POSTGRES_USER', password='$POSTGRES_PASSWORD')" 2>/dev/null; do
  sleep 1
done

echo "Running migrations..."
python manage.py makemigrations tickets
python manage.py migrate

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000
