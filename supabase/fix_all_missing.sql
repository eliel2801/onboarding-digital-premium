-- ============================================
-- Onboarding Digital Premium — FIX COMPLETO
-- ============================================
-- Ejecuta este archivo en el SQL Editor de Supabase
-- para corregir todos los problemas detectados.
-- ============================================

-- ═══════════════════════════════════════════
-- 1. REMOVER CONSTRAINT UNIQUE em user_id
--    (permite múltiplos projetos por usuário)
-- ═══════════════════════════════════════════
ALTER TABLE public.business_data DROP CONSTRAINT IF EXISTS business_data_user_id_key;

-- ═══════════════════════════════════════════
-- 2. COLUNAS DE BRIEFING (se faltarem)
-- ═══════════════════════════════════════════
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS has_identity boolean;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS brand_differential text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS brand_mission text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS brand_slogan text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS audience_type text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS brand_celebrity text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS visual_references text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS preferred_colors text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS avoid_styles text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS brand_applications text[];
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS current_identity_notes text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS desired_deadline text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS budget text;

-- ═══════════════════════════════════════════
-- 3. COLUNAS DE CONTACTO E REDES SOCIAIS
-- ═══════════════════════════════════════════
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS phone_landline text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS phone_mobile text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS business_hours text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS who_we_are text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_instagram text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_facebook text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_tiktok text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_linkedin text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_youtube text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_twitter text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS social_website text;

-- ═══════════════════════════════════════════
-- 4. VERIFICAR RLS POLICIES
-- ═══════════════════════════════════════════
-- DELETE policy (para poder apagar projetos no futuro)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'business_data' AND policyname = 'Users can delete own data'
  ) THEN
    CREATE POLICY "Users can delete own data" ON public.business_data
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ============================================
-- ¡Listo! Todos los problemas corregidos.
-- ============================================
