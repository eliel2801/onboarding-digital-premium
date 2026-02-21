import React from 'react';
import { ChevronLeft, Loader2, Phone, MessageCircle, Clock, Users, Globe, Instagram, Facebook, Linkedin, Youtube, Twitter, Building2, FileText, Palette, Eye, Sparkles, CheckCircle2, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Card, Button, Textarea } from '../ui';

interface VisualTabProps {
  // Datos de pasos anteriores (readonly)
  businessName: string;
  aboutUs: string;
  hasIdentity: boolean | null;
  targetAudience: string;
  competitors: string;
  brandPersonality: string[];
  identityFont: string;
  identityColor1: string;
  identityColor2: string;
  identityDescription: string;
  identityFiles: File[];
  brandDifferential: string;
  brandMission: string;
  brandSlogan: string;
  audienceType: string;
  brandCelebrity: string;
  visualReferences: string;
  preferredColors: string;
  avoidStyles: string;
  brandApplicationsList: string[];
  currentIdentityNotes: string;
  desiredDeadline: string;
  budget: string;
  // Nuevos campos editables
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  phoneLandline: string;
  setPhoneLandline: (v: string) => void;
  phoneMobile: string;
  setPhoneMobile: (v: string) => void;
  businessHours: string;
  setBusinessHours: (v: string) => void;
  whoWeAre: string;
  setWhoWeAre: (v: string) => void;
  socialInstagram: string;
  setSocialInstagram: (v: string) => void;
  socialFacebook: string;
  setSocialFacebook: (v: string) => void;
  socialTiktok: string;
  setSocialTiktok: (v: string) => void;
  socialLinkedin: string;
  setSocialLinkedin: (v: string) => void;
  socialYoutube: string;
  setSocialYoutube: (v: string) => void;
  socialTwitter: string;
  setSocialTwitter: (v: string) => void;
  socialWebsite: string;
  setSocialWebsite: (v: string) => void;
  // Logo / Files
  logoTypePref: string;
  setLogoTypePref: (v: string) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  uploading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

// ─── Section Header ───
const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 pb-4 border-b border-neutral-700">
    <div className="w-9 h-9 rounded-lg bg-neutral-950 text-white flex items-center justify-center shrink-0">
      <Icon size={16} strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-white uppercase tracking-wide">{title}</h3>
      <p className="text-[11px] text-neutral-500">{subtitle}</p>
    </div>
  </div>
);

// ─── Read-only summary row ───
const SummaryRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 sm:w-40 sm:text-right pt-0.5">{label}</span>
      <span className="text-sm text-neutral-300 whitespace-pre-line flex-1">{value}</span>
    </div>
  );
};

// ─── Social input row with prefix ───
const SocialInput = ({ icon: Icon, label, value, onChange, placeholder, prefix }: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  prefix?: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-neutral-800/40 text-neutral-500 flex items-center justify-center shrink-0">
      <Icon size={16} strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0">
      <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center">
        {prefix && (
          <span className="text-xs text-neutral-400 font-mono shrink-0 select-none">{prefix}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-0 py-1 bg-transparent border-none text-sm text-white placeholder-neutral-500 focus:outline-none"
        />
      </div>
    </div>
  </div>
);

// ─── TikTok icon (not in lucide) ───
const TikTokIcon = ({ size = 16, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const VisualTab = ({
  businessName,
  aboutUs,
  hasIdentity,
  targetAudience,
  competitors,
  brandPersonality,
  identityFont,
  identityColor1,
  identityColor2,
  identityDescription,
  identityFiles,
  brandDifferential,
  brandMission,
  brandSlogan,
  audienceType,
  brandCelebrity,
  visualReferences,
  preferredColors,
  avoidStyles,
  brandApplicationsList,
  currentIdentityNotes,
  desiredDeadline,
  budget,
  whatsapp,
  setWhatsapp,
  phoneLandline,
  setPhoneLandline,
  phoneMobile,
  setPhoneMobile,
  businessHours,
  setBusinessHours,
  whoWeAre,
  setWhoWeAre,
  socialInstagram,
  setSocialInstagram,
  socialFacebook,
  setSocialFacebook,
  socialTiktok,
  setSocialTiktok,
  socialLinkedin,
  setSocialLinkedin,
  socialYoutube,
  setSocialYoutube,
  socialTwitter,
  setSocialTwitter,
  socialWebsite,
  setSocialWebsite,
  logoTypePref,
  setLogoTypePref,
  files,
  setFiles,
  uploading,
  onSubmit,
  onBack,
}: VisualTabProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const audienceLabel = audienceType === 'b2c' ? 'Persona física (B2C)' : audienceType === 'b2b' ? 'Empresa (B2B)' : audienceType === 'both' ? 'Ambos (B2C + B2B)' : '';

  return (
    <motion.div
      key="visual-briefing"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Briefing del Proyecto</h1>
        <p className="text-neutral-500 text-sm">Revisa la información y completa los datos de contacto para finalizar.</p>
      </div>

      {/* ═══════ RESUMEN: DATOS DEL NEGOCIO ═══════ */}
      <Card className="p-6 sm:p-8 space-y-5">
        <SectionHeader icon={Building2} title="Tu Negocio" subtitle="Información definida en los pasos anteriores" />
        <div className="space-y-3 pl-1">
          <SummaryRow label="Nombre" value={businessName} />
          <SummaryRow label="Descripción" value={aboutUs} />
          <SummaryRow label="Identidad visual" value={hasIdentity === true ? 'Ya tiene' : hasIdentity === false ? 'Crear desde cero' : undefined} />
          {hasIdentity === true && (
            <>
              <SummaryRow label="Tipografía" value={identityFont} />
              {(identityColor1 !== '#000000' || identityColor2 !== '#ffffff') && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 sm:w-40 sm:text-right">Colores</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md border border-neutral-700" style={{ backgroundColor: identityColor1 }} />
                    <span className="text-xs font-mono text-neutral-500 uppercase">{identityColor1}</span>
                    <div className="w-6 h-6 rounded-md border border-neutral-700 ml-2" style={{ backgroundColor: identityColor2 }} />
                    <span className="text-xs font-mono text-neutral-500 uppercase">{identityColor2}</span>
                  </div>
                </div>
              )}
              <SummaryRow label="Descripción ID" value={identityDescription} />
              {identityFiles.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 sm:w-40 sm:text-right pt-0.5">Archivos ID</span>
                  <span className="text-sm text-neutral-300">{identityFiles.length} archivo(s) adjuntos</span>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* ═══════ RESUMEN: ESTRATEGIA ═══════ */}
      {hasIdentity === false && (
        <Card className="p-6 sm:p-8 space-y-5">
          <SectionHeader icon={Sparkles} title="Estrategia de Marca" subtitle="Briefing de identidad visual" />
          <div className="space-y-3 pl-1">
            <SummaryRow label="Diferencial" value={brandDifferential} />
            <SummaryRow label="Misión" value={brandMission} />
            <SummaryRow label="Slogan" value={brandSlogan} />
            <SummaryRow label="Público" value={targetAudience} />
            <SummaryRow label="Tipo público" value={audienceLabel} />
            {brandPersonality.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 sm:w-40 sm:text-right pt-0.5">Personalidad</span>
                <div className="flex flex-wrap gap-1.5">
                  {brandPersonality.map(p => (
                    <span key={p} className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            )}
            <SummaryRow label="Celebridad" value={brandCelebrity} />
            <SummaryRow label="Ref. visuales" value={visualReferences} />
            <SummaryRow label="Colores pref." value={preferredColors} />
            <SummaryRow label="Evitar" value={avoidStyles} />
            <SummaryRow label="Competidores" value={competitors} />
            {brandApplicationsList.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 sm:w-40 sm:text-right pt-0.5">Aplicaciones</span>
                <div className="flex flex-wrap gap-1.5">
                  {brandApplicationsList.map(a => (
                    <span key={a} className="px-2.5 py-1 text-xs font-medium bg-neutral-800/40 text-neutral-300 rounded-full border border-neutral-700">{a}</span>
                  ))}
                </div>
              </div>
            )}
            <SummaryRow label="Notas actuales" value={currentIdentityNotes} />
            <SummaryRow label="Plazo" value={desiredDeadline} />
            <SummaryRow label="Inversión" value={budget} />
          </div>
        </Card>
      )}

      {/* ═══════ QUIÉN SOMOS ═══════ */}
      <Card className="p-6 sm:p-8 space-y-6">
        <SectionHeader icon={Users} title="Quiénes Somos" subtitle="Texto de presentación de la empresa" />
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-neutral-400 tracking-wide">
            Escribe un texto breve de "Quiénes somos" para tu proyecto
          </label>
          <textarea
            value={whoWeAre}
            onChange={(e) => setWhoWeAre(e.target.value)}
            placeholder="Ej: Somos una empresa fundada en 2020 especializada en soluciones digitales para pequeñas y medianas empresas. Nuestro equipo de 5 profesionales combina experiencia en diseño, desarrollo web y marketing digital para transformar la presencia online de nuestros clientes..."
            rows={5}
            className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 resize-none transition-all"
          />
        </div>
      </Card>

      {/* ═══════ TELÉFONOS ═══════ */}
      <Card className="p-6 sm:p-8 space-y-6">
        <SectionHeader icon={Phone} title="Teléfonos" subtitle="Números de contacto de la empresa" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} strokeWidth={1.5} className="text-neutral-400" />
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">WhatsApp</label>
            </div>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone size={14} strokeWidth={1.5} className="text-neutral-400" />
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Teléfono fijo</label>
            </div>
            <input
              type="tel"
              value={phoneLandline}
              onChange={(e) => setPhoneLandline(e.target.value)}
              placeholder="+34 900 000 000"
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone size={14} strokeWidth={1.5} className="text-neutral-400" />
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Teléfono móvil</label>
            </div>
            <input
              type="tel"
              value={phoneMobile}
              onChange={(e) => setPhoneMobile(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
            />
          </div>
        </div>
      </Card>

      {/* ═══════ HORARIO DE ATENCIÓN ═══════ */}
      <Card className="p-6 sm:p-8 space-y-6">
        <SectionHeader icon={Clock} title="Horario de Atención" subtitle="Días y horas de atención al cliente" />
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Lun-Vie 9:00-18:00', value: 'Lunes a Viernes: 09:00 — 18:00\nSábados y Domingos: Cerrado' },
            { label: 'Lun-Sáb 9:00-14:00, 16:00-20:00', value: 'Lunes a Sábado: 09:00 — 14:00 / 16:00 — 20:00\nDomingos: Cerrado' },
            { label: '24/7', value: 'Lunes a Domingo: 24 horas' },
          ].map(tpl => (
            <button
              key={tpl.label}
              onClick={() => setBusinessHours(tpl.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-700 text-neutral-400 hover:border-white hover:bg-neutral-900 hover:text-white transition-all duration-200"
            >
              {tpl.label}
            </button>
          ))}
        </div>
        <textarea
          value={businessHours}
          onChange={(e) => setBusinessHours(e.target.value)}
          placeholder={"Lunes a Viernes: 09:00 — 18:00\nSábados: 10:00 — 14:00\nDomingos: Cerrado"}
          rows={4}
          className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 resize-none transition-all"
        />
      </Card>

      {/* ═══════ REDES SOCIALES ═══════ */}
      <Card className="p-6 sm:p-8 space-y-5">
        <SectionHeader icon={Globe} title="Redes Sociales" subtitle="Perfiles y enlaces de la empresa" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <SocialInput
            icon={Instagram}
            label="Instagram"
            value={socialInstagram}
            onChange={setSocialInstagram}
            prefix="instagram.com/"
            placeholder="tuempresa"
          />
          <SocialInput
            icon={Facebook}
            label="Facebook"
            value={socialFacebook}
            onChange={setSocialFacebook}
            prefix="facebook.com/"
            placeholder="tuempresa"
          />
          <SocialInput
            icon={TikTokIcon}
            label="TikTok"
            value={socialTiktok}
            onChange={setSocialTiktok}
            prefix="tiktok.com/@"
            placeholder="tuempresa"
          />
          <SocialInput
            icon={Linkedin}
            label="LinkedIn"
            value={socialLinkedin}
            onChange={setSocialLinkedin}
            prefix="linkedin.com/company/"
            placeholder="tuempresa"
          />
          <SocialInput
            icon={Youtube}
            label="YouTube"
            value={socialYoutube}
            onChange={setSocialYoutube}
            prefix="youtube.com/@"
            placeholder="tuempresa"
          />
          <SocialInput
            icon={Twitter}
            label="X (Twitter)"
            value={socialTwitter}
            onChange={setSocialTwitter}
            prefix="x.com/"
            placeholder="tuempresa"
          />
          <SocialInput
            icon={Globe}
            label="Sitio web"
            value={socialWebsite}
            onChange={setSocialWebsite}
            placeholder="www.tuempresa.com"
          />
        </div>
      </Card>

      {/* ═══════ ARCHIVOS ADICIONALES ═══════ */}
      <Card className="p-6 sm:p-8 space-y-6">
        <SectionHeader icon={FileText} title="Archivos Adicionales" subtitle="Documentos o imágenes complementarias" />
        <div className="relative border border-dashed border-neutral-700 rounded-2xl p-10 hover:border-white transition-all duration-300 bg-neutral-800/60 text-center group cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*,.svg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto mb-3 text-neutral-300 group-hover:text-white transition-colors" size={28} strokeWidth={1.5} />
          <p className="text-sm text-neutral-500 font-medium">Haz clic para subir archivos</p>
          <p className="text-xs text-neutral-400 mt-1">Imágenes, PDF, documentos de Office</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-neutral-800/60 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-3 min-w-0">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-10 h-10 rounded-lg object-cover border border-neutral-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-sm text-neutral-300 truncate block">{file.name}</span>
                    <span className="text-[11px] text-neutral-400">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors shrink-0">
                  <X size={14} strokeWidth={1.5} className="text-neutral-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ═══════ NAVEGACIÓN ═══════ */}
      <div className="flex justify-between pt-2 pb-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft size={18} strokeWidth={1.5} /> Volver
        </Button>
        <Button onClick={onSubmit} className="px-8 py-3" disabled={uploading}>
          {uploading ? (
            <><Loader2 size={18} className="animate-spin" /> Enviando...</>
          ) : (
            'Finalizar Proyecto'
          )}
        </Button>
      </div>
    </motion.div>
  );
};
