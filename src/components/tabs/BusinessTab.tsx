import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, ChevronRight, Loader2, Bot, User, CheckCircle2, PenLine, Wand2, Globe, Circle, XCircle, Search, MapPin, Building2, Star, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { industrySectors } from '../../data/constants';
import { checkDomainAvailability, nameToSlug, type DomainResult } from '../../lib/domainCheck';
import { searchBusinesses, type BusinessResult } from '../../lib/businessSearch';
import { validateNameCandidates, type ValidatedName } from '../../lib/nameValidator';
import { Card, Button, Textarea, useToast } from '../ui';

// ─── Domain Result Row ───
const DomainRow = ({
  r,
  selected,
  onSelect,
}: {
  r: DomainResult;
  selected?: boolean;
  onSelect?: (domain: string) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(r.domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={() => onSelect?.(r.domain)}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all group",
        onSelect && "cursor-pointer",
        selected
          ? "bg-neutral-950 border-neutral-950 ring-2 ring-neutral-700 ring-offset-1"
          : r.available === true
            ? "bg-neutral-950 border-neutral-950"
            : r.available === false
              ? "bg-neutral-800 border-neutral-700"
              : "bg-neutral-800/60 border-neutral-150",
        onSelect && !selected && r.available === true && "hover:ring-2 hover:ring-neutral-600 hover:ring-offset-1",
        onSelect && !selected && r.available === false && "hover:border-neutral-500",
        onSelect && !selected && r.available === null && "hover:border-neutral-700",
      )}
    >
      {selected && <CheckCircle2 size={14} strokeWidth={1.5} className="text-white shrink-0" />}
      {!selected && r.available === true && <CheckCircle2 size={14} strokeWidth={1.5} className="text-white shrink-0" />}
      {!selected && r.available === false && <XCircle size={14} strokeWidth={1.5} className="text-neutral-300 shrink-0" />}
      {!selected && r.available === null && <Loader2 size={14} strokeWidth={1.5} className="text-neutral-300 animate-spin shrink-0" />}

      <span className={cn(
        "font-mono text-[13px] font-medium flex-1 break-all",
        selected ? "text-white" : r.available === true ? "text-white" : "text-neutral-400"
      )}>
        {r.domain}
      </span>

      <button
        onClick={handleCopy}
        className={cn(
          "p-1 rounded transition-all shrink-0",
          selected || r.available === true
            ? "text-white/50 hover:text-white hover:bg-white/10"
            : "text-neutral-300 hover:text-neutral-400 hover:bg-neutral-800",
          "opacity-0 group-hover:opacity-100",
          copied && "!opacity-100"
        )}
        title="Copiar dominio"
      >
        {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
      </button>

      <span className={cn(
        "text-[10px] font-semibold uppercase tracking-wider shrink-0",
        selected ? "text-white/70" : r.available === true ? "text-white/70" : r.available === false ? "text-neutral-300" : "text-neutral-300"
      )}>
        {selected ? 'Elegido' : r.available === true ? 'Libre' : r.available === false ? 'Ocupado' : '...'}
      </span>
    </div>
  );
};

// ─── Domain Results Display ───
const DomainResults = ({ results, checking, selectedDomain, onDomainSelect }: { results: DomainResult[]; checking: boolean; selectedDomain?: string; onDomainSelect?: (domain: string) => void }) => {
  const available = results.filter(r => r.available === true);
  const taken = results.filter(r => r.available === false);
  const unknown = results.filter(r => r.available === null);

  const handleSelect = (domain: string) => {
    if (onDomainSelect) {
      onDomainSelect(selectedDomain === domain ? '' : domain);
    }
  };

  return (
    <>
      {results.length > 0 && (
        <div className="space-y-3">
          {selectedDomain && (
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/40 rounded-lg">
              <CheckCircle2 size={14} strokeWidth={1.5} className="text-white shrink-0" />
              <span className="font-mono text-sm font-semibold text-white flex-1">{selectedDomain}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedDomain);
                }}
                className="px-2.5 py-1 text-xs font-medium bg-neutral-950 text-white rounded-md hover:bg-neutral-800 transition-all flex items-center gap-1.5"
              >
                <Copy size={11} strokeWidth={1.5} /> Copiar
              </button>
            </div>
          )}
          {available.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-white uppercase tracking-widest px-1">
                {available.length} disponible{available.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {available.map(r => (
                  <DomainRow key={r.domain} r={r} selected={selectedDomain === r.domain} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          )}
          {taken.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest px-1">
                {taken.length} ocupado{taken.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {taken.map(r => (
                  <DomainRow key={r.domain} r={r} selected={selectedDomain === r.domain} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          )}
          {unknown.length > 0 && (
            <div className="grid grid-cols-1 gap-1.5">
              {unknown.map(r => (
                <DomainRow key={r.domain} r={r} selected={selectedDomain === r.domain} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      )}
      {checking && results.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 size={14} className="animate-spin text-neutral-400" />
          <span className="text-xs text-neutral-500">Verificando dominios...</span>
        </div>
      )}
    </>
  );
};

// ─── Domain Checker (auto-check from businessName) ───
const DomainChecker = ({ businessName, selectedDomain, onDomainSelect }: { businessName: string; selectedDomain: string; onDomainSelect: (v: string) => void }) => {
  const [results, setResults] = useState<DomainResult[]>([]);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doCheck = useCallback(async (name: string) => {
    const slug = nameToSlug(name);
    if (slug.length < 2) { setResults([]); return; }
    setChecking(true);
    try {
      const res = await checkDomainAvailability(name);
      setResults(res);
    } catch { setResults([]); }
    finally { setChecking(false); }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = businessName.trim();
    if (trimmed.length < 2) { setResults([]); return; }
    timerRef.current = setTimeout(() => doCheck(trimmed), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [businessName, doCheck]);

  const slug = nameToSlug(businessName);
  if (slug.length < 2 && !checking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="overflow-hidden"
    >
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Globe size={14} strokeWidth={1.5} className="text-neutral-300" />
          <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Dominios</span>
          {checking && <Loader2 size={12} className="animate-spin text-neutral-400 ml-auto" />}
        </div>
        <DomainResults results={results} checking={checking} selectedDomain={selectedDomain} onDomainSelect={onDomainSelect} />
      </div>
    </motion.div>
  );
};

// ─── Business Name Checker (Google Places) ───
const NegocioChecker = ({ businessName }: { businessName: string }) => {
  const [location, setLocation] = useState('España');
  const [localResults, setLocalResults] = useState<BusinessResult[]>([]);
  const [globalResults, setGlobalResults] = useState<BusinessResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchKey = useRef('');

  const doSearch = useCallback(async (name: string, loc: string) => {
    if (name.trim().length < 2) { setLocalResults([]); setGlobalResults([]); return; }
    const key = `${name}|${loc}`;
    if (key === lastSearchKey.current) return;
    setSearching(true);
    try {
      const [local, global] = await Promise.all([
        searchBusinesses(name, loc),
        searchBusinesses(name, ''),
      ]);
      setLocalResults(local);
      // Filter global to remove duplicates that are already in local
      const localNames = new Set(local.map(b => b.name.toLowerCase()));
      setGlobalResults(global.filter(b => !localNames.has(b.name.toLowerCase())));
      setSearched(true);
      lastSearchKey.current = key;
    } catch { setLocalResults([]); setGlobalResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const name = businessName.trim();
    if (name.length < 2) { setLocalResults([]); setGlobalResults([]); setSearched(false); return; }
    timerRef.current = setTimeout(() => doSearch(name, location), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [businessName, location, doSearch]);

  const slug = nameToSlug(businessName);
  if (slug.length < 2 && !searching) return null;

  const totalResults = localResults.length + globalResults.length;

  const ResultCard = ({ b }: { b: BusinessResult }) => (
    <div className="p-3 bg-neutral-800/60 border border-neutral-700 rounded-lg space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white leading-tight">{b.name}</p>
        {b.rating && (
          <div className="flex items-center gap-1 shrink-0">
            <Star size={11} strokeWidth={1.5} className="text-white fill-neutral-900" />
            <span className="text-[11px] font-medium text-neutral-300">{b.rating}</span>
          </div>
        )}
      </div>
      {b.address && (
        <p className="text-[11px] text-neutral-500 leading-snug flex items-start gap-1">
          <MapPin size={10} strokeWidth={1.5} className="shrink-0 mt-0.5" />
          {b.address}
        </p>
      )}
    </div>
  );

  return (
    <Card className="p-5 space-y-4 border-neutral-700">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center shrink-0">
          <Search size={15} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">Negocios con nombre similar</h3>
          <p className="text-[11px] text-neutral-500">Busca local + marcas globales</p>
        </div>
        {searching && <Loader2 size={14} className="animate-spin text-neutral-400 shrink-0" />}
      </div>

      <div className="relative">
        <MapPin size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="País o ciudad..."
          className="w-full pl-9 pr-3 py-2.5 bg-neutral-800/60 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
        />
      </div>

      {localResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-white uppercase tracking-widest px-1 flex items-center gap-1.5">
            <MapPin size={10} strokeWidth={2} />
            {localResults.length} en {location}
          </p>
          {localResults.map((b, i) => <ResultCard key={`local-${i}`} b={b} />)}
        </div>
      )}

      {globalResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-white uppercase tracking-widest px-1 flex items-center gap-1.5">
            <Globe size={10} strokeWidth={2} />
            {globalResults.length} en el mundo
          </p>
          {globalResults.map((b, i) => <ResultCard key={`global-${i}`} b={b} />)}
        </div>
      )}

      {searched && totalResults === 0 && !searching && (
        <div className="text-center py-3">
          <CheckCircle2 size={20} strokeWidth={1.5} className="text-white mx-auto mb-1.5" />
          <p className="text-xs font-medium text-neutral-300">No se encontraron negocios con ese nombre</p>
          <p className="text-[11px] text-neutral-400">Ni en {location} ni a nivel global</p>
        </div>
      )}

      {searching && totalResults === 0 && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 size={14} className="animate-spin text-neutral-400" />
          <span className="text-xs text-neutral-500">Buscando "{businessName}"...</span>
        </div>
      )}
    </Card>
  );
};

// ─── Chat types & helpers ───
interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  suggestions?: string[];
  options?: string[];
}

interface BusinessTabProps {
  businessName: string;
  setBusinessName: (v: string) => void;
  aboutUs: string;
  setAboutUs: (v: string) => void;
  businessEmail: string;
  setBusinessEmail: (v: string) => void;
  businessAddress: string;
  setBusinessAddress: (v: string) => void;
  industrySector: string;
  setIndustrySector: (v: string) => void;
  yearFounded: string;
  setYearFounded: (v: string) => void;
  selectedDomain: string;
  setSelectedDomain: (v: string) => void;
  isEditing?: boolean;
  onNext: () => void;
}

let msgId = 0;

const SYSTEM_PROMPT = `Eres Brand Strategist, un consultor de naming creativo y cercano. Hablas como un profesional apasionado por las marcas, no como un robot.

## TU PERSONALIDAD
- Conversacional, cálido pero profesional. Como un amigo experto en branding.
- SIEMPRE lee y responde a lo que el cliente REALMENTE dice. Si pide algo específico, atiéndelo.
- Comenta brevemente lo que te dijo antes de preguntar (ej: "Un estudio audiovisual en Alicante, ¡buen sector! ¿A quién os dirigís?")
- Respuestas cortas: 2-3 frases naturales. Nada de listas formales ni lenguaje corporativo.

## CÓMO CONVERSAR
- Lee el mensaje del cliente con atención. Responde a SU petición, no sigas un guión ciego.
- Si dice "quiero un nombre más corto" → trabaja en eso, no preguntes el tipo de negocio.
- Si dice "no me gustan" → pregunta qué estilo prefiere y genera otros diferentes.
- Si describe su negocio completo → salta directo a proponer nombres.
- Si solo dice una palabra → pide más contexto de forma natural.
- Adapta tu respuesta al idioma del cliente (si escribe en portugués, responde en español pero entiende lo que dice).

## FLUJO NATURAL (flexible, NO rígido)
Lo ideal es conocer 3 cosas antes de proponer nombres:
1. Qué hace el negocio (sector/actividad)
2. A quién se dirige (público)
3. Qué personalidad quiere la marca (estilo)

Pero si el cliente ya dio info suficiente o pide nombres directamente, ¡sáltate preguntas y proponlos!

## FORMATO TÉCNICO
Cuando hagas preguntas con opciones, incluye al final:
OPCIONES: opción real 1, opción real 2, opción real 3, opción real 4
(Siempre opciones relevantes al contexto, NUNCA "Opción1" genérico)

Cuando propongas nombres, incluye:
SUGERENCIAS: Nombre1, Nombre2, Nombre3, Nombre4, Nombre5, Nombre6, Nombre7, Nombre8, Nombre9, Nombre10

## CÓMO CREAR NOMBRES

### Si el cliente YA TIENE un nombre o idea:
- ÚSALO como punto de partida. Ejemplo: "Goldenhive Investments → quiero más corto" → genera: Goldhive, Hivex, Golven, Aurohive, Hivon, etc.
- Crea variaciones: acortar, fusionar sílabas, mantener la esencia
- Mezcla partes del nombre original con sonidos nuevos
- Mantén el espíritu/significado que el cliente quiere

### Si el cliente NO tiene nombre (desde cero):
- 10 nombres INVENTADOS — neologismos, fusiones de sílabas, palabras nuevas (5-8 letras)
- BUENOS: Zurvok, Kreluna, Vostark, Belvox, Tralume (suenan bien, no existen)
- MALOS: Luxmedia, Soundwave, AudioLab (palabras reales combinadas, ya existen como .com)
- Evita palabras completas reales (sound, wave, media, studio, pixel, etc.)

### Siempre:
- Adapta la sonoridad al sector del negocio
- NO expliques cada nombre — el sistema verifica dominio y Google automáticamente
- Si el cliente pide cambios, adapta el estilo exactamente como pide

## REGLAS
- NUNCA repitas algo ya respondido
- Máximo 3 preguntas antes de nombres, pero puedes hacer menos si ya tienes info
- Cada mensaje debe tener OPCIONES: o SUGERENCIAS: (o ambas cuando propones nombres)`;

type NameChoice = null | 'has_name' | 'needs_name';

export const BusinessTab = ({
  businessName,
  setBusinessName,
  aboutUs,
  setAboutUs,
  businessEmail,
  setBusinessEmail,
  businessAddress,
  setBusinessAddress,
  industrySector,
  setIndustrySector,
  yearFounded,
  setYearFounded,
  selectedDomain,
  setSelectedDomain,
  isEditing,
  onNext,
}: BusinessTabProps) => {
  const { toast } = useToast();
  // Se está editando e já tem nome, pular direto para o formulário "has_name"
  const [nameChoice, setNameChoice] = useState<NameChoice>(isEditing && businessName.trim().length > 0 ? 'has_name' : null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedNames, setValidatedNames] = useState<ValidatedName[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isValid = businessName.trim().length >= 3 && aboutUs.trim().length >= 3;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, validatedNames, isValidating]);

  const sendOptionMessage = (option: string) => {
    if (isGenerating || isValidating) return;
    setValidatedNames([]);
    sendMessageWithText(option);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || isGenerating || isValidating) return;
    setValidatedNames([]);
    sendMessageWithText(text);
  };

  const sendMessageWithText = async (text: string) => {
    if (!text || isGenerating) return;

    const userMsg: ChatMessage = { id: ++msgId, role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsGenerating(true);

    if (!aboutUs.trim()) {
      setAboutUs(text);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const conversationHistory = updatedMessages
        .map(m => `${m.role === 'user' ? 'Cliente' : 'Brand Strategist'}: ${m.content}`)
        .join('\n\n');

      const userMsgCount = updatedMessages.filter(m => m.role === 'user').length;

      const lastUserMsg = updatedMessages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';

      // Detect if user mentions an existing name or has a direction
      const mentionsName = /(?:se llama|nombre es|llamo|quiero|tengo|empresa es|marca es|llamarse|nombre como|como se llama|nome|chama)/i.test(lastUserMsg);
      const wantsChange = /(?:más corto|mais curto|más largo|más creativo|más simple|otra|diferente|no me gusta|cambia|variación|variacion|parecido|similar|basado en|a partir de|inspirado)/i.test(lastUserMsg);
      const hasEnoughInfo = userMsgCount >= 3 || (mentionsName && userMsgCount >= 1);

      let instruction = '';
      if (wantsChange || mentionsName) {
        instruction = `PRIORIDAD MÁXIMA: El cliente dice: "${lastUserMsg}"
${mentionsName ? 'El cliente MENCIONA UN NOMBRE o tiene una idea. ÚSALA como punto de partida. Genera variaciones, versiones cortas, o nombres inspirados en esa idea.' : ''}
${wantsChange ? 'El cliente PIDE UN CAMBIO específico. Genera 10 nombres que cumplan exactamente lo que pide.' : ''}
DEBES proponer 10 nombres con SUGERENCIAS: que se BASEN en lo que el cliente dice. Si dice "quiero más corto" y mencionó "Goldenhive Investments", genera nombres cortos inspirados en gold/hive/invest. Si dice "quiero algo parecido a X", genera variaciones de X.
Puedes hacer UNA pregunta rápida solo si realmente no entiendes qué quiere. Pero lo normal es proponer nombres directamente.`;
      } else if (hasEnoughInfo) {
        instruction = `CONTEXTO: Llevas ${userMsgCount} mensajes. Último: "${lastUserMsg}". Ya tienes suficiente info. PROPÓN 10 NOMBRES con SUGERENCIAS:. Responde a lo que el cliente pide.`;
      } else {
        instruction = `CONTEXTO: Mensaje ${userMsgCount}. El cliente dice: "${lastUserMsg}". Responde de forma natural a lo que dice. Si necesitas saber más, haz UNA pregunta con OPCIONES. Si ya entiendes el negocio, propón nombres.`;
      }

      const prompt = `${SYSTEM_PROMPT}

## ESTADO
- Respuestas del cliente: ${userMsgCount}
${businessName ? `- Nombre considerado: "${businessName}"` : ''}

${instruction}

## CONVERSACIÓN
${conversationHistory}

Responde:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const responseText = response.text || '';

      // Parse SUGERENCIAS (nombres finales)
      let suggestions: string[] = [];
      const sugMatch = responseText.match(/SUGERENCIAS:\s*(.+)/i);
      if (sugMatch) {
        suggestions = sugMatch[1]
          .split(',')
          .map(n => n.trim().replace(/^\d+\.\s*/, '').replace(/[*"]/g, ''))
          .filter(n => n.length > 0 && n.length < 30);
      }

      // Parse OPCIONES (botones de elección)
      let options: string[] = [];
      const optMatch = responseText.match(/OPCIONES:\s*(.+)/i);
      if (optMatch) {
        options = optMatch[1]
          .split(',')
          .map(o => o.trim().replace(/[*"]/g, ''))
          .filter(o => o.length > 0 && o.length < 40);
      }

      const cleanText = responseText
        .replace(/SUGERENCIAS:\s*.+/i, '')
        .replace(/OPCIONES:\s*.+/i, '')
        .replace(/\*\*/g, '')
        .trim();

      if (suggestions.length > 0) {
        // Names proposed — validate before showing
        const aiMsgId = ++msgId;
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'ai',
          content: cleanText || 'He generado nombres candidatos. Verificando disponibilidad...',
        };
        setMessages(prev => [...prev, aiMsg]);

        // Validate all candidates (domain + Google search)
        setIsValidating(true);
        setValidatedNames([]);
        try {
          const validated = await validateNameCandidates(suggestions);
          const goodNames = validated.filter(v => v.comAvailable === true && v.similarBusinesses.length === 0);
          const partialNames = validated.filter(v => v.comAvailable === true && v.similarBusinesses.length > 0);
          const anyAvailable = goodNames.length > 0 || partialNames.length > 0;

          if (anyAvailable) {
            // We have results to show
            setValidatedNames(validated);
            const defaultOptions = ['Generar más nombres', 'Quiero más creativos', 'Quiero más simples', 'Otra dirección'];
            const finalOptions = options.length > 0 ? options : defaultOptions;
            const statusText = goodNames.length > 0
              ? `He verificado ${suggestions.length} nombres. ${goodNames.length} tienen dominio .com libre y son únicos. Elige el que más te guste:`
              : `He verificado ${suggestions.length} nombres. ${partialNames.length} tienen dominio .com libre (pero existen negocios similares):`;
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, content: statusText, options: finalOptions } : m
            ));
          } else {
            // No .com available — auto-retry with stronger instruction
            const discarded = validated.map(v => v.name).join(', ');
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, content: `Verificando... Los nombres ${discarded} tienen .com ocupado. Generando nombres más únicos...` } : m
            ));

            // Ask AI for more creative names
            const retryPrompt = `${SYSTEM_PROMPT}

## CONTEXTO DE REINTENTO
Los siguientes nombres YA FUERON DESCARTADOS porque su dominio .com está ocupado: ${discarded}
NECESITAS generar 10 nombres COMPLETAMENTE DIFERENTES y mucho más inventados.
USA SOLO neologismos puros de 5-7 letras que combinen sílabas inventadas.
PROHIBIDO usar cualquier palabra real del inglés o español.

## CONVERSACIÓN
${conversationHistory}

GENERA 10 nombres nuevos con SUGERENCIAS:`;

            const retryResponse = await ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: retryPrompt,
            });

            const retryText = retryResponse.text || '';
            const retrySugMatch = retryText.match(/SUGERENCIAS:\s*(.+)/i);
            let retrySuggestions: string[] = [];
            if (retrySugMatch) {
              retrySuggestions = retrySugMatch[1]
                .split(',')
                .map(n => n.trim().replace(/^\d+\.\s*/, '').replace(/[*"]/g, ''))
                .filter(n => n.length > 0 && n.length < 30);
            }

            if (retrySuggestions.length > 0) {
              const retryValidated = await validateNameCandidates(retrySuggestions);
              const allValidated = [...validated, ...retryValidated].sort((a, b) => b.score - a.score);
              setValidatedNames(allValidated);

              const retryGood = allValidated.filter(v => v.comAvailable === true && v.similarBusinesses.length === 0);
              const retryPartial = allValidated.filter(v => v.comAvailable === true && v.similarBusinesses.length > 0);
              const total = suggestions.length + retrySuggestions.length;

              let statusText: string;
              if (retryGood.length > 0) {
                statusText = `He analizado ${total} nombres en total. ${retryGood.length} tienen dominio .com libre y son únicos:`;
              } else if (retryPartial.length > 0) {
                statusText = `He analizado ${total} nombres. ${retryPartial.length} tienen dominio .com libre:`;
              } else {
                statusText = `He analizado ${total} nombres pero ninguno tiene .com libre. Puedes generar más o escribir un nombre manualmente.`;
              }
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: statusText, options: ['Generar más nombres', 'Quiero probar otro estilo', 'Escribir nombre manualmente'] } : m
              ));
            } else {
              // Retry also failed
              setValidatedNames(validated);
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: `He analizado ${suggestions.length} nombres pero ninguno tiene .com libre. Intenta generar más o escribe un nombre manualmente.`, options: ['Generar más nombres', 'Escribir nombre manualmente'] } : m
              ));
            }
          }
        } catch {
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: cleanText || 'Aquí tienes mis propuestas:', suggestions }
              : m
          ));
        } finally {
          setIsValidating(false);
        }
      } else {
        // Normal message (question with options, no names)
        const aiMsg: ChatMessage = {
          id: ++msgId,
          role: 'ai',
          content: cleanText,
          options: options.length > 0 ? options : undefined,
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error: any) {
      toast(`Error de IA: ${error.message || 'Fallo en la conexión'}`, 'error');
      const errorMsg: ChatMessage = {
        id: ++msgId,
        role: 'ai',
        content: 'Disculpa, he tenido un problema al procesar. ¿Puedes repetir?',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Pantalla inicial: elección ───
  if (nameChoice === null) {
    return (
      <motion.div
        key="business-choice"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-3xl mx-auto space-y-10"
      >
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Tu Marca</h1>
          <p className="text-neutral-500 text-sm">Primero, necesitamos definir el nombre de tu negocio.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => setNameChoice('has_name')}
            className="group p-8 bg-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-white hover:shadow-lg hover:shadow-black/20 transition-all duration-300 space-y-5"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-800 text-white flex items-center justify-center group-hover:bg-white group-hover:text-neutral-900 transition-all duration-300">
              <PenLine size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ya tengo un nombre</h3>
              <p className="text-sm text-neutral-500 mt-1">Quiero continuar con el nombre que ya elegí para mi empresa.</p>
            </div>
          </button>

          <button
            onClick={() => setNameChoice('needs_name')}
            className="group p-8 bg-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-white hover:shadow-lg hover:shadow-black/20 transition-all duration-300 space-y-5"
          >
            <div className="w-12 h-12 rounded-xl bg-neutral-800 text-white flex items-center justify-center group-hover:bg-white group-hover:text-neutral-900 transition-all duration-300">
              <Wand2 size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Necesito crear un nombre</h3>
              <p className="text-sm text-neutral-500 mt-1">Quiero la ayuda de nuestra IA especialista en naming para encontrar el nombre ideal.</p>
            </div>
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Camino 1: ya tiene nombre ───
  if (nameChoice === 'has_name') {
    return (
      <motion.div
        key="business-hasname"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Tu Negocio</h1>
          <p className="text-neutral-500 text-sm">Indica el nombre de tu empresa y cuéntanos sobre ella.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: formulario */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">Nombre de la empresa <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Escribe el nombre de tu empresa..."
                className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
              />
              {businessName.length > 0 && businessName.trim().length < 3 && (
                <p className="text-xs text-neutral-500">Mínimo 3 caracteres.</p>
              )}
            </div>

            <Textarea
              label="Sobre la empresa"
              placeholder="Cuéntanos qué hace tu empresa, qué servicios ofrece, qué problema resuelve..."
              value={aboutUs}
              onChange={(e: any) => setAboutUs(e.target.value)}
            />
            {aboutUs.length > 0 && aboutUs.trim().length < 3 && (
              <p className="text-xs text-neutral-500 -mt-4">Mínimo 3 caracteres.</p>
            )}

            {/* Enhanced business fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-neutral-400 tracking-wide">Email de la empresa</label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="info@tuempresa.com"
                  className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-neutral-400 tracking-wide">Año de fundación</label>
                <input
                  type="text"
                  value={yearFounded}
                  onChange={(e) => setYearFounded(e.target.value)}
                  placeholder="Ej: 2020"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-neutral-400 tracking-wide">Dirección de la empresa</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Calle, número, ciudad, código postal..."
                rows={2}
                className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 resize-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-neutral-400 tracking-wide">Sector de actividad</label>
              <div className="flex flex-wrap gap-2">
                {industrySectors.map(s => (
                  <button
                    key={s}
                    onClick={() => setIndustrySector(industrySector === s ? '' : s)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200",
                      industrySector === s
                        ? "border-white bg-white text-neutral-900"
                        : "border-neutral-700 text-neutral-400 hover:border-neutral-500 bg-neutral-800"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              {!isEditing && (
                <Button variant="outline" onClick={() => setNameChoice(null)}>
                  Volver
                </Button>
              )}
              {isEditing && <div />}
              <Button onClick={onNext} className="px-8 py-3" disabled={false}>
                Siguiente <ChevronRight size={18} strokeWidth={1.5} />
              </Button>
            </div>
          </Card>

          {/* Columna derecha: dominios */}
          <div className="space-y-5">
            {businessName.trim().length >= 3 && (
              <Card className="p-5 space-y-4 border-neutral-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center shrink-0">
                    <Globe size={15} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Dominios para "{businessName.trim()}"</h3>
                    <p className="text-[11px] text-neutral-500">Verificación automática</p>
                  </div>
                </div>
                <DomainChecker businessName={businessName} selectedDomain={selectedDomain} onDomainSelect={setSelectedDomain} />
              </Card>
            )}
            {businessName.trim().length >= 3 && (
              <NegocioChecker businessName={businessName} />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Camino 2: necesita crear nombre (chat con IA) ───
  return (
    <motion.div
      key="business-chat"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Crea el Nombre de Tu Marca</h1>
        <p className="text-neutral-500 text-sm">Nuestro estratega te guiará en un proceso consultivo para encontrar el nombre ideal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chat */}
        <div className="lg:col-span-3 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-sm flex flex-col h-[650px] min-h-[400px] overflow-hidden">
          <div className="p-4 bg-neutral-950 text-white flex items-center gap-3 shrink-0 rounded-t-2xl">
            <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center">
              <Sparkles size={16} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-sm">Brand Strategist</p>
              <p className="text-[11px] text-neutral-400">Director creativo de naming</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 animate-pulse" />
              <span className="text-[11px] text-neutral-400">En línea</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-800/60 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                  <Sparkles size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-white mb-2">Vamos a crear tu marca</h3>
                <p className="text-sm text-neutral-500 max-w-sm mb-6">
                  Cuéntame sobre tu negocio y te guiaré paso a paso hasta el nombre perfecto.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'Tengo un estudio audiovisual y de podcasts',
                    'Estoy creando una agencia de marketing digital',
                    'Voy a abrir un restaurante mediterráneo',
                    'Tengo una consultoría de negocios',
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => sendOptionMessage(s)}
                      className="px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-white transition-all duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-neutral-900 text-white rounded-br-md"
                      : "bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-bl-md"
                  )}>
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Botones de opciones (guía paso a paso) */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-700 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {msg.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => sendOptionMessage(opt)}
                              disabled={isGenerating || isValidating}
                              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-white transition-all duration-200 disabled:opacity-40"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Old suggestions fallback (if validation failed) */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-700 space-y-3">
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Nombres propuestos:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestions.map(name => (
                            <button
                              key={name}
                              onClick={() => setBusinessName(name)}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200",
                                businessName === name
                                  ? "bg-neutral-900 text-white border-neutral-900 shadow-md scale-105"
                                  : "bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-white hover:shadow-sm"
                              )}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-300 flex items-center justify-center shrink-0 mt-1">
                      <User size={14} strokeWidth={1.5} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Validated Names Display */}
            {isValidating && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-1">
                  <Globe size={14} strokeWidth={1.5} />
                </div>
                <div className="bg-neutral-800 border border-neutral-700 rounded-2xl rounded-bl-md px-4 py-4 max-w-[90%]">
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-200">Verificando disponibilidad...</p>
                      <p className="text-[11px] text-neutral-500">Comprobando dominios .com y buscando negocios existentes</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {validatedNames.length > 0 && !isValidating && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 ml-10">
                {/* Good names: .com free + no businesses */}
                {validatedNames.filter(v => v.comAvailable === true && v.similarBusinesses.length === 0).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-white uppercase tracking-widest px-1 flex items-center gap-1.5">
                      <CheckCircle2 size={11} strokeWidth={2} />
                      Disponibles — dominio libre y nombre único
                    </p>
                    {validatedNames
                      .filter(v => v.comAvailable === true && v.similarBusinesses.length === 0)
                      .map(v => (
                        <button
                          key={v.name}
                          onClick={() => setBusinessName(v.name)}
                          className={cn(
                            "w-full text-left p-3.5 rounded-xl border transition-all duration-200 group",
                            businessName === v.name
                              ? "bg-neutral-950 border-neutral-950 ring-2 ring-neutral-700 ring-offset-1"
                              : "bg-neutral-950 border-neutral-950 hover:ring-2 hover:ring-neutral-600 hover:ring-offset-1"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold text-base tracking-tight">{v.name}</span>
                            {businessName === v.name ? (
                              <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Elegido</span>
                            ) : (
                              <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Elegir</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-white/60 font-mono">{v.slug}.com</span>
                            <span className="text-[10px] text-white/40">·</span>
                            <span className="text-[11px] text-white/60">{v.availableDomains.length} dominios libres</span>
                            <span className="text-[10px] text-white/40">·</span>
                            <span className="text-[11px] text-white/60">Sin negocios similares</span>
                          </div>
                          {v.availableDomains.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {v.availableDomains.slice(0, 6).map(d => (
                                <span key={d.domain} className="text-[10px] font-mono text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                                  .{d.tld}
                                </span>
                              ))}
                              {v.availableDomains.length > 6 && (
                                <span className="text-[10px] text-white/40">+{v.availableDomains.length - 6}</span>
                              )}
                            </div>
                          )}
                        </button>
                      ))
                    }
                  </div>
                )}

                {/* Partial: .com free but businesses exist */}
                {validatedNames.filter(v => v.comAvailable === true && v.similarBusinesses.length > 0).length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                      <Circle size={11} strokeWidth={2} />
                      Dominio libre — pero existen negocios similares
                    </p>
                    {validatedNames
                      .filter(v => v.comAvailable === true && v.similarBusinesses.length > 0)
                      .map(v => (
                        <button
                          key={v.name}
                          onClick={() => setBusinessName(v.name)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl border transition-all duration-200",
                            businessName === v.name
                              ? "bg-neutral-800/40 border-neutral-400 ring-2 ring-neutral-300 ring-offset-1"
                              : "bg-neutral-800 border-neutral-700 hover:border-neutral-500"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-200 font-semibold text-sm">{v.name}</span>
                            <span className="text-[10px] font-mono text-neutral-500">{v.slug}.com libre</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            {v.similarBusinesses.length} negocio{v.similarBusinesses.length !== 1 ? 's' : ''} similar{v.similarBusinesses.length !== 1 ? 'es' : ''} encontrado{v.similarBusinesses.length !== 1 ? 's' : ''}
                          </p>
                        </button>
                      ))
                    }
                  </div>
                )}

                {/* Unavailable: .com taken */}
                {validatedNames.filter(v => v.comAvailable === false).length > 0 && (
                  <div className="space-y-1 mt-3">
                    <p className="text-[10px] font-medium text-neutral-300 uppercase tracking-widest px-1 flex items-center gap-1.5">
                      <XCircle size={11} strokeWidth={1.5} />
                      {validatedNames.filter(v => v.comAvailable === false).length} descartados — dominio .com ocupado
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {validatedNames
                        .filter(v => v.comAvailable === false)
                        .map(v => (
                          <span key={v.name} className="text-[11px] text-neutral-300 line-through px-2 py-1">
                            {v.name}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {validatedNames.length > 0 && !isValidating && !isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
                <button
                  onClick={() => sendOptionMessage('Generar más nombres')}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-medium rounded-xl hover:bg-neutral-700 transition-all"
                >
                  Generar más nombres
                </button>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <Bot size={14} strokeWidth={1.5} />
                </div>
                <div className="bg-neutral-800 border border-neutral-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-neutral-500 ml-1">Analizando...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-neutral-800 border-t border-neutral-700 shrink-0">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={messages.length === 0
                  ? "Describe tu negocio con detalle..."
                  : "Responde las preguntas o pide ajustes..."
                }
                rows={3}
                className="flex-1 px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 resize-none transition-all"
              />
              <Button
                variant="primary"
                onClick={sendMessage}
                disabled={isGenerating || isValidating || !input.trim()}
                className="self-end px-4 py-3"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={1.5} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 space-y-4 border-neutral-700">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Sparkles size={15} strokeWidth={1.5} className="text-neutral-300" /> Nombre Elegido
            </h3>
            {businessName ? (
              <div className="space-y-3">
                <div className="p-4 bg-neutral-950 text-white rounded-xl text-center">
                  <p className="text-lg font-semibold tracking-tight">{businessName}</p>
                  <p className="text-[11px] text-white/50 font-mono mt-1">{nameToSlug(businessName)}.com</p>
                </div>
                {(() => {
                  const validated = validatedNames.find(v => v.name === businessName);
                  if (validated && validated.allDomains.length > 0) {
                    // Validated name from chat — show status + interactive domain list
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 justify-center py-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {validated.comAvailable === true ? (
                              <><CheckCircle2 size={13} strokeWidth={1.5} className="text-white" /> <span className="text-neutral-300">.com libre</span></>
                            ) : (
                              <><XCircle size={13} strokeWidth={1.5} className="text-neutral-400" /> <span className="text-neutral-400">.com ocupado</span></>
                            )}
                          </div>
                          <span className="text-neutral-300">·</span>
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {validated.similarBusinesses.length === 0 ? (
                              <><CheckCircle2 size={13} strokeWidth={1.5} className="text-white" /> <span className="text-neutral-300">Único</span></>
                            ) : (
                              <><Circle size={13} strokeWidth={1.5} className="text-neutral-400" /> <span className="text-neutral-400">{validated.similarBusinesses.length} similar(es)</span></>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-neutral-100">
                          <div className="flex items-center gap-2 px-1">
                            <Globe size={13} strokeWidth={1.5} className="text-neutral-300" />
                            <span className="text-[10px] font-semibold text-neutral-200 uppercase tracking-wider">Dominios</span>
                          </div>
                          <DomainResults results={validated.allDomains} checking={false} selectedDomain={selectedDomain} onDomainSelect={setSelectedDomain} />
                        </div>
                      </div>
                    );
                  }
                  // Manual name or no domain data — run live domain check
                  return <DomainChecker businessName={businessName} selectedDomain={selectedDomain} onDomainSelect={setSelectedDomain} />;
                })()}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-neutral-800/40 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={18} strokeWidth={1.5} className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-400">
                  Conversa con el estratega y selecciona un nombre.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-700">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">O escríbelo manualmente</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Escribe el nombre..."
                className="mt-1.5 w-full px-3 py-2.5 bg-neutral-800/60 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
              />
            </div>
          </Card>

          {businessName.trim().length >= 3 && (
            <NegocioChecker businessName={businessName} />
          )}

          <Card className="p-6 space-y-3 border-neutral-700">
            <h3 className="font-semibold text-white text-sm">Sobre la empresa</h3>
            <p className="text-xs text-neutral-400">Rellenado por la conversación. Edita si es necesario.</p>
            <textarea
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder="Cuéntanos qué hace tu empresa..."
              rows={5}
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 resize-none transition-all"
            />
            {aboutUs.length > 0 && aboutUs.trim().length < 3 && (
              <p className="text-xs text-neutral-500">Mínimo 3 caracteres.</p>
            )}
          </Card>

          <div className="space-y-3">
            <Button onClick={onNext} className="w-full py-3" disabled={false}>
              Siguiente <ChevronRight size={18} strokeWidth={1.5} />
            </Button>
            {!isEditing && (
              <button
                onClick={() => setNameChoice(null)}
                className="w-full text-center text-xs text-neutral-500 hover:text-white transition-colors py-2"
              >
                Volver a la elección inicial
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
