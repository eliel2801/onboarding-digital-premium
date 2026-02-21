import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

// Prevent NavigatorLock timeout on page reload (Supabase Auth known issue)
if (typeof navigator !== 'undefined' && navigator.locks) {
  const originalRequest = navigator.locks.request.bind(navigator.locks);
  (navigator.locks as any).request = (name: string, optionsOrFn: any, maybeFn?: any) => {
    const fn = typeof optionsOrFn === 'function' ? optionsOrFn : maybeFn;
    if (typeof name === 'string' && name.startsWith('lock:sb-') && typeof fn === 'function') {
      return fn({ name, mode: 'exclusive' });
    }
    return originalRequest(name, optionsOrFn, maybeFn);
  };
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
