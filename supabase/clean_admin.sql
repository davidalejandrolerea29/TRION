-- Script para borrar el usuario admin que no funciona y permitir registrarlo manualmente

-- 1. Borrar de la tabla de perfiles (por si acaso, aunque el cascade debería encargarse)
DELETE FROM public.user_profiles WHERE email = 'admin@trion.app';

-- 2. Borrar de la tabla de autenticación (esto liberará el email)
DELETE FROM auth.users WHERE email = 'admin@trion.app';
