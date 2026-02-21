export type MainTab = 'business' | 'strategy' | 'visual' | 'dashboard' | 'admin';

export type UserRole = 'admin' | 'user';

export interface OnboardingData {
  id?: string;
  user_id: string;
  business_name: string;
  about_us: string;
  target_audience?: string;
  brand_personality?: string[];
  competitors?: string;
  logo_type_pref?: string;
  logo_urls?: string[];
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;

  // Briefing de identidade visual
  has_identity?: boolean;
  brand_differential?: string;
  brand_mission?: string;
  brand_slogan?: string;
  audience_type?: string;
  brand_celebrity?: string;
  visual_references?: string;
  preferred_colors?: string;
  avoid_styles?: string;
  brand_applications?: string[];
  current_identity_notes?: string;
  desired_deadline?: string;
  budget?: string;

  // Enhanced business info
  business_email?: string;
  business_address?: string;
  industry_sector?: string;
  year_founded?: string;

  // Enhanced strategy
  brand_values?: string[];
  tone_of_voice?: string;
  geographic_market?: string;

  // Link collectors
  visual_reference_links?: string[];
  competitor_links?: string[];
  inspiration_links?: string[];

  // Color picker
  preferred_colors_hex?: string[];

  // Contacto y redes sociales
  whatsapp?: string;
  phone_landline?: string;
  phone_mobile?: string;
  business_hours?: string;
  who_we_are?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
  social_linkedin?: string;
  social_youtube?: string;
  social_twitter?: string;
  social_website?: string;

  // Domain selection
  selected_domain?: string;

  // Soft delete
  deleted_by_user?: boolean;
  deleted_at?: string;

  // Admin enrichment (not in DB, added client-side)
  user_email?: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}
