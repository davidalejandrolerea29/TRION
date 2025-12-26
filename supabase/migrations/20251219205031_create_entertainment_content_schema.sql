/*
  # Create Entertainment Content Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name (novelas, cuentos, comics, etc.)
      - `slug` (text, unique) - URL-friendly version
      - `icon` (text) - Icon identifier
      - `created_at` (timestamptz)
    
    - `content`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `title` (text) - Title of the work
      - `description` (text) - Description
      - `image_url` (text) - Cover image URL
      - `content_url` (text) - Link to content or game server
      - `is_external` (boolean) - True for videogames that link externally
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (anyone can view content)
    - Add policies for authenticated users to manage content
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  content_url text DEFAULT '',
  is_external boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Policies for content (public read)
CREATE POLICY "Anyone can view content"
  ON content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert content"
  ON content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content"
  ON content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete content"
  ON content FOR DELETE
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Novelas', 'novelas', 'Book'),
  ('Cuentos', 'cuentos', 'BookOpen'),
  ('Comics', 'comics', 'BookMarked'),
  ('Series', 'series', 'Tv'),
  ('Cortos', 'cortos', 'Film'),
  ('Sketchs', 'sketchs', 'Theater'),
  ('Películas', 'peliculas', 'Clapperboard'),
  ('Videojuegos', 'videojuegos', 'Gamepad2')
ON CONFLICT (slug) DO NOTHING;