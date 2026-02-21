-- ============================================
-- Onboarding Digital Premium — Briefing de Identidade Visual
-- ============================================
-- Ejecuta este archivo en el SQL Editor de Supabase
-- (Dashboard > SQL Editor > New Query > pegar y ejecutar)
--
-- Añade las columnas del briefing de identidad visual
-- a la tabla business_data existente.
-- ============================================

-- 1. Columna: has_identity (boolean) — si ya tiene identidad visual o no
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS has_identity boolean;

-- 2. Columna: brand_differential — diferencial respecto a la competencia
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS brand_differential text;

-- 3. Columna: brand_mission — misión o propósito de la marca
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS brand_mission text;

-- 4. Columna: brand_slogan — slogan de la marca
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS brand_slogan text;

-- 5. Columna: audience_type — persona física (b2c), empresa (b2b) o ambos
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS audience_type text;

-- 6. Columna: brand_celebrity — si la marca fuera una persona famosa
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS brand_celebrity text;

-- 7. Columna: visual_references — marcas que admira visualmente
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS visual_references text;

-- 8. Columna: preferred_colors — colores que representan la marca
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS preferred_colors text;

-- 9. Columna: avoid_styles — colores/estilos/marcas que NO quiere
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS avoid_styles text;

-- 10. Columna: brand_applications — dónde se usará la identidad (array)
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS brand_applications text[];

-- 11. Columna: current_identity_notes — notas sobre identidad actual
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS current_identity_notes text;

-- 12. Columna: desired_deadline — plazo deseado
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS desired_deadline text;

-- 13. Columna: budget — inversión prevista
ALTER TABLE public.business_data
ADD COLUMN IF NOT EXISTS budget text;

-- ============================================
-- ¡Listo! Todas las columnas del briefing han sido añadidas.
-- Las columnas existentes (target_audience, brand_personality,
-- competitors, etc.) no se modifican.
-- ============================================
