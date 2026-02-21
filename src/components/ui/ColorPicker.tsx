import React, { useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
  label?: string;
}

export const ColorPicker = ({
  colors,
  onChange,
  maxColors = 5,
  label,
}: ColorPickerProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const addColor = (hex: string) => {
    const normalized = hex.toUpperCase();
    if (colors.includes(normalized)) return;
    if (colors.length >= maxColors) return;
    onChange([...colors, normalized]);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    addColor(e.target.value);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[13px] font-medium text-neutral-400 tracking-wide">{label}</label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <AnimatePresence>
          {colors.map((color, i) => (
            <motion.div
              key={color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative flex flex-col items-center gap-1.5"
            >
              <div
                className="w-12 h-12 rounded-xl border-2 border-neutral-700 shadow-md cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-mono text-neutral-500">{color}</span>
              <button
                onClick={() => removeColor(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-neutral-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {colors.length < maxColors && (
          <div className="relative flex flex-col items-center gap-1.5">
            <button
              onClick={() => colorInputRef.current?.click()}
              className="w-12 h-12 rounded-xl border-2 border-dashed border-neutral-600 flex items-center justify-center text-neutral-500 hover:border-white hover:text-white transition-all cursor-pointer"
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
            <span className="text-[10px] text-neutral-500">Añadir</span>
            <input
              ref={colorInputRef}
              type="color"
              onChange={handleColorInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-12 h-12"
            />
          </div>
        )}
      </div>

      {colors.length > 0 && (
        <p className="text-xs text-neutral-500">{colors.length}/{maxColors} colores</p>
      )}
    </div>
  );
};
