// src/lib/api.ts
const BASE_URL = '/api';

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  try {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('auth_token')
    );
  } catch {
    return null;
  }
}

export function setToken(t: string) {
  try {
    localStorage.setItem('token', t);
  } catch {
    /* no-op */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('auth_token');
  } catch {
    /* no-op */
  }
}

/**
 * Devuelve SIEMPRE un objeto plano de headers (Record<string,string>).
 * Si hay token, incluye Authorization; si no, devuelve {}.
 */
export function authHeaders(): Record<string, string> {
  const t = getToken();
  const h: Record<string, string> = {};
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

/**
 * Wrapper de fetch que normaliza headers para que cumplan con HeadersInit
 * y agrega 'Content-Type': 'application/json' por defecto.
 * Además, INYECTA Authorization automáticamente si hay token.
 */
export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

  let mergedHeaders: HeadersInit;

  if (opts.headers instanceof Headers) {
    // El usuario pasó un Headers: clonamos y fusionamos defaults + auth
    const h = new Headers(opts.headers);
    for (const [k, v] of Object.entries(defaultHeaders)) if (!h.has(k)) h.set(k, v);
    const auth = authHeaders();
    for (const [k, v] of Object.entries(auth)) if (!h.has(k)) h.set(k, v);
    mergedHeaders = h;
  } else {
    // Objeto plano o undefined: unimos defaults + Authorization + lo que haya pasado el caller (si algo)
    mergedHeaders = {
      ...defaultHeaders,
      ...authHeaders(),
      ...(opts.headers as Record<string, string> | undefined),
    };
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers: mergedHeaders });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      throw new Error(
        Array.isArray(j.message)
          ? j.message.join(', ')
          : j.message || j.error || `HTTP ${res.status}`
      );
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
