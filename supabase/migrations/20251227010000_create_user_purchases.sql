/*
  # Create User Purchases Table

  1. New Tables
    - `user_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content_id` (uuid, references content)
      - `amount` (decimal, default 0)
      - `status` (text, default 'completed')
      - `purchase_date` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to view their own purchases
*/

CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES content(id) ON DELETE CASCADE NOT NULL,
  amount decimal DEFAULT 0,
  status text DEFAULT 'completed',
  purchase_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON user_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);
