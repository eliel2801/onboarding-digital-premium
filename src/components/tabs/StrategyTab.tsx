import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles, Upload, X, Globe, Users, Palette, Eye, Swords, Layout, FolderCog, CircleDot } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { brandPersonalities, brandApplications, brandValues, toneOfVoice } from '../../data/constants';
import { Card, Button, Textarea, LinkCollector, ColorPicker } from '../ui';

interface StrategyTabProps {
  hasIdentity: boolean | null;
  setHasIdentity: (v: boolean | null) => void;
  businessName: string;
  aboutUs: string;
  targetAudience: string;
  setTargetAudience: (v: string) => void;
  competitors: string;
  setCompetitors: (v: string) => void;
  brandPersonality: string[];
  setBrandPersonality: React.Dispatch<React.SetStateAction<string[]>>;
  identityFiles: File[];
  setIdentityFiles: React.Dispatch<React.SetStateAction<File[]>>;
  identityDescription: string;
  setIdentityDescription: (v: string) => void;
  identityFont: string;
  setIdentityFont: (v: string) => void;
  identityColor1: string;
  setIdentityColor1: (v: string) => void;
  identityColor2: string;
  setIdentityColor2: (v: string) => void;
  // Briefing fields
  brandDifferential: string;
  setBrandDifferential: (v: string) => void;
  brandMission: string;
  setBrandMission: (v: string) => void;
  brandSlogan: string;
  setBrandSlogan: (v: string) => void;
  audienceType: string;
  setAudienceType: (v: string) => void;
  brandCelebrity: string;
  setBrandCelebrity: (v: string) => void;
  visualReferences: string;
  setVisualReferences: (v: string) => void;
  preferredColors: string;
  setPreferredColors: (v: string) => void;
  avoidStyles: string;
  setAvoidStyles: (v: string) => void;
  brandApplicationsList: string[];
  setBrandApplicationsList: React.Dispatch<React.SetStateAction<string[]>>;
  currentIdentityNotes: string;
  setCurrentIdentityNotes: (v: string) => void;
  desiredDeadline: string;
  setDesiredDeadline: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  // Enhanced strategy
  brandValuesSelected: string[];
  setBrandValuesSelected: React.Dispatch<React.SetStateAction<string[]>>;
  toneOfVoiceSelected: string;
  setToneOfVoiceSelected: (v: string) => void;
  geographicMarket: string;
  setGeographicMarket: (v: string) => void;
  // Link collectors
  visualReferenceLinks: string[];
  setVisualReferenceLinks: (v: string[]) => void;
  competitorLinks: string[];
  setCompetitorLinks: (v: string[]) => void;
  inspirationLinks: string[];
  setInspirationLinks: (v: string[]) => void;
  // Color picker
  preferredColorsHex: string[];
  setPreferredColorsHex: (v: string[]) => void;
  isEditing?: boolean;
  onNext: () => void;
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

// ─── Field Label ───
const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-[13px] font-medium text-neutral-400 tracking-wide">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

// ─── Text Input ───
const TextInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
  />
);

// ─── Textarea Input ───
const TextareaInput = ({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 resize-none transition-all"
  />
);

export const StrategyTab = ({
  hasIdentity,
  setHasIdentity,
  businessName,
  aboutUs,
  targetAudience,
  setTargetAudience,
  competitors,
  setCompetitors,
  brandPersonality,
  setBrandPersonality,
  identityFiles,
  setIdentityFiles,
  identityDescription,
  setIdentityDescription,
  identityFont,
  setIdentityFont,
  identityColor1,
  setIdentityColor1,
  identityColor2,
  setIdentityColor2,
  brandDifferential,
  setBrandDifferential,
  brandMission,
  setBrandMission,
  brandSlogan,
  setBrandSlogan,
  audienceType,
  setAudienceType,
  brandCelebrity,
  setBrandCelebrity,
  visualReferences,
  setVisualReferences,
  preferredColors,
  setPreferredColors,
  avoidStyles,
  setAvoidStyles,
  brandApplicationsList,
  setBrandApplicationsList,
  currentIdentityNotes,
  setCurrentIdentityNotes,
  desiredDeadline,
  setDesiredDeadline,
  budget,
  setBudget,
  brandValuesSelected,
  setBrandValuesSelected,
  toneOfVoiceSelected,
  setToneOfVoiceSelected,
  geographicMarket,
  setGeographicMarket,
  visualReferenceLinks,
  setVisualReferenceLinks,
  competitorLinks,
  setCompetitorLinks,
  inspirationLinks,
  setInspirationLinks,
  preferredColorsHex,
  setPreferredColorsHex,
  isEditing,
  onNext,
  onBack,
}: StrategyTabProps) => {
  // No bloquear navegación — los campos obligatorios se marcan con asterisco rojo

  const toggleBrandValue = (v: string) => {
    setBrandValuesSelected(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 5 ? [...prev, v] : prev
    );
  };

  const togglePersonality = (p: string) => {
    setBrandPersonality(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const toggleApplication = (app: string) => {
    setBrandApplicationsList(prev =>
      prev.includes(app) ? prev.filter(x => x !== app) : [...prev, app]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIdentityFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setIdentityFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Pantalla inicial: elección (pular se estiver editando) ───
  if (hasIdentity === null && !isEditing) {
    return (
      <motion.div
        key="strategy-choice"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-3xl mx-auto space-y-10"
      >
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Estrategia de Marca</h1>
          <p className="text-neutral-500 text-sm">Define el posicionamiento y la personalidad de tu marca.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => setHasIdentity(true)}
            className="group p-8 bg-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-white hover:shadow-lg hover:shadow-black/20 transition-all duration-300 space-y-5"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-800 text-white flex items-center justify-center group-hover:bg-white group-hover:text-neutral-900 transition-all duration-300">
              <Check size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ya tengo identidad visual</h3>
              <p className="text-sm text-neutral-500 mt-1">Tengo logo, colores y tipografía definidos. Voy a enviar mis archivos.</p>
            </div>
          </button>

          <button
            onClick={() => setHasIdentity(false)}
            className="group p-8 bg-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-white hover:shadow-lg hover:shadow-black/20 transition-all duration-300 space-y-5"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-800 text-white flex items-center justify-center group-hover:bg-white group-hover:text-neutral-900 transition-all duration-300">
              <Sparkles size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Aún no tengo, quiero crearla</h3>
              <p className="text-sm text-neutral-500 mt-1">Necesito crear mi identidad visual desde cero con la ayuda de nuestro equipo.</p>
            </div>
          </button>
        </div>

        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft size={18} strokeWidth={1.5} /> Volver
          </Button>
        </div>
      </motion.div>
    );
  }

  // ─── Camino 1: Ya tiene identidad visual → upload de archivos + datos ───
  if (hasIdentity === true) {
    return (
      <motion.div
        key="strategy-identity"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Tu Identidad Visual</h1>
          <p className="text-neutral-500 text-sm">Sube los archivos de tu identidad visual e indica los detalles clave.</p>
        </div>

        <Card className="p-6 sm:p-8 space-y-8">
          {/* Upload area */}
          <div className="space-y-4">
            <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">
              Archivos de identidad visual *
            </label>
            <p className="text-xs text-neutral-400 -mt-2">
              Sube tu logo, manual de marca, paleta de colores, tipografías y cualquier archivo relevante.
            </p>
            <div className="relative border border-dashed border-neutral-700 rounded-2xl p-10 hover:border-white transition-all duration-300 bg-neutral-800/60 text-center group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*,.svg,.pdf,.ai,.eps,.psd"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto mb-3 text-neutral-300 group-hover:text-white transition-colors" size={28} strokeWidth={1.5} />
              <p className="text-sm text-neutral-500 font-medium">Haz clic para subir tus archivos</p>
              <p className="text-xs text-neutral-400 mt-1">PDF, PNG, JPG, SVG, AI, EPS, PSD</p>
            </div>

            {identityFiles.length > 0 && (
              <div className="space-y-2">
                {identityFiles.map((file, i) => (
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
          </div>

          {/* Descripción */}
          <Textarea
            label="Descripción de la identidad"
            placeholder="Cuéntanos sobre tu identidad visual: qué representa, cuándo fue creada, cualquier detalle importante..."
            value={identityDescription}
            onChange={(e: any) => setIdentityDescription(e.target.value)}
          />

          {/* Fuente */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">
              Fuente / Tipografía principal
            </label>
            <input
              type="text"
              value={identityFont}
              onChange={(e) => setIdentityFont(e.target.value)}
              placeholder="Ej: Montserrat, Helvetica Neue, Poppins..."
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
            />
          </div>

          {/* Colores */}
          <div className="space-y-3">
            <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">
              Colores de la identidad
            </label>
            <p className="text-xs text-neutral-400 -mt-1">Indica los colores principales de tu marca.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border border-neutral-700 rounded-xl bg-neutral-800/60">
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-sm cursor-pointer"
                    style={{ backgroundColor: identityColor1 }}
                  />
                  <input
                    type="color"
                    value={identityColor1}
                    onChange={(e) => setIdentityColor1(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 font-medium">Color primario</p>
                  <input
                    type="text"
                    value={identityColor1}
                    onChange={(e) => setIdentityColor1(e.target.value)}
                    className="w-full text-sm font-mono text-neutral-300 bg-transparent border-none p-0 focus:outline-none uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-neutral-700 rounded-xl bg-neutral-800/60">
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-sm cursor-pointer"
                    style={{ backgroundColor: identityColor2 }}
                  />
                  <input
                    type="color"
                    value={identityColor2}
                    onChange={(e) => setIdentityColor2(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 font-medium">Color secundario</p>
                  <input
                    type="text"
                    value={identityColor2}
                    onChange={(e) => setIdentityColor2(e.target.value)}
                    className="w-full text-sm font-mono text-neutral-300 bg-transparent border-none p-0 focus:outline-none uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={isEditing ? onBack : () => setHasIdentity(null)}>
              <ChevronLeft size={18} strokeWidth={1.5} /> Volver
            </Button>
            <Button onClick={onNext} className="px-8 py-3" disabled={false}>
              Siguiente <ChevronRight size={18} strokeWidth={1.5} />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ─── Camino 2: No tiene identidad → BRIEFING COMPLETO ───
  return (
    <motion.div
      key="strategy-briefing"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Briefing de Identidad Visual</h1>
        <p className="text-neutral-500 text-sm">
          Completa este briefing para que nuestro equipo cree tu identidad visual desde cero.
        </p>
      </div>

      {/* Banner info */}
      <div className="flex items-center gap-3 px-5 py-4 bg-neutral-950 text-white rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
          <Sparkles size={18} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold">Crear identidad visual profesional</p>
          <p className="text-xs text-neutral-400">Cuanta más información nos des, mejor será el resultado.</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ═══════ SECCIÓN 1: SOBRE LA EMPRESA ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={Globe} title="Sobre la Empresa" subtitle="Información básica de tu marca" />

          {/* Nombre (readonly, viene del paso anterior) */}
          <div className="space-y-2">
            <FieldLabel>Nombre de la marca</FieldLabel>
            <div className="px-4 py-3 bg-neutral-800/40 border border-neutral-700 rounded-xl text-sm font-medium text-white">
              {businessName || <span className="text-neutral-400 font-normal">Definido en el paso anterior</span>}
            </div>
          </div>

          {/* Qué hace (readonly) */}
          <div className="space-y-2">
            <FieldLabel>¿Qué hace / vende?</FieldLabel>
            <div className="px-4 py-3 bg-neutral-800/40 border border-neutral-700 rounded-xl text-sm text-neutral-300 whitespace-pre-line">
              {aboutUs || <span className="text-neutral-400">Definido en el paso anterior</span>}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel required>Diferencial respecto a la competencia</FieldLabel>
            <TextareaInput
              value={brandDifferential}
              onChange={setBrandDifferential}
              placeholder="¿Qué te hace diferente de tus competidores? ¿Cuál es tu ventaja principal?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel required>Misión o propósito de la marca (en una frase)</FieldLabel>
            <TextInput
              value={brandMission}
              onChange={setBrandMission}
              placeholder="Ej: Democratizar el acceso a servicios de diseño de calidad"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>¿Tienes slogan? ¿Cuál?</FieldLabel>
            <TextInput
              value={brandSlogan}
              onChange={setBrandSlogan}
              placeholder="Ej: Diseño que transforma negocios"
            />
          </div>
        </Card>

        {/* ═══════ SECCIÓN 2: PÚBLICO OBJETIVO ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={Users} title="Público Objetivo" subtitle="¿A quién te diriges?" />

          <div className="space-y-2">
            <FieldLabel required>¿Quién es tu cliente ideal?</FieldLabel>
            <p className="text-xs text-neutral-400">Describe edad, perfil, estilo de vida, intereses...</p>
            <TextareaInput
              value={targetAudience}
              onChange={setTargetAudience}
              placeholder="Ej: Emprendedores de 25-45 años, clase media-alta, urbanos, interesados en tecnología y diseño..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Mercado geográfico principal</FieldLabel>
            <TextInput
              value={geographicMarket}
              onChange={setGeographicMarket}
              placeholder="Ej: España, Europa, Latinoamérica, Global..."
            />
          </div>

          <div className="space-y-3">
            <FieldLabel>¿Tu público es persona física o empresa?</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'b2c', label: 'Persona física (B2C)' },
                { id: 'b2b', label: 'Empresa (B2B)' },
                { id: 'both', label: 'Ambos' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAudienceType(opt.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
                    audienceType === opt.id
                      ? "border-white bg-white text-neutral-900"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 bg-neutral-800"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ═══════ SECCIÓN 3: PERSONALIDAD DE LA MARCA ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={Sparkles} title="Personalidad de la Marca" subtitle="¿Cómo quieres que se perciba?" />

          <div className="space-y-3">
            <FieldLabel>Elige 3 a 5 adjetivos que definen tu marca</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {brandPersonalities.map(p => (
                <button
                  key={p}
                  onClick={() => togglePersonality(p)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                    brandPersonality.includes(p)
                      ? "border-white bg-white text-neutral-900"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            {brandPersonality.length > 0 && (
              <p className="text-xs text-neutral-500">{brandPersonality.length} seleccionado{brandPersonality.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="space-y-3">
            <FieldLabel>Valores de marca (elige 3-5)</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {brandValues.map(v => (
                <button
                  key={v}
                  onClick={() => toggleBrandValue(v)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                    brandValuesSelected.includes(v)
                      ? "border-white bg-white text-neutral-900"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            {brandValuesSelected.length > 0 && (
              <p className="text-xs text-neutral-500">{brandValuesSelected.length}/5 seleccionado{brandValuesSelected.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="space-y-3">
            <FieldLabel>Tono de voz de la marca</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {toneOfVoice.map(t => (
                <button
                  key={t}
                  onClick={() => setToneOfVoiceSelected(toneOfVoiceSelected === t ? '' : t)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
                    toneOfVoiceSelected === t
                      ? "border-white bg-white text-neutral-900"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 bg-neutral-800"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Si tu marca fuera una persona famosa, ¿quién sería y por qué?</FieldLabel>
            <TextareaInput
              value={brandCelebrity}
              onChange={setBrandCelebrity}
              placeholder="Ej: Sería como Apple por Steve Jobs — minimalista, innovadora y aspiracional..."
              rows={2}
            />
          </div>
        </Card>

        {/* ═══════ SECCIÓN 4: REFERENCIAS VISUALES ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={Eye} title="Referencias Visuales" subtitle="Marcas e inspiraciones que admiras" />

          <div className="space-y-2">
            <FieldLabel>Cita 2-3 marcas que admiras visualmente y di qué te gusta de ellas</FieldLabel>
            <TextareaInput
              value={visualReferences}
              onChange={setVisualReferences}
              placeholder="Ej: Me gusta Apple por su minimalismo, Spotify por sus colores vibrantes, Nike por la fuerza de su símbolo..."
              rows={3}
            />
          </div>

          <LinkCollector
            label="Links de referencias visuales"
            links={visualReferenceLinks}
            onChange={setVisualReferenceLinks}
            placeholder="Pega links de marcas o diseños que te inspiran..."
          />

          <LinkCollector
            label="Links de inspiración / moodboard"
            links={inspirationLinks}
            onChange={setInspirationLinks}
            placeholder="Pega links de Pinterest, Dribbble, Behance..."
          />

          <div className="space-y-2">
            <FieldLabel>¿Tienes algún color que represente tu marca o que ya uses?</FieldLabel>
            <TextInput
              value={preferredColors}
              onChange={setPreferredColors}
              placeholder="Ej: Azul oscuro y dorado, o #1A2B3C y #FFD700"
            />
          </div>

          <ColorPicker
            label="Selecciona tus colores preferidos"
            colors={preferredColorsHex}
            onChange={setPreferredColorsHex}
            maxColors={5}
          />

          <div className="space-y-2">
            <FieldLabel>¿Hay colores, estilos o marcas a las que NO quieres parecerte?</FieldLabel>
            <TextareaInput
              value={avoidStyles}
              onChange={setAvoidStyles}
              placeholder="Ej: No quiero parecer infantil ni usar colores neón. No quiero parecerme a la marca X..."
              rows={2}
            />
          </div>
        </Card>

        {/* ═══════ SECCIÓN 5: COMPETIDORES ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={Swords} title="Competidores" subtitle="¿Contra quién compites?" />

          <div className="space-y-2">
            <FieldLabel>Lista 3 competidores directos</FieldLabel>
            <TextareaInput
              value={competitors}
              onChange={setCompetitors}
              placeholder={"1. Competidor A — www.competidora.com\n2. Competidor B — www.competidorb.com\n3. Competidor C — www.competidorc.com"}
              rows={4}
            />
          </div>

          <LinkCollector
            label="Links de competidores"
            links={competitorLinks}
            onChange={setCompetitorLinks}
            placeholder="Pega los links de las webs de tus competidores..."
          />
        </Card>

        {/* ═══════ SECCIÓN 6: APLICACIONES ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={Layout} title="Aplicaciones" subtitle="¿Dónde se usará la identidad?" />

          <div className="space-y-3">
            <FieldLabel>Selecciona dónde se aplicará tu identidad visual</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {brandApplications.map(app => (
                <button
                  key={app}
                  onClick={() => toggleApplication(app)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 text-left",
                    brandApplicationsList.includes(app)
                      ? "border-white bg-white text-neutral-900"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 bg-neutral-800"
                  )}
                >
                  {brandApplicationsList.includes(app) && <Check size={13} strokeWidth={2} className="inline mr-1.5" />}
                  {app}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ═══════ SECCIÓN 7: PROYECTO ═══════ */}
        <Card className="p-6 sm:p-8 space-y-6">
          <SectionHeader icon={FolderCog} title="Proyecto" subtitle="Detalles del proyecto de identidad" />

          <div className="space-y-2">
            <FieldLabel>¿Ya tienes identidad visual actual? ¿Qué quieres mantener o cambiar?</FieldLabel>
            <TextareaInput
              value={currentIdentityNotes}
              onChange={setCurrentIdentityNotes}
              placeholder="Ej: Tengo un logo casero que hice en Canva, quiero algo profesional. Quiero mantener el azul..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel>Plazo deseado</FieldLabel>
              <TextInput
                value={desiredDeadline}
                onChange={setDesiredDeadline}
                placeholder="Ej: 2 semanas, 1 mes, sin prisa..."
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>Inversión prevista</FieldLabel>
              <TextInput
                value={budget}
                onChange={setBudget}
                placeholder="Ej: 500€, 1000-2000€, flexible..."
              />
            </div>
          </div>
        </Card>

        {/* ═══════ NAVEGACIÓN ═══════ */}
        <div className="flex justify-between pt-2 pb-4">
          <Button variant="outline" onClick={isEditing ? onBack : () => setHasIdentity(null)}>
            <ChevronLeft size={18} strokeWidth={1.5} /> Volver
          </Button>
          <Button onClick={onNext} className="px-8 py-3" disabled={false}>
            Siguiente <ChevronRight size={18} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
