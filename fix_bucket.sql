-- Script de corrección para "Bucket not found"
-- Copia y pega esto en el Editor SQL de Supabase para crear el bucket necesario

-- 1. Crear el bucket 'content-files' (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-files', 'content-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar políticas de acceso (para que puedas subir archivos)
-- Permitir acceso público de lectura
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'content-files' );

-- Permitir subir archivos a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'content-files' );

-- Permitir actualizar archivos
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'content-files' );

-- Permitir borrar archivos
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'content-files' );
