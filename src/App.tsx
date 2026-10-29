import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import BestSellers from './components/BestSellers';
import ProductDetail from './components/ProductDetail';
import type { Product } from './components/BestSellers';
import FeaturedProduct from './components/FeaturedProduct';
import StorePage from './components/StorePage';
import CartPage from './components/CartPage';
import AccountPage from './components/AccountPage';
import coffeeProducts from './data/coffee-products.json';

type Page = 'home' | 'shop' | 'cart' | 'account' | 'not-found';

function pageFromPath(pathname: string): Page {
  if (pathname === '/magaza') return 'shop';
  if (pathname === '/sepet') return 'cart';
  if (['/hesabim', '/giris', '/uye-ol', '/sifremi-unuttum', '/sifre-sifirla'].includes(pathname)) return 'account';
  if (pathname === '/') return 'home';
  return 'not-found';
}

function AppContent() {
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, nextPage: Page) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setPage(nextPage);
  };
  const goHome = () => navigate('/', 'home');
  const goShop = () => navigate('/magaza', 'shop');
  const goCart = () => navigate('/sepet', 'cart');
  const goAccount = (mode?: 'login' | 'signup') => {
    const path = mode === 'signup' ? '/uye-ol' : mode === 'login' ? '/giris' : '/hesabim';
    window.history.pushState({}, '', path);
    setPage('account');
  };

  const handleCatalogProduct = (product: Product) => {
    const catalogProduct = coffeeProducts.find((item) => item.name.toLowerCase() === product.title.toLowerCase());
    setSelectedProduct({
      ...product,
      origin: catalogProduct?.origin || product.origin,
      flavorNotes: catalogProduct?.description || product.flavorNotes,
      roastLevel: catalogProduct?.roast || product.roastLevel,
      image: catalogProduct?.image || product.image,
      description: catalogProduct?.description || product.description,
      tastingNotes: catalogProduct?.tastingNotes || product.tastingNotes,
      brewing: catalogProduct?.brewing || product.brewing,
      category: catalogProduct?.category || product.category,
      productCode: catalogProduct?.code || product.productCode,
      weightGrams: catalogProduct?.weightGrams || product.weightGrams,
      price: catalogProduct?.price || product.price,
      fullOrigin: catalogProduct?.origin || product.fullOrigin,
    });
  };

  const handleProductInspect = (product: import('./services/catalog').Product) => {
    const catalogProduct = coffeeProducts.find((item) => item.name.toLowerCase() === product.name.toLowerCase());
    setSelectedProduct({
      id: product.id,
      title: product.name,
      image: product.images?.[0]?.src || catalogProduct?.image,
      url: product.permalink,
      origin: catalogProduct?.origin || product.categories[0]?.name || 'Specialty Coffee',
      flavorNotes: catalogProduct?.description || product.short_description || product.description,
      roastLevel: catalogProduct?.roast || product.roast || 'Detayları inceleyin',
      accent: '#D7A85C',
      description: catalogProduct?.description || product.description,
      tastingNotes: catalogProduct?.tastingNotes || product.tasting_notes || product.short_description,
      brewing: catalogProduct?.brewing || product.brewing,
      category: catalogProduct?.category || product.categories[0]?.name,
      productCode: catalogProduct?.code,
      weightGrams: catalogProduct?.weightGrams,
      price: catalogProduct?.price,
      fullOrigin: catalogProduct?.origin || product.origin,
    });
  };

  const navProps = {
    onNavigateHome: goHome,
    onNavigateShop: goShop,
    onNavigateCart: goCart,
    onNavigateAccount: goAccount,
  };

  if (page === 'not-found') return <><Header {...navProps} /><main className="container-luxury flex min-h-[55vh] flex-col items-center justify-center px-6 text-center"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--accent)' }}>404</p><h1 className="mb-4 text-4xl md:text-5xl">Sayfa bulunamadı</h1><p className="mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>Aradığınız sayfa mağazada mevcut değil.</p><button type="button" className="btn-primary" onClick={goShop}>Mağazaya git</button></main><Footer /></>;
  if (page === 'cart') return <><Header {...navProps} /><CartPage onShop={goShop} /><Footer /></>;
  if (page === 'account') return <><Header {...navProps} /><AccountPage initialMode={window.location.pathname === '/uye-ol' ? 'signup' : window.location.pathname === '/sifremi-unuttum' ? 'forgot' : window.location.pathname === '/sifre-sifirla' ? 'reset' : 'login'} onBack={goShop} /><Footer /></>;
  if (selectedProduct) return <><Header {...navProps} /><ProductDetail product={selectedProduct} onBack={() => { setSelectedProduct(null); setPage('shop'); }} onProductClick={handleCatalogProduct} /><Footer /></>;

  return (
    <div
      style={{ opacity: 1 }}
    >
      {page !== 'home' && <Header {...navProps} />}
      {page === 'shop' ? (
          <StorePage onProductInspect={handleProductInspect} />
      ) : (
        <>
          <HeroSection onShop={goShop} />
          <BestSellers onShopClick={goShop} onProductClick={handleCatalogProduct} />
          <FeaturedProduct />
        </>
      )}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ThemeProvider>
  );
}
