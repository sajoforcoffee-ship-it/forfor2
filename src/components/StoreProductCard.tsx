
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { Product } from '../services/catalog';
import { useStore } from '../context/useStore';
import coffeeProducts from '../data/coffee-products.json';

function getAttribute(product: Product, name: string): string | undefined {
  const attr = product.attributes.find(a =>
    a.name.toLowerCase().includes(name.toLowerCase())
  );
  return attr?.options?.[0];
}

interface StoreProductCardProps {
  product: Product;
  onInspect: (product: Product) => void;
}

export default function StoreProductCard({ product, onInspect }: StoreProductCardProps) {
  const { toggleFavorite, isFavorite } = useStore();

  const origin = getAttribute(product, 'menşe') || getAttribute(product, 'köken') || getAttribute(product, 'origin');
  const roastLevel = getAttribute(product, 'kavrum') || getAttribute(product, 'roast');
  const flavorNotes = getAttribute(product, 'aroma') || getAttribute(product, 'tadım') || getAttribute(product, 'flavor');

  const catalogProduct = coffeeProducts.find(item => item.name === product.name);
  const image = catalogProduct?.image || product.images?.[0]?.src || '';
  const imageAlt = product.images?.[0]?.alt || product.name;
  const catalogOrigin = catalogProduct?.origin || origin;
  const catalogRoast = catalogProduct?.roast || roastLevel;
  const catalogNotes = catalogProduct?.tastingNotes
    ?.split('\n')[0]
    ?.replace(/^Tat Notaları:\s*/i, '')
    ?.trim();

  const fav = isFavorite(product.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      productId: product.id,
      name: product.name,
      image,
      permalink: product.permalink,
    });
  };

  return (
    <article
      className="store-product-card group flex flex-col h-full"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 12px 32px var(--shadow)',
        transition: 'border-color 300ms ease, box-shadow 300ms ease, transform 300ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = '';
      }}
    >
      {/* Image */}
      <div role="button" tabIndex={0} className="relative block w-full overflow-hidden text-left" style={{ aspectRatio: '4/5', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => onInspect(product)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onInspect(product); }} aria-label={`${product.name} detayını aç`}>
        {image ? (
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ transition: 'transform 500ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <ShoppingBag size={32} strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.on_sale && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1"
              style={{ backgroundColor: 'var(--accent)', color: '#101827', borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)' }}>
              İndirim
            </span>
          )}

        </div>

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          aria-label={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center"
          style={{
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            transition: 'transform 200ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            fill={fav ? 'var(--accent)' : 'none'}
            style={{ color: fav ? 'var(--accent)' : 'var(--text-secondary)' }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category badge */}
        {product.categories.length > 0 && (
          <span className="text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {product.categories[0].name}
          </span>
        )}

        {/* Name */}
        <h3 className="font-serif text-base font-semibold leading-snug mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </h3>

        {/* Attributes */}
        <div className="space-y-1 mb-3">
          {catalogOrigin && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Menşei:</span> {catalogOrigin}
            </p>
          )}
          {catalogRoast && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kavrum:</span> {catalogRoast}
            </p>
          )}
          {(catalogNotes || flavorNotes) && (
            <p className="text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Aroma:</span> {catalogNotes || flavorNotes}
            </p>
          )}
        </div>

        {/* Product detail link */}
        <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => onInspect(product)}
            aria-label={`${product.name} ürününü incele`}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-hover)]"
            style={{
              borderRadius: '999px',
              backgroundColor: 'var(--accent)',
              color: '#101827',
              border: '1px solid var(--border)',
              textDecoration: 'none',
            }}
          >
            Ürünü İncele <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
