/*
  # Create waitlist table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for inserting new emails
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert new emails
CREATE POLICY "Allow anonymous insert to waitlist" ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only allow authenticated users to view waitlist entries
CREATE POLICY "Allow authenticated users to view waitlist" ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);