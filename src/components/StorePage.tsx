import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search, SlidersHorizontal, X, ChevronDown, AlertCircle,
  RefreshCw, ShoppingBag, Heart, ArrowRight, ArrowLeft,
} from 'lucide-react';
import {
  catalogAPI, Product, Category, SortOption,
} from '../services/catalog';
import { useStore } from '../context/useStore';
import StoreProductCard from './StoreProductCard';

const CATEGORY_MAP: Record<string, string> = {
  'all': 'Tüm Kahveler',
  'single-origin': 'Single Origin',
  'blend': 'Harmanlar',
  'espresso': 'Espresso',
  'filtre': 'Filtre Kahve',
  'turk-kahvesi': 'Türk Kahvesi',
  'moka-pot': 'Moka Pot',
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default',       label: 'Önerilen' },
  { value: 'newest',        label: 'Yeni Gelenler' },
  { value: 'best-selling',  label: 'Çok Satanlar' },
  { value: 'price-low',     label: 'Fiyat: Düşük → Yüksek' },
  { value: 'price-high',    label: 'Fiyat: Yüksek → Düşük' },
];

function SkeletonCard() {
  return (
    <div className="flex flex-col" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="w-full" style={{ aspectRatio: '4/5', backgroundColor: 'var(--bg-secondary)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', width: '40%' }} />
        <div className="h-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', width: '80%' }} />
        <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', width: '60%' }} />
        <div className="h-9 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', marginTop: '12px' }} />
      </div>
    </div>
  );
}

interface StorePageProps {
  onProductInspect: (product: Product) => void;
}

export default function StorePage({ onProductInspect }: StorePageProps) {
  const { cartCount, cartTotal, favorites } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [sort, setSort] = useState<SortOption>('default');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const restoringHistoryState = useRef(false);

  const applyUrlFilters = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    restoringHistoryState.current = true;
    setSearch(params.get('q') ?? '');
    setActiveCategorySlug(params.get('kategori') ?? 'all');
    setSort((params.get('sirala') as SortOption) || 'default');
    setMinPrice(params.has('min') ? Number(params.get('min')) : undefined);
    setMaxPrice(params.has('max') ? Number(params.get('max')) : undefined);
    setOnSaleOnly(params.get('indirim') === '1');
    const requestedPage = Number(params.get('sayfa'));
    setPage(Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  }, []);

  useEffect(() => {
    applyUrlFilters();
    window.addEventListener('popstate', applyUrlFilters);
    return () => window.removeEventListener('popstate', applyUrlFilters);
  }, [applyUrlFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (activeCategorySlug !== 'all') params.set('kategori', activeCategorySlug);
    if (sort !== 'default') params.set('sirala', sort);
    if (minPrice !== undefined) params.set('min', String(minPrice));
    if (maxPrice !== undefined) params.set('max', String(maxPrice));
    if (onSaleOnly) params.set('indirim', '1');
    if (page > 1) params.set('sayfa', String(page));
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      if (restoringHistoryState.current) {
        window.history.replaceState({}, '', nextUrl);
        restoringHistoryState.current = false;
      } else {
        window.history.pushState({}, '', nextUrl);
      }
    }
  }, [search, activeCategorySlug, sort, minPrice, maxPrice, onSaleOnly, page]);

  const activeCategoryId = useMemo(() => {
    if (activeCategorySlug === 'all') return undefined;
    const cat = categories.find(c => c.slug === activeCategorySlug);
    return cat?.id;
  }, [activeCategorySlug, categories]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const sortParams = catalogAPI.buildSortParams(sort);
      const { products: data, total: t, totalPages: tp } = await catalogAPI.getProducts({
        per_page: 12,
        page,
        search: search || undefined,
        category: activeCategoryId,
        min_price: minPrice,
        max_price: maxPrice,
        on_sale: onSaleOnly || undefined,
        ...sortParams,
      });
      setProducts(data);
      setTotal(t);
      setTotalPages(tp);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategoryId, sort, minPrice, maxPrice, onSaleOnly]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await catalogAPI.getCategories();
        setCategories(cats);
      } catch { /* categories are optional */ }
    };
    fetchCats();
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, activeCategorySlug, sort, minPrice, maxPrice, onSaleOnly]);

  const handleSearch = (val: string) => setSearch(val);

  const resetFilters = () => {
    setSearch('');
    setActiveCategorySlug('all');
    setSort('default');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setOnSaleOnly(false);
    setPage(1);
  };

  const hasActiveFilters = search || activeCategorySlug !== 'all' || minPrice !== undefined || maxPrice !== undefined || onSaleOnly;

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
          Arama
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm outline-none transition-all"
            style={{
              borderRadius: '8px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

      {/* Categories */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>
          Kategoriler
        </label>
        <div className="space-y-0.5">
          <button
            onClick={() => setActiveCategorySlug('all')}
            className="w-full text-left px-3 py-2 text-sm transition-all flex items-center justify-between"
            style={{
              borderRadius: '6px',
              backgroundColor: activeCategorySlug === 'all' ? 'var(--accent)' : 'transparent',
              color: activeCategorySlug === 'all' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <span>Tüm Kahveler</span>
            <span className="text-xs opacity-70">{total}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className="w-full text-left px-3 py-2 text-sm transition-all flex items-center justify-between"
              style={{
                borderRadius: '6px',
                backgroundColor: activeCategorySlug === cat.slug ? 'var(--accent)' : 'transparent',
                color: activeCategorySlug === cat.slug ? '#fff' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                if (activeCategorySlug !== cat.slug) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={e => {
                if (activeCategorySlug !== cat.slug) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>{cat.name}</span>
              <span className="text-xs opacity-70">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

      {/* Price filter */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>
          Fiyat Aralığı (₺)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice ?? ''}
            onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm outline-none"
            style={{
              borderRadius: '8px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ''}
            onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm outline-none"
            style={{
              borderRadius: '8px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* On sale */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={onSaleOnly}
          onChange={e => setOnSaleOnly(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: 'var(--accent)' }}
        />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sadece İndirimliler</span>
      </label>

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
          style={{
            borderRadius: '8px',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* ── Store Hero ── */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-luxury">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] block mb-4" style={{ color: 'var(--accent)' }}>
              SPECIALTY COFFEE
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-4" style={{ color: 'var(--text-primary)' }}>
              Daha İyi Bir<br />Kahve Dünyası.
            </h1>
            <p className="text-base md:text-lg max-w-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Dünyanın seçkin çiftliklerinden özenle tedarik edilen, her gün taze kavrulmuş specialty coffee çekirdekleri ve premium demleme ekipmanları.
            </p>
            <a
              href="https://www.forcoffeetr.com/magaza/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all"
              style={{
                borderRadius: '8px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--surface)',
              }}
            >
              Koleksiyonu Keşfet
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Category Pills ── */}
      <section className="py-6 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-luxury">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {Object.entries(CATEGORY_MAP).map(([slug, label]) => (
              <button
                key={slug}
                onClick={() => setActiveCategorySlug(slug)}
                className="flex-shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                style={{
                  borderRadius: '999px',
                  border: `1px solid ${activeCategorySlug === slug ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: activeCategorySlug === slug ? 'var(--accent)' : 'transparent',
                  color: activeCategorySlug === slug ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-8 md:py-12 px-4">
        <div className="container-luxury">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal size={15} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Filtreler</span>
                </div>
                {filterContent}
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activeCategorySlug === 'all' ? 'Tüm Ürünler' : CATEGORY_MAP[activeCategorySlug] || 'Ürünler'}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {loading ? 'Yükleniyor...' : `${total} ürün`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <SlidersHorizontal size={14} />
                    Filtre
                  </button>

                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as SortOption)}
                      className="appearance-none pl-4 pr-9 py-2 text-xs font-semibold uppercase tracking-wider outline-none cursor-pointer"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              {/* States */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <AlertCircle size={40} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                  <p className="font-serif text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Ürünler yüklenemedi</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Bağlantı ile ilgili bir sorun oluştu.</p>
                  <button
                    onClick={fetchProducts}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <RefreshCw size={14} /> Tekrar Dene
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <ShoppingBag size={40} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                  <p className="font-serif text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Ürün bulunamadı</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Farklı filtreler deneyin.</p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{ borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {products.map(product => (
                      <StoreProductCard key={product.id} product={product} onInspect={onProductInspect} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-9 h-9 flex items-center justify-center transition-all"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          color: page === 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
                          cursor: page === 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowLeft size={15} />
                      </button>
                      {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className="w-9 h-9 flex items-center justify-center text-sm font-medium transition-all"
                            style={{
                              borderRadius: '8px',
                              border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border)'}`,
                              backgroundColor: page === p ? 'var(--accent)' : 'transparent',
                              color: page === p ? '#fff' : 'var(--text-primary)',
                            }}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-9 h-9 flex items-center justify-center transition-all"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          color: page === totalPages ? 'var(--text-disabled)' : 'var(--text-primary)',
                          cursor: page === totalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '20px 20px 0 0',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Filtreler</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center"
                style={{ borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}
              >
                <X size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            {filterContent}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-6 py-3 text-sm font-semibold uppercase tracking-wider"
              style={{
                borderRadius: '8px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--surface)',
              }}
            >
              {total} Ürünü Göster
            </button>
          </div>
        </div>
      )}

      {/* Quick cart/favorites summary bar (mobile) */}
      {(cartCount > 0 || favorites.length > 0) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:hidden z-40 flex gap-2">
          <a
            href="https://www.forcoffeetr.com/magaza/sepet/"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            style={{ borderRadius: '999px', backgroundColor: 'var(--text-primary)', color: 'var(--surface)', boxShadow: '0 4px 16px var(--shadow-strong)' }}
          >
            <ShoppingBag size={14} /> {cartCount} · {cartTotal}₺
          </a>
          <a
            href="https://www.forcoffeetr.com/magaza/hesabim/favoriler/"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            style={{ borderRadius: '999px', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: '0 4px 16px var(--shadow)' }}
          >
            <Heart size={14} /> {favorites.length}
          </a>
        </div>
      )}
    </div>
  );
}
