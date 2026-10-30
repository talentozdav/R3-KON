/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * R3 Contingencies — Client-Side Supabase SDK
 * Strictly utilizes Vite public environment variables (import.meta.env)
 * and the anon / publishable key. Never includes server secret keys.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Retrieve base URL exclusively from Vite client environment
const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';

let cleanedUrl = '';
if (rawUrl) {
  try {
    // Ensure project URL is the base Supabase project URL, not a subpath or JWKS endpoint
    cleanedUrl = new URL(rawUrl).origin;
  } catch {
    cleanedUrl = rawUrl.replace(/\/+$/, '');
  }
}

// Retrieve publishable / anon key (never service_role or secret key)
const publishableKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) || 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
  '';

export const isSupabaseConfigured: boolean = Boolean(
  cleanedUrl && 
  publishableKey && 
  cleanedUrl !== 'https://your-project-id.supabase.co' &&
  !cleanedUrl.includes('example.com')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(cleanedUrl, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const getSupabaseClientEndpoint = (): string => cleanedUrl;
