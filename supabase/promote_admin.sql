-- Remplaza 'admin@trion.app' con el email con el que te hayas registrado si es diferente
UPDATE public.user_profiles
SET is_admin = true, role = 'admin'
WHERE email = 'admin@trion.app';

-- Verification
SELECT * FROM public.user_profiles WHERE email = 'admin@trion.app';
