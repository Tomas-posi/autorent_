const BASE_URL = '/api';

export function getToken() { return localStorage.getItem('token'); }
export function setToken(t: string) { localStorage.setItem('token', t); }
export function clearToken() { localStorage.removeItem('token'); }

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
 */
export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

  let mergedHeaders: HeadersInit;
  if (opts.headers instanceof Headers) {
    // Si el usuario pasó un Headers, creamos uno nuevo y fusionamos
    const h = new Headers(opts.headers);
    for (const [k, v] of Object.entries(defaultHeaders)) h.set(k, v);
    mergedHeaders = h;
  } else {
    // Si pasó objeto plano o nada, unimos con los defaults
    mergedHeaders = { ...defaultHeaders, ...(opts.headers as Record<string, string> | undefined) };
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers: mergedHeaders });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      throw new Error(Array.isArray(j.message) ? j.message.join(', ') : j.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

