import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface CmsSection {
  id: string;
  section_key: string;
  title: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  status: 'draft' | 'published';
  published_at: string | null;
}

export async function getPublishedSections(): Promise<CmsSection[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cms_sections')
    .select('id,section_key,title,content,sort_order,is_visible,status,published_at')
    .eq('status', 'published')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCmsAdminStatus(): Promise<{ isAdmin: boolean; role: 'editor' | 'admin' | null }> {
  if (!supabase) return { isAdmin: false, role: null };
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { isAdmin: false, role: null };
  const { data } = await supabase.from('cms_admins').select('role').eq('user_id', userId).maybeSingle();
  return { isAdmin: Boolean(data), role: data?.role ?? null };
}
