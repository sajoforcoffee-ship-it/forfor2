import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import BestSellers from './components/BestSellers';
import ProductDetail from './components/ProductDetail';
import type { Product } from './components/BestSellers';
import FeaturedProduct from './components/FeaturedProduct';
import CoffeeBlog from './components/CoffeeBlog';
import CoffeeAcademy from './components/CoffeeAcademy';
import StorePage from './components/StorePage';
import ContactPage from './components/ContactPage';
import SocialFeedPage from './components/SocialFeedPage';
import BrewingPage from './components/BrewingPage';
import CartPage from './components/CartPage';
import AccountPage from './components/AccountPage';
import coffeeProducts from './data/coffee-products.json';

type Page = 'home' | 'shop' | 'contact' | 'social' | 'brewing' | 'cart' | 'account';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>(() => window.location.pathname === '/sepet' ? 'cart' : window.location.pathname === '/hesabim' ? 'account' : 'home');
  const [siteVisible, setSiteVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setSiteVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    const handlePopState = () => setPage(window.location.pathname === '/sepet' ? 'cart' : window.location.pathname === '/hesabim' ? 'account' : 'home');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;

  const goHome = () => { window.history.pushState({}, '', '/'); setPage('home'); };
  const goShop = () => { window.history.pushState({}, '', '/magaza'); setPage('shop'); };
  const goContact = () => setPage('contact');
  const goSocial = () => setPage('social');
  const goBrewing = () => setPage('brewing');
  const goCart = () => { window.history.pushState({}, '', '/sepet'); setPage('cart'); };
  const goAccount = (mode?: 'login' | 'signup') => {
    const path = mode ? `/hesabim?mod=${mode}` : '/hesabim';
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
    onNavigateContact: goContact,
    onNavigateSocial: goSocial,
    onNavigateBrewing: goBrewing,
    onNavigateAbout: goContact,
    onNavigateCart: goCart,
    onNavigateAccount: goAccount,
  };

  if (page === 'contact') return <ContactPage {...navProps} />;
  if (page === 'social') return <SocialFeedPage {...navProps} />;
  if (page === 'brewing') return <BrewingPage />;
  if (page === 'cart') return <><Header {...navProps} /><CartPage onShop={goShop} /><Footer /></>;
  if (page === 'account') return <><Header {...navProps} /><AccountPage initialMode={new URLSearchParams(window.location.search).get('mod') === 'signup' ? 'signup' : 'login'} onBack={goShop} /><Footer /></>;
  if (selectedProduct) return <><Header {...navProps} /><ProductDetail product={selectedProduct} onBack={() => { setSelectedProduct(null); setPage('shop'); }} onProductClick={handleCatalogProduct} /><Footer /></>;

  return (
    <div
      style={{
        opacity: siteVisible ? 1 : 0,
        transition: 'opacity 700ms ease',
      }}
    >
      <Header {...navProps} />
      {page === 'shop' ? (
          <StorePage onProductInspect={handleProductInspect} />
      ) : (
        <>
          <HeroSection />
          <BestSellers onShopClick={goShop} onProductClick={handleCatalogProduct} />
          <FeaturedProduct />
          <CoffeeAcademy />
          <CoffeeBlog />
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
