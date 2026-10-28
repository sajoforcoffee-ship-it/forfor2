import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, UserRound, UserRoundPlus, LogIn, Heart, Search, ArrowRight, Package, MapPin, Settings, LogOut } from 'lucide-react';
import { useStore } from '../context/useStore';
import { supabase } from '../services/supabase';

interface HeaderProps {
  onNavigateHome?: () => void;
  onNavigateShop?: () => void;
  onNavigateCart?: () => void;
  onNavigateAccount?: (mode?: 'login' | 'signup') => void;
}

const Header = ({ onNavigateHome, onNavigateShop, onNavigateCart, onNavigateAccount }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const theme = 'dark';
  const { cartCount, cart, cartTotal, removeFromCart, updateQuantity, favorites } = useStore();
  const [user, setUser] = useState<{ email?: string | null; user_metadata?: { first_name?: string; last_name?: string } } | null>(null);

  const transition = 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)';

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setAccountOpen(false); setCartOpen(false); setMobileOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navItems = [
    { label: 'Ana Sayfa', cb: onNavigateHome },
    { label: 'Tüm Kahveler', cb: onNavigateShop },
    { label: 'Single Origin', cb: onNavigateShop },
    { label: 'Harmanlar', cb: onNavigateShop },
    { label: 'Espresso', cb: onNavigateShop },
    { label: 'Filtre Kahveler', cb: onNavigateShop },
    { label: 'Kampanyalar', cb: onNavigateShop },
  ];

  const textColor = scrolled
    ? (theme === 'dark' ? '#F5F2EB' : '#1A1A1A')
    : (theme === 'dark' ? '#F5F2EB' : '#1A1A1A');
  const iconColor = textColor;
  const accentColor = 'var(--accent)';

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          height: scrolled ? '72px' : '85px',
          backgroundColor: scrolled
            ? (theme === 'dark' ? 'rgba(18,22,32,0.92)' : 'rgba(255,255,255,0.92)')
            : (theme === 'dark' ? 'rgba(11,15,25,0.40)' : 'rgba(255,255,255,0.55)'),
          backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${scrolled
            ? 'rgba(143,169,139,0.20)'
            : (theme === 'dark' ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)')}`,
          boxShadow: scrolled ? `0 12px 40px ${theme === 'dark' ? 'rgba(0,0,0,.28)' : 'rgba(0,0,0,.08)'}` : 'none',
          transition,
        }}
      >
        {/* Main bar */}
        <div className="container-luxury flex items-center justify-between h-full">

          {/* Left — logo + nav */}
          <div className="flex items-center gap-10">
            <button
              onClick={onNavigateHome}
              className="flex-shrink-0 hover:opacity-80 transition-opacity duration-300"
              style={{ transition }}
            >
              <img
                src="https://www.forcoffeetr.com/wp-content/uploads/2026/10/logoforcoffee.png"
                alt="FOR COFFEE"
                style={{
                  height: scrolled ? '63px' : '75px',
                  transition,
                  filter: scrolled ? 'drop-shadow(0 0 10px rgba(143,169,139,0.18))' : 'none',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </button>
            <div className="hidden lg:flex items-center gap-10">
              {navItems.map(item => (
                <button
                  key={item.label}
                  onClick={item.cb}
                  className="relative text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 group"
                  style={{ color: textColor }}
                  onMouseEnter={e => { e.currentTarget.style.color = accentColor; }}
                  onMouseLeave={e => { e.currentTarget.style.color = textColor; }}
                >
                  {item.label}
                  <span
                    className="absolute -bottom-1 left-1/2 w-0 h-px transition-all duration-300 group-hover:w-full"
                    style={{ left: '50%', transform: 'translateX(-50%)', background: accentColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right — icons */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => { setSearchOpen(true); setAccountOpen(false); setCartOpen(false); }}
              className="w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ color: iconColor }}
              onMouseEnter={e => { e.currentTarget.style.color = accentColor; }}
              onMouseLeave={e => { e.currentTarget.style.color = iconColor; }}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <div className="relative hidden md:block">
              <button
                onClick={() => { if (onNavigateAccount) { onNavigateAccount(); setAccountOpen(false); } else setAccountOpen(!accountOpen); setSearchOpen(false); setCartOpen(false); }}
                className="w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ color: iconColor }}
                onMouseEnter={e => { e.currentTarget.style.color = accentColor; }}
                onMouseLeave={e => { e.currentTarget.style.color = iconColor; }}
              >
                <User size={18} strokeWidth={1.5} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 p-6 z-50"
                  style={{
                    borderRadius: '24px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 24px 60px var(--shadow-strong)',
                    animation: 'fadeInUp 0.3s ease-out forwards'
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--accent)' }}>Hoş Geldiniz</p>
                  <p className="font-serif text-lg mb-5" style={{ color: 'var(--text-primary)' }}>For Coffee</p>
                  <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
                  <div className="space-y-1">
                    {[
                      { icon: User, label: 'Giriş yap', mode: 'login' as const },
                      { icon: User, label: 'Üye ol', mode: 'signup' as const },
                      { icon: Package, label: 'Siparişlerim' },
                      { icon: Heart, label: 'Favorilerim' },
                      { icon: MapPin, label: 'Adreslerim' },
                      { icon: Settings, label: 'Hesap Ayarları' },
                    ].map(({ icon: Icon, label, mode }) => (
                      <a
                        key={label}
                        href={mode === 'signup' ? '/uye-ol' : '/giris'}
                        onClick={(event) => { event.preventDefault(); onNavigateAccount?.(mode); setAccountOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200"
                        style={{ color: 'var(--text-secondary)', borderRadius: '12px' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'rgba(143,169,139,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Icon size={15} strokeWidth={1.5} />
                        {label}
                      </a>
                    ))}
                    <div className="h-px my-3" style={{ backgroundColor: 'var(--border)' }} />
                    <a
                      href="https://www.forcoffeetr.com/magaza/hesabim/cikis"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200"
                      style={{ color: 'var(--text-secondary)', borderRadius: '12px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <LogOut size={15} strokeWidth={1.5} />
                      Çıkış Yap
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
href="/hesabim" onClick={(event) => { event.preventDefault(); onNavigateAccount?.(); }}
              className="relative hidden md:flex w-9 h-9 items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ color: iconColor }}
              onMouseEnter={e => { e.currentTarget.style.color = accentColor; }}
              onMouseLeave={e => { e.currentTarget.style.color = iconColor; }}
            >
              <Heart size={18} strokeWidth={1.5} />
              {favorites.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {favorites.length}
                </span>
              )}
            </a>

            <button
              onClick={() => { setCartOpen(!cartOpen); setSearchOpen(false); setAccountOpen(false); }}
              className="relative w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ color: iconColor }}
              onMouseEnter={e => { e.currentTarget.style.color = accentColor; }}
              onMouseLeave={e => { e.currentTarget.style.color = iconColor; }}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center"
              style={{ color: iconColor }}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl mt-24 mx-4 p-8"
            style={{ borderRadius: '32px', backgroundColor: 'var(--surface)', boxShadow: '0 24px 60px var(--shadow-strong)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search size={20} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Kahve ara..."
                autoFocus
                className="flex-1 bg-transparent outline-none text-lg font-light"
                style={{ color: 'var(--text-primary)' }}
              />
              <button onClick={() => setSearchOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Önerilen Kahveler</p>
              <div className="grid grid-cols-2 gap-3">
                {['Guatemala Antigua', 'Kenya AA', 'Costa Rica Tarrazu', 'Peru Papagoya'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setSearchOpen(false); onNavigateShop?.(); }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-left transition-all duration-200"
                    style={{ borderRadius: '14px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <Search size={13} strokeWidth={1.5} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Popüler Kategoriler</p>
              <div className="flex flex-wrap gap-2">
                {['Single Origin', 'Espresso Blend', 'Filtre Kahve', 'Türk Kahvesi', 'Ekipmanlar'].map(c => (
                  <button
                    key={c}
                    onClick={() => { setSearchOpen(false); onNavigateShop?.(); }}
                    className="px-4 py-2 text-xs font-medium transition-all duration-200"
                    style={{ borderRadius: '999px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[60] flex justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full flex flex-col"
            style={{ backgroundColor: 'var(--surface)', boxShadow: '-24px 0 60px var(--shadow-strong)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-lg font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>
                Sepetim {cartCount > 0 && <span style={{ color: 'var(--text-muted)' }}>({cartCount})</span>}
              </h2>
              <button onClick={() => setCartOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <ShoppingBag size={28} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="font-serif text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Sepetiniz boş</p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Özel kahve koleksiyonumuzu keşfedin.</p>
                <button
                  onClick={() => { setCartOpen(false); onNavigateShop?.(); }}
                  className="btn-primary group"
                >
                  Mağazaya Git
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.map(item => (
                    <div key={item.key} className="flex gap-3 p-3" style={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
                      <div className="flex-shrink-0 w-16 h-20 overflow-hidden" style={{ borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h4 className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.weight} · {item.grind}</p>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-sm"
                              style={{ borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            >−</button>
                            <span className="w-8 text-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-sm"
                              style={{ borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            >+</button>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.price * item.quantity}₺</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="self-start p-1"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Ürünü kaldır"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toplam</span>
                    <span className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{cartTotal}₺</span>
                  </div>
                  <a
href="#sepet"
    onClick={(event) => { event.preventDefault(); setCartOpen(false); onNavigateCart?.(); }}
                    className="btn-primary w-full"
                  >
Sepete git
  <ArrowRight size={16} />
  </a>
  <button type="button" className="cart-continue" onClick={() => { setCartOpen(false); onNavigateShop?.(); }}>Alışverişe devam et</button>
  </div>
  </>
  )}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          data-mobile-menu-version="premium-v2"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 h-full w-[88vw] max-w-sm overflow-y-auto p-6 sm:p-8"
            style={{ backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <img src="https://www.forcoffeetr.com/wp-content/uploads/2026/10/logoforcoffee.png" alt="FOR COFFEE" className="mobile-drawer-logo" />
              <button type="button" onClick={() => setMobileOpen(false)} className="mobile-drawer-close" aria-label="Menüyü kapat"><X size={22} strokeWidth={1.5} /></button>
            </div>
            <nav className="mobile-primary-nav">
              {[
                { label: 'Ana Sayfa', cb: onNavigateHome },
                { label: 'Tüm Kahveler', cb: onNavigateShop },
                { label: 'Single Origin', cb: onNavigateShop },
                { label: 'Harmanlar', cb: onNavigateShop },
                { label: 'Espresso', cb: onNavigateShop },
                { label: 'Filtre Kahveler', cb: onNavigateShop },
                { label: 'Kampanyalar', cb: onNavigateShop },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.cb?.(); setMobileOpen(false); }}
                  className="mobile-primary-link font-serif transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d7a85c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => { onNavigateShop?.(); setMobileOpen(false); }}
                className="mobile-primary-link font-serif transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#d7a85c'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)' }
              >
                Mağaza
              </button>
            </nav>
            <div className="mt-8 border-t border-[var(--border)] pt-5">
              {user ? (
                <>
                  <div className="mb-3 flex items-center gap-3 rounded-xl px-2 py-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]" style={{ color: 'var(--accent)' }}>
                      <User size={18} strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {user.user_metadata?.first_name || user.email || 'Hesabım'}
                      </p>
                      <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button type="button" onClick={() => { onNavigateAccount?.(); setMobileOpen(false); }} className="mobile-account-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      <UserRound size={18} strokeWidth={1.5} /> Hesabım
                    </button>
                    <button type="button" onClick={() => { onNavigateAccount?.(); setMobileOpen(false); }} className="mobile-account-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      <Heart size={18} strokeWidth={1.5} /> Favorilerim
                    </button>
                    <button type="button" onClick={() => { onNavigateCart?.(); setMobileOpen(false); }} className="mobile-account-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      <ShoppingBag size={18} strokeWidth={1.5} /> Sepet{cartCount > 0 ? ` (${cartCount})` : ''}
                    </button>
                    <button type="button" onClick={async () => { await supabase?.auth.signOut(); setMobileOpen(false); }} className="mobile-account-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      <LogOut size={16} strokeWidth={1.5} /> Çıkış yap
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <button type="button" onClick={() => { onNavigateAccount?.('login'); setMobileOpen(false); }} className="mobile-account-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <LogIn size={19} strokeWidth={1.5} /> Giriş yap
                  </button>
                  <button type="button" onClick={() => { onNavigateAccount?.('signup'); setMobileOpen(false); }} className="mobile-account-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <UserRoundPlus size={19} strokeWidth={1.5} /> Üye ol
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
