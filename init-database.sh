#!/bin/bash
set -e

# This script runs automatically when the postgres container starts for the first time
# It creates the strapi_db database if it doesn't exist

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE strapi_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'strapi_db')\gexec
EOSQL

echo "✅ Database 'strapi_db' has been created or already exists"
