import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/lib/admin-auth-context-hooks';

export type AdminActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_PAGE'
  | 'BUTTON_CLICK'
  | 'ERROR'
  | 'DATA_UPDATE'
  | 'DATA_DELETE'
  | 'DATA_CREATE';

export interface ClientNetworkInfo {
  ip: string;
  location: string;
}

const NETWORK_CACHE_KEY = 'gcos_admin_network_info';
let cachedInfo: ClientNetworkInfo | null = null;

// Looks up IP + approximate location once per browser tab session and caches it.
export async function getClientPublicIp(): Promise<ClientNetworkInfo> {
  if (cachedInfo) return cachedInfo;
  try {
    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(NETWORK_CACHE_KEY) : null;
    if (stored) {
      cachedInfo = JSON.parse(stored) as ClientNetworkInfo;
      return cachedInfo;
    }
  } catch {
    // ignore corrupt cache
  }

  let info: ClientNetworkInfo = { ip: 'unknown', location: 'Unknown' };
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; ip?: string; city?: string; region?: string; country?: string };
      if (data.ip) {
        const location = [data.city, data.country].filter(Boolean).join(', ') || 'Unknown';
        info = { ip: data.ip, location };
      }
    }
  } catch {
    try {
      const res2 = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (res2.ok) {
        const data2 = (await res2.json()) as { ip?: string };
        if (data2.ip) info = { ip: data2.ip, location: 'Unknown' };
      }
    } catch {
      // ignore
    }
  }

  cachedInfo = info;
  try {
    sessionStorage.setItem(NETWORK_CACHE_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
  return info;
}

export function useAdminLogger() {
  const { session } = useAdminAuth();

  const logActivity = useCallback(async (
    action: AdminActionType, 
    target: string, 
    details?: Record<string, unknown>
  ) => {
    try {
      const adminId = session?.uid || 'anonymous';
      const adminEmail = session?.email || 'unknown';
      
      const { error } = await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        target,
        details: details || {},
        created_at: new Date().toISOString()
      });

      if (error) {
        console.warn('Admin audit log not saved:', error.message || error);
      }
    } catch (e) {
      console.warn('Error in admin audit logging:', e);
    }
  }, [session]);

  return { logActivity };
}
