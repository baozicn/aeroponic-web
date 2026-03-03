import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(n: number | null | undefined, min: number, max: number): number | null {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Math.min(max, Math.max(min, n));
}

export function num(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function bool(v: any): boolean | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).toLowerCase();
  if (['1', 'true', 'on', 'yes'].includes(s)) return true;
  if (['0', 'false', 'off', 'no'].includes(s)) return false;
  return null;
}

export function fmt(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return '—';
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits);
}

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  return String(Math.round(x));
}

export function safeJsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}
