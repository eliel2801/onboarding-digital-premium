-- Migration: Enhanced onboarding fields
-- Adds new columns for business info, strategy, link collectors, and color picker

-- Business info
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS business_email text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS industry_sector text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS year_founded text;

-- Strategy
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS brand_values text[];
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS tone_of_voice text;
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS geographic_market text;

-- Link collectors
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS visual_reference_links text[];
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS competitor_links text[];
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS inspiration_links text[];

-- Color picker
ALTER TABLE public.business_data ADD COLUMN IF NOT EXISTS preferred_colors_hex text[];
