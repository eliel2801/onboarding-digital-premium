-- ============================================
-- Onboarding Digital Premium — Contacto y Redes Sociales
-- ============================================
-- Ejecuta este archivo en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query > pegar y ejecutar)
--
-- Añade las columnas de contacto y redes sociales
-- a la tabla business_data existente.
-- ============================================

-- 1. WhatsApp
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS whatsapp text;

-- 2. Teléfono fijo
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS phone_landline text;

-- 3. Teléfono móvil
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS phone_mobile text;

-- 4. Horario de atención
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS business_hours text;

-- 5. Quiénes somos
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS who_we_are text;

-- 6. Instagram
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_instagram text;

-- 7. Facebook
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_facebook text;

-- 8. TikTok
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_tiktok text;

-- 9. LinkedIn
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_linkedin text;

-- 10. YouTube
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_youtube text;

-- 11. Twitter / X
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_twitter text;

-- 12. Website
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS social_website text;

-- ============================================
-- ¡Listo! Columnas de contacto y redes sociales añadidas.
-- ============================================
