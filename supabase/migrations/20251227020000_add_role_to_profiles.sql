/*
  # Add Role to User Profiles

  1. Changes
    - Add `role` column to `user_profiles` table
    - Set default value to 'cliente'
    - Make it non-nullable to ensure every user has a role
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role text NOT NULL DEFAULT 'cliente';
  END IF;
END $$;
