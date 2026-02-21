import React from 'react';

interface TextareaProps {
  label: string;
  [key: string]: any;
}

export const Textarea = ({ label, ...props }: TextareaProps) => (
  <div className="space-y-2">
    <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">{label}</label>
    <textarea
      {...props}
      rows={4}
      className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all resize-none"
    />
  </div>
);
