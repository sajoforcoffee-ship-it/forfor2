import catalogRows from '../data/coffee-products.json';
const API_URL = import.meta.env.VITE_WOOCOMMERCE_API_URL;
const CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;

const FALLBACK_PRODUCTS: Product[] = Object.values((catalogRows as Array<{ code: string; name: string; category: string; origin: string; weightGrams: number; price: number; roast: string; description: string; tastingNotes: string; brewing: string; image: string }>).reduce<Record<string, (typeof catalogRows)[number]>>((products, row) => {
  if (!products[row.name] || row.weightGrams === 250) products[row.name] = row;
  return products;
}, {})).map((row, index) => ({
  id: index + 1, name: row.name, slug: row.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), permalink: '#',
  description: row.description, short_description: row.tastingNotes, price: String(row.price), regular_price: String(row.price), sale_price: '', on_sale: false, average_rating: '0', rating_count: 0,
  images: [{ src: row.image, alt: row.name }], categories: [{ id: index + 1, name: row.category, slug: row.category.toLowerCase().replace(/\s+/g, '-') }], attributes: [{ id: 1, name: 'Gramaj', options: ['250 g', '500 g'], variation: true }], in_stock: true, stock_quantity: null, related_ids: [], total_sales: 0, date_created: '2026-01-01', origin: row.origin, roast: row.roast, tasting_notes: row.tastingNotes, brewing: row.brewing,
}));

const getAuthHeader = () => {
  if (!API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('WooCommerce API yapılandırması eksik.');
  }

  const credentials = `${CONSUMER_KEY}:${CONSUMER_SECRET}`;
  return `Basic ${btoa(credentials)}`;
};

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
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
    variation: boolean;
  }>;
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

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: { src: string };
  count: number;
}

export type SortOption = 'default' | 'newest' | 'best-selling' | 'price-low' | 'price-high';

export interface ProductQueryParams {
  per_page?: number;
  page?: number;
  search?: string;
  category?: number;
  category_slug?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  attribute?: string;
  attribute_term?: string;
  on_sale?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
}

export const woocommerceAPI = {
  async getProducts(params: ProductQueryParams = {}): Promise<ProductsResponse> {
    if (!API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return { products: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length, totalPages: 1 };
    }

    const query = new URLSearchParams();
    query.append('per_page', String(params.per_page ?? 12));
    query.append('page', String(params.page ?? 1));
    query.append('status', 'publish');

    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', String(params.category));
    if (params.orderby) query.append('orderby', params.orderby);
    if (params.order) query.append('order', params.order);
    if (params.min_price !== undefined) query.append('min_price', String(params.min_price));
    if (params.max_price !== undefined) query.append('max_price', String(params.max_price));
    if (params.attribute) query.append('attribute', params.attribute);
    if (params.attribute_term) query.append('attribute_term', String(params.attribute_term));
    if (params.on_sale) query.append('on_sale', 'true');

    try {
      const response = await fetch(`${API_URL}/products?${query}`, {
        headers: { Authorization: getAuthHeader() },
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const products = await response.json() as Product[];
      const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

      return { products, total, totalPages };
    } catch {
      return { products: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length, totalPages: 1 };
    }
  },

  async getProduct(id: number): Promise<Product> {
    if (!API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      const fallback = FALLBACK_PRODUCTS.find((product) => product.id === id);
      if (fallback) return fallback;
      throw new Error('WooCommerce API yapılandırması eksik.');
    }

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        headers: { Authorization: getAuthHeader() },
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    } catch {
      const fallback = FALLBACK_PRODUCTS.find((product) => product.id === id);
      if (fallback) return fallback;
      throw new Error('Ürün yüklenemedi.');
    }
  },

  async getCategories(): Promise<Category[]> {
    if (!API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return FALLBACK_PRODUCTS.flatMap((product) => product.categories).map((category, index) => ({ ...category, count: FALLBACK_PRODUCTS.filter((product) => product.categories.some((item) => item.slug === category.slug)).length, id: category.id || index + 1 }));
    }
    try {
      const response = await fetch(`${API_URL}/products/categories?per_page=100&hide_empty=false`, {
        headers: { Authorization: getAuthHeader() },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    } catch {
      return FALLBACK_PRODUCTS.flatMap((product) => product.categories).filter((category, index, categories) => categories.findIndex((item) => item.slug === category.slug) === index).map((category) => ({ ...category, count: FALLBACK_PRODUCTS.filter((product) => product.categories.some((item) => item.slug === category.slug)).length }));
    }
  },

  async getRelatedProducts(productIds: number[]): Promise<Product[]> {
    if (productIds.length === 0) return [];
    const response = await fetch(`${API_URL}/products?include=${productIds.join(',')}&per_page=12`, {
      headers: { Authorization: getAuthHeader() },
    });
    if (!response.ok) throw new Error('Failed to fetch related products');
    return response.json();
  },

  buildSortParams(sort: SortOption): { orderby?: string; order?: 'asc' | 'desc' } {
    switch (sort) {
      case 'newest':       return { orderby: 'date', order: 'desc' };
      case 'best-selling': return { orderby: 'popularity', order: 'desc' };
      case 'price-low':    return { orderby: 'price', order: 'asc' };
      case 'price-high':   return { orderby: 'price', order: 'desc' };
      default:             return {};
    }
  },
};
