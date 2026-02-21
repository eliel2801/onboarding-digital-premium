import React, { useState } from 'react';
import { CheckCircle2, Clock, Hourglass, Palette, Users, Swords, Image, Plus, ChevronDown, ChevronUp, Pencil, Globe, Phone, AtSign, Link2, ExternalLink, Mail, MapPin, Building2 as BuildingIcon, Calendar, Trash2, Archive, FileText, Loader2, Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { OnboardingData, UserRole } from '../../types';
import { Card, Button } from '../ui';

interface DashboardTabProps {
  projects: OnboardingData[];
  onNewProject: () => void;
  onEditProject: (project: OnboardingData) => void;
  onDeleteProject: (projectId: string) => void;
  userRole: UserRole;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Briefing Recibido', icon: CheckCircle2, color: 'bg-neutral-800 text-neutral-300 border-neutral-700' },
  in_progress: { label: 'En Curso', icon: Clock, color: 'bg-amber-950/30 text-amber-400 border-amber-800' },
  completed: { label: 'Completado', icon: CheckCircle2, color: 'bg-emerald-950/30 text-emerald-400 border-emerald-800' },
};

// ─── Detail Row ───
const DetailItem = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-1">{label}</p>
      <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
};

// ─── PRD Modal ───
const PrdModal = ({ prdContent, onClose }: { prdContent: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(prdContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = prdContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={18} strokeWidth={1.5} />
            PRD Generado
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 text-sm font-medium rounded-xl hover:bg-neutral-700 transition-all"
            >
              {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-neutral-300 leading-relaxed">
            {prdContent}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Generate PRD with Gemini ───
async function generatePRD(data: OnboardingData): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const projectData = `
NOMBRE DEL NEGOCIO: ${data.business_name}
SOBRE NOSOTROS: ${data.about_us || 'No especificado'}
QUIÉNES SOMOS: ${data.who_we_are || 'No especificado'}
EMAIL: ${data.business_email || 'No especificado'}
DIRECCIÓN: ${data.business_address || 'No especificada'}
SECTOR: ${data.industry_sector || 'No especificado'}
AÑO DE FUNDACIÓN: ${data.year_founded || 'No especificado'}
DOMINIO: ${data.selected_domain || 'No especificado'}

--- ESTRATEGIA ---
PÚBLICO OBJETIVO: ${data.target_audience || 'No especificado'}
TIPO DE PÚBLICO: ${data.audience_type || 'No especificado'}
COMPETIDORES: ${data.competitors || 'No especificado'}
LINKS COMPETIDORES: ${data.competitor_links?.join(', ') || 'No especificado'}
PERSONALIDAD DE MARCA: ${data.brand_personality?.join(', ') || 'No especificada'}
VALORES DE MARCA: ${data.brand_values?.join(', ') || 'No especificados'}
TONO DE VOZ: ${data.tone_of_voice || 'No especificado'}
MERCADO GEOGRÁFICO: ${data.geographic_market || 'No especificado'}
DIFERENCIAL: ${data.brand_differential || 'No especificado'}
MISIÓN: ${data.brand_mission || 'No especificada'}
SLOGAN: ${data.brand_slogan || 'No especificado'}
PERSONA FAMOSA (referencia): ${data.brand_celebrity || 'No especificado'}

--- IDENTIDAD VISUAL ---
TIPO DE LOGO PREFERIDO: ${data.logo_type_pref || 'No especificado'}
COLORES PREFERIDOS: ${data.preferred_colors || 'No especificado'}
COLORES HEX: ${data.preferred_colors_hex?.join(', ') || 'No especificado'}
ESTILOS A EVITAR: ${data.avoid_styles || 'No especificado'}
REFERENCIAS VISUALES: ${data.visual_references || 'No especificado'}
LINKS DE REFERENCIA VISUAL: ${data.visual_reference_links?.join(', ') || 'No especificado'}
LINKS DE INSPIRACIÓN: ${data.inspiration_links?.join(', ') || 'No especificado'}
APLICACIONES DE MARCA: ${data.brand_applications?.join(', ') || 'No especificado'}
IDENTIDAD ACTUAL: ${data.current_identity_notes || 'No especificado'}

--- CONTACTO ---
WHATSAPP: ${data.whatsapp || 'No especificado'}
TELÉFONO FIJO: ${data.phone_landline || 'No especificado'}
MÓVIL: ${data.phone_mobile || 'No especificado'}
HORARIO: ${data.business_hours || 'No especificado'}

--- REDES SOCIALES ---
INSTAGRAM: ${data.social_instagram || 'No especificado'}
FACEBOOK: ${data.social_facebook || 'No especificado'}
TIKTOK: ${data.social_tiktok || 'No especificado'}
LINKEDIN: ${data.social_linkedin || 'No especificado'}
YOUTUBE: ${data.social_youtube || 'No especificado'}
TWITTER/X: ${data.social_twitter || 'No especificado'}
WEBSITE: ${data.social_website || 'No especificado'}

--- PROYECTO ---
PLAZO: ${data.desired_deadline || 'No especificado'}
INVERSIÓN: ${data.budget || 'No especificado'}
`;

  const prompt = `Eres un Product Manager senior especializado en diseño web y branding digital.
Tu tarea es generar un PRD (Product Requirements Document) completo y profesional para construir la página web de este proyecto.

Datos del proyecto:
${projectData}

Genera el PRD en español con la siguiente estructura EXACTA (usa los encabezados con ##):

## 1. Resumen Ejecutivo
Breve descripción del proyecto, objetivos y alcance.

## 2. Sobre la Empresa
Descripción de la empresa, historia, misión, visión, diferencial competitivo y slogan.

## 3. Público Objetivo y Mercado
Análisis del público objetivo, tipo (B2B/B2C), mercado geográfico y segmentación.

## 4. Identidad Visual y Branding
Personalidad de marca, valores, tono de voz, colores (incluir los HEX), tipografía sugerida, estilo visual, estilos a evitar. Si hay una persona famosa como referencia, explicar qué atributos de esa persona se deben reflejar.

## 5. Estructura de Páginas y Secciones
Lista detallada de todas las páginas que debe tener el sitio web y qué secciones incluir en cada una (Hero, About, Servicios, Testimonios, Contacto, etc). Ser específico.

## 6. Contenido y Copywriting
Sugerencias de textos para las secciones principales usando el tono de voz definido. Incluir CTAs sugeridos.

## 7. Integraciones y Redes Sociales
Links de redes sociales a integrar, WhatsApp, formularios de contacto, mapa (si hay dirección), etc.

## 8. Requisitos Técnicos
Dominio, hosting, responsive design, SEO básico, velocidad de carga, accesibilidad.

## 9. Referencias e Inspiración
Sitios de referencia, competidores a analizar, marcas que admira el cliente.

## 10. Cronograma y Presupuesto
Plazo deseado por el cliente, inversión disponible, fases sugeridas de desarrollo.

IMPORTANTE:
- Sé específico y detallado, este PRD será usado directamente para construir la página.
- Si un dato dice "No especificado", omítelo o sugiere una recomendación.
- Usa un tono profesional pero accesible.
- El PRD debe estar listo para entregar a un diseñador/desarrollador.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  return response.text || 'Error al generar el PRD.';
}

const ProjectCard = ({
  data,
  defaultOpen,
  onEdit,
  onDelete,
  userRole,
}: {
  data: OnboardingData;
  defaultOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  userRole: UserRole;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [prdLoading, setPrdLoading] = useState(false);
  const [prdContent, setPrdContent] = useState<string | null>(data.prd_content || null);
  const [showPrdModal, setShowPrdModal] = useState(false);
  const status = statusConfig[data.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isArchived = data.deleted_by_user === true;

  const hasContactInfo = data.whatsapp || data.phone_landline || data.phone_mobile || data.business_hours;
  const hasSocialInfo = data.social_instagram || data.social_facebook || data.social_tiktok || data.social_linkedin || data.social_youtube || data.social_twitter || data.social_website;
  const hasBriefingInfo = data.brand_differential || data.brand_mission || data.brand_slogan || data.audience_type || data.brand_celebrity || data.visual_references || data.preferred_colors || data.avoid_styles;

  return (
    <Card className={cn("overflow-hidden", isArchived && "opacity-60")}>
      {/* Cabecera del proyecto */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 font-semibold text-base">
            {data.business_name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left min-w-0">
            <h3 className="font-semibold text-white truncate">{data.business_name}</h3>
            {data.selected_domain ? (
              <a
                href={`https://${data.selected_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 truncate"
              >
                <Globe size={10} strokeWidth={1.5} />
                {data.selected_domain}
                <ExternalLink size={9} strokeWidth={1.5} className="shrink-0" />
              </a>
            ) : (
              <p className="text-xs text-neutral-500 truncate">{data.about_us}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isArchived && (
            <div className="px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 border bg-orange-950/30 text-orange-400 border-orange-800">
              <Archive size={10} strokeWidth={1.5} />
              Archivado por usuario
            </div>
          )}
          <div className={cn("px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border", status.color)}>
            <StatusIcon size={12} strokeWidth={1.5} />
            {status.label}
          </div>
          {isOpen
            ? <ChevronUp size={16} strokeWidth={1.5} className="text-neutral-400" />
            : <ChevronDown size={16} strokeWidth={1.5} className="text-neutral-400" />
          }
        </div>
      </button>

      {/* Detalles del proyecto */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6 border-t border-neutral-800 pt-6">
              {/* Botones Editar / Eliminar / Generar PRD */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-4 py-2.5 border border-red-900/50 text-red-400 text-sm font-medium rounded-xl hover:bg-red-950/30 transition-all"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  {userRole === 'admin' ? 'Eliminar permanentemente' : 'Eliminar'}
                </button>
                {prdContent && (
                  <button
                    onClick={() => setShowPrdModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-emerald-900/50 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-950/30 transition-all"
                  >
                    <FileText size={14} strokeWidth={1.5} />
                    Ver PRD
                  </button>
                )}
                <button
                  onClick={async () => {
                    setPrdLoading(true);
                    try {
                      const result = await generatePRD(data);
                      setPrdContent(result);
                      setShowPrdModal(true);
                      if (data.id) {
                        await supabase
                          .from('business_data')
                          .update({ prd_content: result })
                          .eq('id', data.id);
                      }
                    } catch (err) {
                      console.error('Error generating PRD:', err);
                      setPrdContent('Error al generar el PRD. Por favor intenta de nuevo.');
                      setShowPrdModal(true);
                    } finally {
                      setPrdLoading(false);
                    }
                  }}
                  disabled={prdLoading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-indigo-900/50 text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-950/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prdLoading ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <FileText size={14} strokeWidth={1.5} />}
                  {prdLoading ? 'Generando...' : prdContent ? 'Regenerar PRD' : 'Generar PRD'}
                </button>
                {!isArchived && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-all"
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                    Editar Proyecto
                  </button>
                )}
              </div>

              {/* User email (admin view) */}
              {userRole === 'admin' && data.user_email && (
                <div className="text-xs text-neutral-500 font-mono">
                  Usuario: {data.user_email}
                </div>
              )}

              {/* Pipeline cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className={cn("p-3 rounded-xl border-l-2 bg-neutral-800/60", "border-l-white")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-300">Briefing</span>
                    <CheckCircle2 className="text-white" size={13} strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] text-neutral-500">Recibido</p>
                </div>
                <div className={cn("p-3 rounded-xl border-l-2 bg-neutral-800/60", data.status === 'in_progress' || data.status === 'completed' ? "border-l-white" : "border-l-neutral-700")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-300">Producción</span>
                    {data.status === 'in_progress' || data.status === 'completed'
                      ? <Clock className="text-white" size={13} strokeWidth={1.5} />
                      : <Hourglass className="text-neutral-300" size={13} strokeWidth={1.5} />
                    }
                  </div>
                  <p className="text-[10px] text-neutral-500">{data.status === 'in_progress' ? 'En curso' : data.status === 'completed' ? 'Finalizado' : 'Pendiente'}</p>
                </div>
                <div className={cn("p-3 rounded-xl border-l-2 bg-neutral-800/60", data.status === 'completed' ? "border-l-white" : "border-l-neutral-700")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-300">Entrega</span>
                    {data.status === 'completed'
                      ? <CheckCircle2 className="text-white" size={13} strokeWidth={1.5} />
                      : <Hourglass className="text-neutral-300" size={13} strokeWidth={1.5} />
                    }
                  </div>
                  <p className="text-[10px] text-neutral-500">{data.status === 'completed' ? 'Entregado' : 'Pendiente'}</p>
                </div>
              </div>

              {/* Detalles del Negocio + Estrategia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-white text-sm flex items-center gap-2">
                    <Palette size={14} strokeWidth={1.5} /> Detalles del Negocio
                  </h4>
                  <DetailItem label="Sobre" value={data.about_us} />
                  {data.selected_domain && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-1">Dominio</p>
                      <a
                        href={`https://${data.selected_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-indigo-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                      >
                        <Globe size={13} strokeWidth={1.5} />
                        {data.selected_domain}
                        <ExternalLink size={11} strokeWidth={1.5} />
                      </a>
                    </div>
                  )}
                  <DetailItem label="Email" value={data.business_email} />
                  <DetailItem label="Dirección" value={data.business_address} />
                  <DetailItem label="Sector" value={data.industry_sector} />
                  <DetailItem label="Año fundación" value={data.year_founded} />
                  <DetailItem label="Tipo de Logo" value={data.logo_type_pref} />
                  <DetailItem label="Diferencial" value={data.brand_differential} />
                  <DetailItem label="Misión" value={data.brand_mission} />
                  <DetailItem label="Slogan" value={data.brand_slogan} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white text-sm flex items-center gap-2">
                    <Users size={14} strokeWidth={1.5} /> Estrategia
                  </h4>
                  <DetailItem label="Público objetivo" value={data.target_audience} />
                  <DetailItem label="Tipo de público" value={
                    data.audience_type === 'b2c' ? 'Persona física (B2C)' :
                    data.audience_type === 'b2b' ? 'Empresa (B2B)' :
                    data.audience_type === 'both' ? 'Ambos (B2C + B2B)' :
                    data.audience_type || undefined
                  } />
                  {data.competitors && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-1 flex items-center gap-1">
                        <Swords size={10} strokeWidth={1.5} /> Competidores
                      </p>
                      <p className="text-sm text-neutral-300 whitespace-pre-line">{data.competitors}</p>
                    </div>
                  )}
                  {data.competitor_links && data.competitor_links.length > 0 && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2 flex items-center gap-1">
                        <Link2 size={10} strokeWidth={1.5} /> Links competidores
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.competitor_links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-[11px] text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors flex items-center gap-1">
                            {new URL(link).hostname.replace('www.', '')}
                            <ExternalLink size={9} strokeWidth={1.5} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.brand_personality && data.brand_personality.length > 0 && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2">Personalidad</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.brand_personality.map(p => (
                          <span key={p} className="px-2.5 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <DetailItem label="Persona famosa" value={data.brand_celebrity} />
                  {data.brand_values && data.brand_values.length > 0 && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2">Valores de marca</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.brand_values.map(v => (
                          <span key={v} className="px-2.5 py-1 bg-neutral-800/40 text-neutral-300 rounded-full text-[10px] font-medium border border-neutral-700">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <DetailItem label="Tono de voz" value={data.tone_of_voice} />
                  <DetailItem label="Mercado geográfico" value={data.geographic_market} />
                </div>
              </div>

              {/* Referências Visuais (se houver) */}
              {hasBriefingInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white text-sm flex items-center gap-2">
                      <Globe size={14} strokeWidth={1.5} /> Referencias Visuales
                    </h4>
                    <DetailItem label="Marcas que admira" value={data.visual_references} />
                    {data.visual_reference_links && data.visual_reference_links.length > 0 && (
                      <div>
                        <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2 flex items-center gap-1">
                          <Link2 size={10} strokeWidth={1.5} /> Links de referencia
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {data.visual_reference_links.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-[11px] text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors flex items-center gap-1">
                              {new URL(link).hostname.replace('www.', '')}
                              <ExternalLink size={9} strokeWidth={1.5} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.inspiration_links && data.inspiration_links.length > 0 && (
                      <div>
                        <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2 flex items-center gap-1">
                          <Link2 size={10} strokeWidth={1.5} /> Links de inspiración
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {data.inspiration_links.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-[11px] text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors flex items-center gap-1">
                              {new URL(link).hostname.replace('www.', '')}
                              <ExternalLink size={9} strokeWidth={1.5} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <DetailItem label="Colores preferidos" value={data.preferred_colors} />
                    {data.preferred_colors_hex && data.preferred_colors_hex.length > 0 && (
                      <div>
                        <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2">Paleta de colores</p>
                        <div className="flex items-center gap-2">
                          {data.preferred_colors_hex.map((color, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className="w-8 h-8 rounded-lg border border-neutral-700 shadow-sm" style={{ backgroundColor: color }} />
                              <span className="text-[9px] font-mono text-neutral-400">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <DetailItem label="Estilos a evitar" value={data.avoid_styles} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-white text-sm flex items-center gap-2">
                      <Palette size={14} strokeWidth={1.5} /> Proyecto
                    </h4>
                    <DetailItem label="Identidad actual" value={data.current_identity_notes} />
                    <DetailItem label="Plazo" value={data.desired_deadline} />
                    <DetailItem label="Inversión" value={data.budget} />
                    {data.brand_applications && data.brand_applications.length > 0 && (
                      <div>
                        <p className="text-neutral-400 text-[10px] uppercase font-medium tracking-wider mb-2">Aplicaciones</p>
                        <div className="flex flex-wrap gap-1.5">
                          {data.brand_applications.map(a => (
                            <span key={a} className="px-2.5 py-1 bg-neutral-800/40 text-neutral-300 rounded-full text-[10px] font-medium border border-neutral-700">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contacto y Redes */}
              {(hasContactInfo || hasSocialInfo) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hasContactInfo && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-white text-sm flex items-center gap-2">
                        <Phone size={14} strokeWidth={1.5} /> Contacto
                      </h4>
                      <DetailItem label="WhatsApp" value={data.whatsapp} />
                      <DetailItem label="Teléfono fijo" value={data.phone_landline} />
                      <DetailItem label="Móvil" value={data.phone_mobile} />
                      <DetailItem label="Horario" value={data.business_hours} />
                    </div>
                  )}
                  {hasSocialInfo && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-white text-sm flex items-center gap-2">
                        <AtSign size={14} strokeWidth={1.5} /> Redes Sociales
                      </h4>
                      <DetailItem label="Instagram" value={data.social_instagram} />
                      <DetailItem label="Facebook" value={data.social_facebook} />
                      <DetailItem label="TikTok" value={data.social_tiktok} />
                      <DetailItem label="LinkedIn" value={data.social_linkedin} />
                      <DetailItem label="YouTube" value={data.social_youtube} />
                      <DetailItem label="Twitter / X" value={data.social_twitter} />
                      <DetailItem label="Website" value={data.social_website} />
                    </div>
                  )}
                </div>
              )}

              {/* Quiénes somos */}
              {data.who_we_are && (
                <DetailItem label="Quiénes somos" value={data.who_we_are} />
              )}

              {/* Logos */}
              {data.logo_urls && data.logo_urls.length > 0 && (
                <div>
                  <h4 className="font-medium text-white text-sm flex items-center gap-2 mb-3">
                    <Image size={14} strokeWidth={1.5} /> Logos Enviados
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {data.logo_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={url}
                          alt={`Logo ${i + 1}`}
                          className="w-full h-20 object-contain rounded-lg border border-neutral-700 bg-neutral-800/60 p-1.5 hover:shadow-md transition-shadow"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {data.created_at && (
                <p className="text-[10px] text-neutral-400 text-right font-mono">
                  {new Date(data.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRD Modal */}
      <AnimatePresence>
        {showPrdModal && prdContent && (
          <PrdModal prdContent={prdContent} onClose={() => setShowPrdModal(false)} />
        )}
      </AnimatePresence>
    </Card>
  );
};

export const DashboardTab = ({ projects, onNewProject, onEditProject, onDeleteProject, userRole }: DashboardTabProps) => {
  const isAdmin = userRole === 'admin';

  // Group projects by user_email for admin view
  const groupedByUser = isAdmin
    ? projects.reduce<Record<string, OnboardingData[]>>((acc, project) => {
        const key = project.user_email || 'Sin usuario';
        if (!acc[key]) acc[key] = [];
        acc[key].push(project);
        return acc;
      }, {})
    : null;

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {isAdmin ? 'Todos los Proyectos' : 'Mis Proyectos'}
          </h1>
          <p className="text-neutral-500 text-sm">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}{isAdmin ? ' en total' : ` creado${projects.length !== 1 ? 's' : ''}`}</p>
        </div>
        <Button onClick={onNewProject} className="shrink-0">
          <Plus size={18} strokeWidth={1.5} /> Nuevo Proyecto
        </Button>
      </div>

      {/* Lista de proyectos */}
      {isAdmin && groupedByUser ? (
        <div className="space-y-8">
          {Object.entries(groupedByUser).map(([email, userProjects]) => (
            <div key={email} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-neutral-800">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center shrink-0 font-semibold text-xs">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{email}</p>
                  <p className="text-[11px] text-neutral-500">{userProjects.length} proyecto{userProjects.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-4">
                {userProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id || index}
                    data={project}
                    defaultOpen={false}
                    onEdit={() => onEditProject(project)}
                    onDelete={() => onDeleteProject(project.id!)}
                    userRole={userRole}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id || index}
              data={project}
              defaultOpen={false}
              onEdit={() => onEditProject(project)}
              onDelete={() => onDeleteProject(project.id!)}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
