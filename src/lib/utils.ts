import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) {
    u = 'https://' + u;
  }
  try {
    new URL(u);
    return u;
  } catch {
    return '';
  }
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
