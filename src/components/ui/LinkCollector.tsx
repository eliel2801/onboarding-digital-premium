import React, { useState, useRef } from 'react';
import { X, ExternalLink, Plus, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, normalizeUrl, extractDomain } from '../../lib/utils';

interface LinkCollectorProps {
  links: string[];
  onChange: (links: string[]) => void;
  placeholder?: string;
  maxLinks?: number;
  label?: string;
}

export const LinkCollector = ({
  links,
  onChange,
  placeholder = 'Pega una URL y presiona Enter...',
  maxLinks = 20,
  label,
}: LinkCollectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addLinks = (raw: string) => {
    setError('');
    const parts = raw.split(/[\s\n,]+/).filter(Boolean);
    const newLinks: string[] = [];

    for (const part of parts) {
      const normalized = normalizeUrl(part);
      if (!normalized) {
        setError(`URL no válida: ${part}`);
        continue;
      }
      if (links.includes(normalized)) {
        setError(`Ya existe: ${extractDomain(normalized)}`);
        continue;
      }
      if (links.length + newLinks.length >= maxLinks) {
        setError(`Máximo ${maxLinks} links`);
        break;
      }
      newLinks.push(normalized);
    }

    if (newLinks.length > 0) {
      onChange([...links, ...newLinks]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) addLinks(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text && (text.includes('http') || text.includes('www.') || text.includes('.'))) {
      e.preventDefault();
      addLinks(text);
    }
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[13px] font-medium text-neutral-400 tracking-wide">{label}</label>
      )}

      {/* Input */}
      <div className="relative">
        <Link2 size={15} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all"
        />
        {inputValue.trim() && (
          <button
            onClick={() => addLinks(inputValue)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Chips */}
      <AnimatePresence>
        {links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {links.map((link, i) => (
              <motion.div
                key={link}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-all"
              >
                <span className="text-neutral-500 text-xs">🌐</span>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {extractDomain(link)}
                  <ExternalLink size={10} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <button
                  onClick={() => removeLink(i)}
                  className="p-0.5 rounded hover:bg-neutral-700 transition-colors ml-0.5"
                >
                  <X size={12} strokeWidth={1.5} className="text-neutral-500 hover:text-neutral-300" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
