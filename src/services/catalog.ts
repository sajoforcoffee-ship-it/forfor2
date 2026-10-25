import { supabase } from './supabase';

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  average_rating: string;
  rating_count: number;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ id: number; name: string; options: string[]; variation: boolean }>;
  in_stock: boolean;
  stock_quantity: number | null;
  related_ids: number[];
  total_sales: number;
  date_created: string;
  origin?: string;
  roast?: string;
  tasting_notes?: string;
  brewing?: string;
}

export interface Category { id: number; name: string; slug: string; count: number; image?: { src: string } }
export type SortOption = 'default' | 'newest' | 'best-selling' | 'price-low' | 'price-high';
export interface ProductQueryParams { per_page?: number; page?: number; search?: string; category?: number; category_slug?: string; orderby?: string; order?: 'asc' | 'desc'; min_price?: number; max_price?: number; on_sale?: boolean }
export interface ProductsResponse { products: Product[]; total: number; totalPages: number }

type CatalogRow = {
  id: number; slug: string; name: string; category: string; origin: string | null; description: string;
  short_description: string | null; tasting_notes: string | null; brewing: string | null; roast: string | null;
  image_url: string | null; price: number; weight_grams: number; stock_quantity: number; is_active: boolean; created_at: string;
};

function mapProduct(row: CatalogRow): Product {
  const categorySlug = row.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: row.id, name: row.name, slug: row.slug, permalink: `/urun/${row.slug}`, description: row.description,
    short_description: row.short_description ?? row.tasting_notes ?? '', price: String(row.price), regular_price: String(row.price), sale_price: '', on_sale: false,
    average_rating: '0', rating_count: 0, images: row.image_url ? [{ src: row.image_url, alt: row.name }] : [],
    categories: [{ id: 0, name: row.category, slug: categorySlug }], attributes: [{ id: 0, name: 'Gramaj', options: [`${row.weight_grams} g`], variation: true }],
    in_stock: row.stock_quantity > 0, stock_quantity: row.stock_quantity, related_ids: [], total_sales: 0, date_created: row.created_at,
    origin: row.origin ?? undefined, roast: row.roast ?? undefined, tasting_notes: row.tasting_notes ?? undefined, brewing: row.brewing ?? undefined,
  };
}

function requireSupabase() { if (!supabase) throw new Error('Supabase bağlantısı yapılandırılmamış.'); return supabase; }

export const catalogAPI = {
  async getProducts(params: ProductQueryParams = {}): Promise<ProductsResponse> {
    const client = requireSupabase();
    let query = client.from('products').select('id,slug,name,category,origin,description,short_description,tasting_notes,brewing,roast,image_url,price,weight_grams,stock_quantity,is_active,created_at', { count: 'exact' }).eq('is_active', true);
    if (params.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params.category_slug) query = query.ilike('category', params.category_slug.replace(/-/g, ' '));
    if (params.min_price !== undefined) query = query.gte('price', params.min_price);
    if (params.max_price !== undefined) query = query.lte('price', params.max_price);
    const ascending = params.order === 'asc';
    if (params.orderby === 'price') query = query.order('price', { ascending });
    else if (params.orderby === 'date') query = query.order('created_at', { ascending: false });
    else query = query.order('name', { ascending: true });
    const page = params.page ?? 1; const perPage = params.per_page ?? 12;
    query = query.range((page - 1) * perPage, page * perPage - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return { products: (data as CatalogRow[] ?? []).map(mapProduct), total: count ?? 0, totalPages: Math.max(1, Math.ceil((count ?? 0) / perPage)) };
  },
  async getProduct(id: number): Promise<Product> {
    const client = requireSupabase(); const { data, error } = await client.from('products').select('*').eq('id', id).eq('is_active', true).single();
    if (error || !data) throw new Error('Ürün yüklenemedi.'); return mapProduct(data as CatalogRow);
  },
  async getCategories(): Promise<Category[]> {
    const client = requireSupabase(); const { data, error } = await client.from('products').select('category').eq('is_active', true);
    if (error) throw error; const counts = new Map<string, number>(); (data ?? []).forEach((row) => counts.set(row.category, (counts.get(row.category) ?? 0) + 1));
    return [...counts.entries()].map(([name, count], id) => ({ id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), count }));
  },
  buildSortParams(sort: SortOption): { orderby?: string; order?: 'asc' | 'desc' } {
    if (sort === 'price-low') return { orderby: 'price', order: 'asc' }; if (sort === 'price-high') return { orderby: 'price', order: 'desc' }; if (sort === 'newest') return { orderby: 'date', order: 'desc' }; return {};
  },
};
