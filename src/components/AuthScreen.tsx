import React, { useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Button } from './ui';

const errorMessages: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Correo aún no confirmado. Revisa tu bandeja de entrada.',
  'Unable to validate email address: invalid format': 'Formato de correo electrónico no válido.',
};

function translateError(msg: string): string {
  return errorMessages[msg] || msg;
}

export const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(translateError(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-white/[0.03] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full border border-white/[0.03] translate-y-1/3 -translate-x-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-800 text-white mb-5">
            <TrendingUp size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Onboarding Digital</h1>
          <p className="text-neutral-500 mt-2 text-sm">Accede a tu consultoría premium</p>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-neutral-400 tracking-wide uppercase">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-neutral-500 transition-all text-sm"
              />
            </div>
            {authError && (
              <p className="text-sm text-red-400 font-medium">{authError}</p>
            )}
            <Button type="submit" className="w-full py-3 bg-white text-neutral-900 hover:bg-neutral-200" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Espera...</>
              ) : (
                'Acceder al portal'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-700 mt-8">
          Protegido por cifrado de extremo a extremo
        </p>
      </motion.div>
    </div>
  );
};
