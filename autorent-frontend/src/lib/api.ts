const BASE_URL = '/api';

export async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    try {
      const j = JSON.parse(text);
      throw new Error(Array.isArray(j.message) ? j.message.join(', ') : j.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json();
}

export function setToken(t: string) { localStorage.setItem('token', t); }
export function getToken() { return localStorage.getItem('token'); }
export function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }
