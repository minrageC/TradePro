import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'traderpro_supabase_url';
const STORAGE_KEY_KEY = 'traderpro_supabase_anon_key';
const STORAGE_KEY_AUTOSYNC = 'traderpro_supabase_autosync';

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export interface StoredSupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  isEnvConfigured: boolean;
  isConfigured: boolean;
}

/**
 * Retorna as configurações atuais do Supabase (lendo das variáveis Vercel/Vite ou do armazenamento local)
 */
export function getSupabaseSettings(): StoredSupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let localUrl = '';
  let localKey = '';
  let autoSync = true;

  try {
    localUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
    localKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
    const storedAutoSync = localStorage.getItem(STORAGE_KEY_AUTOSYNC);
    if (storedAutoSync !== null) {
      autoSync = storedAutoSync === 'true';
    }
  } catch {
    // ignore
  }

  const finalUrl = envUrl || localUrl;
  const finalKey = envKey || localKey;
  const isEnvConfigured = Boolean(envUrl && envKey);
  const isConfigured = Boolean(finalUrl && finalKey);

  return {
    url: finalUrl,
    anonKey: finalKey,
    autoSync,
    isEnvConfigured,
    isConfigured,
  };
}

/**
 * Salva as credenciais do Supabase no armazenamento local (para testes imediatos ou sem redeploy)
 */
export function saveCustomSupabaseSettings(url: string, anonKey: string, autoSync: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    localStorage.setItem(STORAGE_KEY_AUTOSYNC, String(autoSync));
  } catch {
    // ignore
  }

  // Limpa o cache do cliente para recriar com as novas credenciais
  cachedClient = null;
}

/**
 * Limpa as credenciais salvas no armazenamento local
 */
export function clearCustomSupabaseSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    localStorage.removeItem(STORAGE_KEY_AUTOSYNC);
  } catch {
    // ignore
  }
  cachedClient = null;
}

/**
 * Obtém a instância do cliente Supabase inicializado
 */
export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const settings = getSupabaseSettings();
  const url = customUrl || settings.url;
  const anonKey = customKey || settings.anonKey;

  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Falha ao inicializar cliente Supabase:', error);
    return null;
  }
}
