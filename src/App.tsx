import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { MainTab, OnboardingData, UserRole } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Header, TabNav } from './components/Header';
import { BusinessTab } from './components/tabs/BusinessTab';
import { StrategyTab } from './components/tabs/StrategyTab';
import { VisualTab } from './components/tabs/VisualTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { AdminPanel } from './components/AdminPanel';
import { ToastProvider, useToast } from './components/ui';
import { Modal } from './components/ui';
import type { Session } from '@supabase/supabase-js';

function AppContent() {
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('business');
  const [userRole, setUserRole] = useState<UserRole>('user');

  // Tab 1 — Tu Negocio
  const [businessName, setBusinessName] = useState('');
  const [aboutUs, setAboutUs] = useState('');

  // Tab 2 — Estrategia
  const [hasIdentity, setHasIdentity] = useState<boolean | null>(null);
  const [targetAudience, setTargetAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [brandPersonality, setBrandPersonality] = useState<string[]>([]);
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);
  const [identityDescription, setIdentityDescription] = useState('');
  const [identityFont, setIdentityFont] = useState('');
  const [identityColor1, setIdentityColor1] = useState('#000000');
  const [identityColor2, setIdentityColor2] = useState('#ffffff');

  // Briefing de identidade visual (caminho "não tenho")
  const [brandDifferential, setBrandDifferential] = useState('');
  const [brandMission, setBrandMission] = useState('');
  const [brandSlogan, setBrandSlogan] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [brandCelebrity, setBrandCelebrity] = useState('');
  const [visualReferences, setVisualReferences] = useState('');
  const [preferredColors, setPreferredColors] = useState('');
  const [avoidStyles, setAvoidStyles] = useState('');
  const [brandApplications, setBrandApplications] = useState<string[]>([]);
  const [currentIdentityNotes, setCurrentIdentityNotes] = useState('');
  const [desiredDeadline, setDesiredDeadline] = useState('');
  const [budget, setBudget] = useState('');

  // Enhanced business info (Tab 1)
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [yearFounded, setYearFounded] = useState('');

  // Enhanced strategy (Tab 2)
  const [brandValuesSelected, setBrandValuesSelected] = useState<string[]>([]);
  const [toneOfVoiceSelected, setToneOfVoiceSelected] = useState('');
  const [geographicMarket, setGeographicMarket] = useState('');

  // Link collectors (Tab 2)
  const [visualReferenceLinks, setVisualReferenceLinks] = useState<string[]>([]);
  const [competitorLinks, setCompetitorLinks] = useState<string[]>([]);
  const [inspirationLinks, setInspirationLinks] = useState<string[]>([]);

  // Color picker (Tab 2)
  const [preferredColorsHex, setPreferredColorsHex] = useState<string[]>([]);

  // Domain selection
  const [selectedDomain, setSelectedDomain] = useState('');

  // Tab 3 — Briefing final
  const [logoTypePref, setLogoTypePref] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneLandline, setPhoneLandline] = useState('');
  const [phoneMobile, setPhoneMobile] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [whoWeAre, setWhoWeAre] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialWebsite, setSocialWebsite] = useState('');

  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState<OnboardingData[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasProjects = projects.length > 0;
  const showDashboard = hasProjects && !isCreatingNew;

  // Progreso
  const tabs: MainTab[] = ['business', 'strategy', 'visual'];
  const currentTabIndex = tabs.indexOf(activeTab);
  const progress = activeTab === 'dashboard' || activeTab === 'admin' ? 100 : ((currentTabIndex + 1) / tabs.length) * 100;

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    console.log('[DEBUG] fetchUserRole called for userId:', userId);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    console.log('[DEBUG] user_roles response:', { data, error });
    if (data && !error) return data.role as UserRole;
    return 'user';
  };

  const fetchProjects = async (userId: string, role: UserRole) => {
    let query = supabase
      .from('business_data')
      .select('*')
      .order('created_at', { ascending: false });

    // User only sees their own (RLS handles soft-delete filtering too)
    if (role !== 'admin') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (data && !error) {
      let enrichedData = data as OnboardingData[];

      // Admin: enrich with user emails
      if (role === 'admin' && enrichedData.length > 0) {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, email');

        if (rolesData) {
          const emailMap: Record<string, string> = {};
          rolesData.forEach((r: any) => { emailMap[r.user_id] = r.email; });
          enrichedData = enrichedData.map(p => ({
            ...p,
            user_email: emailMap[p.user_id] || p.user_id,
          }));
        }
      }

      if (enrichedData.length > 0) {
        setProjects(enrichedData);
        setActiveTab('dashboard');
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          await fetchProjects(session.user.id, role);
        } catch (e) {
          console.error('Error loading user data:', e);
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        try {
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          await fetchProjects(session.user.id, role);
        } catch (e) {
          console.error('Error loading user data:', e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetForm = () => {
    setBusinessName('');
    setAboutUs('');
    setHasIdentity(null);
    setTargetAudience('');
    setCompetitors('');
    setBrandPersonality([]);
    setIdentityFiles([]);
    setIdentityDescription('');
    setIdentityFont('');
    setIdentityColor1('#000000');
    setIdentityColor2('#ffffff');
    setBrandDifferential('');
    setBrandMission('');
    setBrandSlogan('');
    setAudienceType('');
    setBrandCelebrity('');
    setVisualReferences('');
    setPreferredColors('');
    setAvoidStyles('');
    setBrandApplications([]);
    setCurrentIdentityNotes('');
    setDesiredDeadline('');
    setBudget('');
    setBusinessEmail('');
    setBusinessAddress('');
    setIndustrySector('');
    setYearFounded('');
    setBrandValuesSelected([]);
    setToneOfVoiceSelected('');
    setGeographicMarket('');
    setVisualReferenceLinks([]);
    setCompetitorLinks([]);
    setInspirationLinks([]);
    setPreferredColorsHex([]);
    setSelectedDomain('');
    setLogoTypePref('');
    setFiles([]);
    setWhatsapp('');
    setPhoneLandline('');
    setPhoneMobile('');
    setBusinessHours('');
    setWhoWeAre('');
    setSocialInstagram('');
    setSocialFacebook('');
    setSocialTiktok('');
    setSocialLinkedin('');
    setSocialYoutube('');
    setSocialTwitter('');
    setSocialWebsite('');
  };

  const handleNewProject = () => {
    resetForm();
    setEditingProjectId(null);
    setIsCreatingNew(true);
    setActiveTab('business');
  };

  const handleEditProject = (project: OnboardingData) => {
    // Carregar todos os dados do projeto no formulário
    setBusinessName(project.business_name || '');
    setAboutUs(project.about_us || '');
    setHasIdentity(project.has_identity ?? null);
    setTargetAudience(project.target_audience || '');
    setCompetitors(project.competitors || '');
    setBrandPersonality(project.brand_personality || []);
    setIdentityFiles([]);
    setIdentityDescription('');
    setIdentityFont('');
    setIdentityColor1('#000000');
    setIdentityColor2('#ffffff');
    setBrandDifferential(project.brand_differential || '');
    setBrandMission(project.brand_mission || '');
    setBrandSlogan(project.brand_slogan || '');
    setAudienceType(project.audience_type || '');
    setBrandCelebrity(project.brand_celebrity || '');
    setVisualReferences(project.visual_references || '');
    setPreferredColors(project.preferred_colors || '');
    setAvoidStyles(project.avoid_styles || '');
    setBrandApplications(project.brand_applications || []);
    setCurrentIdentityNotes(project.current_identity_notes || '');
    setDesiredDeadline(project.desired_deadline || '');
    setBudget(project.budget || '');
    setBusinessEmail(project.business_email || '');
    setBusinessAddress(project.business_address || '');
    setIndustrySector(project.industry_sector || '');
    setYearFounded(project.year_founded || '');
    setBrandValuesSelected(project.brand_values || []);
    setToneOfVoiceSelected(project.tone_of_voice || '');
    setGeographicMarket(project.geographic_market || '');
    setVisualReferenceLinks(project.visual_reference_links || []);
    setCompetitorLinks(project.competitor_links || []);
    setInspirationLinks(project.inspiration_links || []);
    setPreferredColorsHex(project.preferred_colors_hex || []);
    setSelectedDomain(project.selected_domain || '');
    setLogoTypePref(project.logo_type_pref || '');
    setFiles([]);
    setWhatsapp(project.whatsapp || '');
    setPhoneLandline(project.phone_landline || '');
    setPhoneMobile(project.phone_mobile || '');
    setBusinessHours(project.business_hours || '');
    setWhoWeAre(project.who_we_are || '');
    setSocialInstagram(project.social_instagram || '');
    setSocialFacebook(project.social_facebook || '');
    setSocialTiktok(project.social_tiktok || '');
    setSocialLinkedin(project.social_linkedin || '');
    setSocialYoutube(project.social_youtube || '');
    setSocialTwitter(project.social_twitter || '');
    setSocialWebsite(project.social_website || '');

    setEditingProjectId(project.id || null);
    setIsCreatingNew(true);
    setActiveTab('business');
  };

  const handleBackToDashboard = () => {
    setIsCreatingNew(false);
    setEditingProjectId(null);
    setActiveTab('dashboard');
  };

  const handleDeleteProject = (projectId: string) => {
    setDeletingProjectId(projectId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (!deletingProjectId || !session) return;
    setDeleting(true);

    try {
      if (userRole === 'admin') {
        // Admin: hard delete
        const { error } = await supabase
          .from('business_data')
          .delete()
          .eq('id', deletingProjectId);

        if (error) throw error;

        setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
        toast('Proyecto eliminado permanentemente.', 'success');
      } else {
        // User: soft delete via RPC (bypasses SELECT policy WITH CHECK conflict)
        const { error } = await supabase
          .rpc('soft_delete_project', { project_id: deletingProjectId });

        if (error) throw error;

        setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
        toast('Proyecto archivado correctamente.', 'success');
      }

      // If no projects left, go to business tab
      if (projects.length <= 1) {
        setIsCreatingNew(false);
        setActiveTab('business');
      }
    } catch (error: any) {
      toast(`Error al eliminar: ${error.message}`, 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletingProjectId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProjects([]);
    setIsCreatingNew(false);
    setUserRole('user');
    resetForm();
    setActiveTab('business');
  };

  const handleSubmitOnboarding = async () => {
    if (!session) return;
    setShowConfirmModal(false);
    setUploading(true);

    try {
      const logoUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);

        logoUrls.push(publicUrl);
      }

      // Buscar logo_urls existentes se estiver editando
      const existingProject = editingProjectId
        ? projects.find(p => p.id === editingProjectId)
        : null;
      const existingLogoUrls = existingProject?.logo_urls || [];

      const payload = {
        user_id: editingProjectId ? (existingProject?.user_id || session.user.id) : session.user.id,
        business_name: businessName,
        about_us: aboutUs,
        has_identity: hasIdentity ?? null,
        target_audience: targetAudience || null,
        brand_personality: brandPersonality.length > 0 ? brandPersonality : null,
        competitors: competitors || null,
        logo_type_pref: logoTypePref || null,
        logo_urls: logoUrls.length > 0 ? [...existingLogoUrls, ...logoUrls] : existingLogoUrls,
        ...(!editingProjectId && { status: 'pending' as const }),
        // Enhanced business info
        business_email: businessEmail || null,
        business_address: businessAddress || null,
        industry_sector: industrySector || null,
        year_founded: yearFounded || null,
        // Enhanced strategy
        brand_values: brandValuesSelected.length > 0 ? brandValuesSelected : null,
        tone_of_voice: toneOfVoiceSelected || null,
        geographic_market: geographicMarket || null,
        // Link collectors
        visual_reference_links: visualReferenceLinks.length > 0 ? visualReferenceLinks : null,
        competitor_links: competitorLinks.length > 0 ? competitorLinks : null,
        inspiration_links: inspirationLinks.length > 0 ? inspirationLinks : null,
        // Color picker
        preferred_colors_hex: preferredColorsHex.length > 0 ? preferredColorsHex : null,
        // Domain
        selected_domain: selectedDomain || null,
        // Briefing de identidade visual
        brand_differential: brandDifferential || null,
        brand_mission: brandMission || null,
        brand_slogan: brandSlogan || null,
        audience_type: audienceType || null,
        brand_celebrity: brandCelebrity || null,
        visual_references: visualReferences || null,
        preferred_colors: preferredColors || null,
        avoid_styles: avoidStyles || null,
        brand_applications: brandApplications.length > 0 ? brandApplications : null,
        current_identity_notes: currentIdentityNotes || null,
        desired_deadline: desiredDeadline || null,
        budget: budget || null,
        // Contacto y redes
        whatsapp: whatsapp || null,
        phone_landline: phoneLandline || null,
        phone_mobile: phoneMobile || null,
        business_hours: businessHours || null,
        who_we_are: whoWeAre || null,
        social_instagram: socialInstagram || null,
        social_facebook: socialFacebook || null,
        social_tiktok: socialTiktok || null,
        social_linkedin: socialLinkedin || null,
        social_youtube: socialYoutube || null,
        social_twitter: socialTwitter || null,
        social_website: socialWebsite || null,
      };

      let resultProject: OnboardingData;

      if (editingProjectId) {
        // UPDATE — editar projeto existente
        const { data, error: dbError } = await supabase
          .from('business_data')
          .update(payload)
          .eq('id', editingProjectId)
          .select()
          .single();

        if (dbError) throw dbError;
        resultProject = data as OnboardingData;

        setProjects(prev =>
          prev.map(p => p.id === editingProjectId ? resultProject : p)
        );
        toast('¡Proyecto actualizado con éxito!', 'success');
      } else {
        // INSERT — novo projeto
        const { data, error: dbError } = await supabase
          .from('business_data')
          .insert({ ...payload, status: 'pending' as const })
          .select()
          .single();

        if (dbError) throw dbError;
        resultProject = data as OnboardingData;

        setProjects(prev => [resultProject, ...prev]);
        toast('¡Proyecto enviado con éxito!', 'success');
      }

      setIsCreatingNew(false);
      setEditingProjectId(null);
      setActiveTab('dashboard');
      resetForm();
    } catch (error: any) {
      toast(`Error al enviar: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        email={session.user.email || ''}
        progress={progress}
        onLogout={handleLogout}
        userRole={userRole}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        <TabNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasProjects={hasProjects}
          isCreatingNew={isCreatingNew}
          onBackToDashboard={handleBackToDashboard}
          userRole={userRole}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'business' && (
            <BusinessTab
              businessName={businessName}
              setBusinessName={setBusinessName}
              aboutUs={aboutUs}
              setAboutUs={setAboutUs}
              businessEmail={businessEmail}
              setBusinessEmail={setBusinessEmail}
              businessAddress={businessAddress}
              setBusinessAddress={setBusinessAddress}
              industrySector={industrySector}
              setIndustrySector={setIndustrySector}
              yearFounded={yearFounded}
              setYearFounded={setYearFounded}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              isEditing={!!editingProjectId}
              onNext={() => setActiveTab('strategy')}
            />
          )}

          {activeTab === 'strategy' && (
            <StrategyTab
              hasIdentity={hasIdentity}
              setHasIdentity={setHasIdentity}
              businessName={businessName}
              aboutUs={aboutUs}
              isEditing={!!editingProjectId}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              competitors={competitors}
              setCompetitors={setCompetitors}
              brandPersonality={brandPersonality}
              setBrandPersonality={setBrandPersonality}
              identityFiles={identityFiles}
              setIdentityFiles={setIdentityFiles}
              identityDescription={identityDescription}
              setIdentityDescription={setIdentityDescription}
              identityFont={identityFont}
              setIdentityFont={setIdentityFont}
              identityColor1={identityColor1}
              setIdentityColor1={setIdentityColor1}
              identityColor2={identityColor2}
              setIdentityColor2={setIdentityColor2}
              brandDifferential={brandDifferential}
              setBrandDifferential={setBrandDifferential}
              brandMission={brandMission}
              setBrandMission={setBrandMission}
              brandSlogan={brandSlogan}
              setBrandSlogan={setBrandSlogan}
              audienceType={audienceType}
              setAudienceType={setAudienceType}
              brandCelebrity={brandCelebrity}
              setBrandCelebrity={setBrandCelebrity}
              visualReferences={visualReferences}
              setVisualReferences={setVisualReferences}
              preferredColors={preferredColors}
              setPreferredColors={setPreferredColors}
              avoidStyles={avoidStyles}
              setAvoidStyles={setAvoidStyles}
              brandApplicationsList={brandApplications}
              setBrandApplicationsList={setBrandApplications}
              currentIdentityNotes={currentIdentityNotes}
              setCurrentIdentityNotes={setCurrentIdentityNotes}
              desiredDeadline={desiredDeadline}
              setDesiredDeadline={setDesiredDeadline}
              budget={budget}
              setBudget={setBudget}
              brandValuesSelected={brandValuesSelected}
              setBrandValuesSelected={setBrandValuesSelected}
              toneOfVoiceSelected={toneOfVoiceSelected}
              setToneOfVoiceSelected={setToneOfVoiceSelected}
              geographicMarket={geographicMarket}
              setGeographicMarket={setGeographicMarket}
              visualReferenceLinks={visualReferenceLinks}
              setVisualReferenceLinks={setVisualReferenceLinks}
              competitorLinks={competitorLinks}
              setCompetitorLinks={setCompetitorLinks}
              inspirationLinks={inspirationLinks}
              setInspirationLinks={setInspirationLinks}
              preferredColorsHex={preferredColorsHex}
              setPreferredColorsHex={setPreferredColorsHex}
              onNext={() => setActiveTab('visual')}
              onBack={() => setActiveTab('business')}
            />
          )}

          {activeTab === 'visual' && (
            <VisualTab
              businessName={businessName}
              aboutUs={aboutUs}
              hasIdentity={hasIdentity}
              targetAudience={targetAudience}
              competitors={competitors}
              brandPersonality={brandPersonality}
              identityFont={identityFont}
              identityColor1={identityColor1}
              identityColor2={identityColor2}
              identityDescription={identityDescription}
              identityFiles={identityFiles}
              brandDifferential={brandDifferential}
              brandMission={brandMission}
              brandSlogan={brandSlogan}
              audienceType={audienceType}
              brandCelebrity={brandCelebrity}
              visualReferences={visualReferences}
              preferredColors={preferredColors}
              avoidStyles={avoidStyles}
              brandApplicationsList={brandApplications}
              currentIdentityNotes={currentIdentityNotes}
              desiredDeadline={desiredDeadline}
              budget={budget}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              phoneLandline={phoneLandline}
              setPhoneLandline={setPhoneLandline}
              phoneMobile={phoneMobile}
              setPhoneMobile={setPhoneMobile}
              businessHours={businessHours}
              setBusinessHours={setBusinessHours}
              whoWeAre={whoWeAre}
              setWhoWeAre={setWhoWeAre}
              socialInstagram={socialInstagram}
              setSocialInstagram={setSocialInstagram}
              socialFacebook={socialFacebook}
              setSocialFacebook={setSocialFacebook}
              socialTiktok={socialTiktok}
              setSocialTiktok={setSocialTiktok}
              socialLinkedin={socialLinkedin}
              setSocialLinkedin={setSocialLinkedin}
              socialYoutube={socialYoutube}
              setSocialYoutube={setSocialYoutube}
              socialTwitter={socialTwitter}
              setSocialTwitter={setSocialTwitter}
              socialWebsite={socialWebsite}
              setSocialWebsite={setSocialWebsite}
              logoTypePref={logoTypePref}
              setLogoTypePref={setLogoTypePref}
              files={files}
              setFiles={setFiles}
              uploading={uploading}
              onSubmit={() => setShowConfirmModal(true)}
              onBack={() => setActiveTab('strategy')}
            />
          )}

          {activeTab === 'dashboard' && showDashboard && (
            <DashboardTab
              projects={projects}
              onNewProject={handleNewProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              userRole={userRole}
            />
          )}

          {activeTab === 'admin' && userRole === 'admin' && (
            <AdminPanel />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center border-t border-neutral-800/50">
        <p className="text-[11px] text-neutral-600 tracking-wider uppercase">
          &copy; 2026 Onboarding Digital Premium
        </p>
      </footer>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar envío"
      >
        <div className="space-y-5">
          <p className="text-neutral-400 text-sm">
            ¿Estás seguro de que quieres finalizar y enviar tu proyecto?
          </p>
          <div className="text-sm space-y-2 bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
            <p><span className="font-medium text-white">Empresa:</span> <span className="text-neutral-400">{businessName}</span></p>
            <p><span className="font-medium text-white">Archivos:</span> <span className="text-neutral-400">{files.length} archivo(s)</span></p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitOnboarding}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-200 transition-colors shadow-sm"
            >
              Confirmar envío
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingProjectId(null); }}
        title={userRole === 'admin' ? 'Eliminar permanentemente' : 'Archivar proyecto'}
      >
        <div className="space-y-5">
          <p className="text-neutral-400 text-sm">
            {userRole === 'admin'
              ? '¿Estás seguro de que quieres eliminar permanentemente este proyecto? Esta acción no se puede deshacer.'
              : '¿Estás seguro de que quieres archivar este proyecto? El proyecto dejará de aparecer en tu lista.'}
          </p>
          <div className="text-sm space-y-2 bg-red-950/30 rounded-xl p-4 border border-red-900/30">
            <p>
              <span className="font-medium text-red-400">Proyecto:</span>{' '}
              <span className="text-red-300">
                {projects.find(p => p.id === deletingProjectId)?.business_name || ''}
              </span>
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => { setShowDeleteModal(false); setDeletingProjectId(null); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteProject}
              disabled={deleting}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {deleting
                ? 'Eliminando...'
                : userRole === 'admin'
                  ? 'Eliminar permanentemente'
                  : 'Archivar proyecto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
