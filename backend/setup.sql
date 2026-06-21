-- ====================================================================
-- CampusCare Database Setup Helper Script
-- ====================================================================
--
-- Instructions:
-- 1. Open pgAdmin or your terminal/command line.
-- 2. Connect to your PostgreSQL instance as a superuser (e.g., 'postgres').
-- 3. Execute the commands below to initialize the database.
--
-- Alternatively, from your terminal:
-- psql -U postgres -d postgres -f setup.sql
-- ====================================================================

-- Create the database if it doesn't exist
-- Note: If you run this file directly in psql, make sure to execute this line.
CREATE DATABASE campus_care;

-- ====================================================================
-- Optional: Create a Dedicated Application User
-- ====================================================================
-- It is recommended to create a dedicated user rather than using 'postgres' superuser.
-- Uncomment the lines below to create the user and grant access:
--
-- CREATE USER campus_care_user WITH PASSWORD 'campus_care_secure_pass';
-- GRANT ALL PRIVILEGES ON DATABASE campus_care TO campus_care_user;
--
-- If you do this, your DATABASE_URL in the .env file will be:
-- DATABASE_URL="postgresql://campus_care_user:campus_care_secure_pass@localhost:5432/campus_care?schema=public"
-- ====================================================================

\q
