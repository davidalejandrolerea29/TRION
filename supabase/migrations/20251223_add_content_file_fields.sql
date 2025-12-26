/*
  # Add Content File Fields and Storage

  1. New Fields for `content` table
    - `is_premium` (boolean) - To explicitly mark premium content
    - `file_type` (text) - Type of uploaded file (video, pdf, image, external)
    - `file_size` (bigint) - Size of the file in bytes
    - `preview_duration` (integer) - Duration in seconds for video previews

  2. Storage
    - Create `content-files` bucket
    - Add policies for authenticated users to upload/delete
    - Add policies for public to read
*/

-- Add new fields to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS file_type text DEFAULT 'external',
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS preview_duration integer;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-files', 'content-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content-files' );

-- Authenticated Upload Access (Admin only ideally, but auth for now as per plan)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content-files' );

-- Authenticated Update Access
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content-files' );

-- Authenticated Delete Access
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'content-files' );
