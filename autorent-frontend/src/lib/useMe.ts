import { useEffect, useState } from 'react';
import { api, authHeaders, clearToken } from './api';

export type Me = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: 'ADMIN' | 'EMPLEADO';
  avatarUrl?: string | null;
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // headers como Record<string,string> — OK para HeadersInit
        const data = await api<Me>('/empleados/me', { headers: authHeaders() });
        if (alive) setMe(data);
      } catch (e: any) {
        if (e.message.includes('401') || e.message.includes('403')) {
          clearToken();
        } else {
          setErr(e.message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { me, loading, error };
}
