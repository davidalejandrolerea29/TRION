-- Confirmar email manualmente y asegurar rol de admin

-- 1. Confirmar el email en la tabla de autenticación
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@trion.app';

-- 2. Asegurar que sea admin (por si acaso no se ejecutó el anterior)
UPDATE public.user_profiles
SET is_admin = true, role = 'admin'
WHERE email = 'admin@trion.app';
