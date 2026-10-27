import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AccountPageProps { onBack: () => void; initialMode?: 'login' | 'signup' | 'forgot' | 'reset'; }
type Tab = 'account' | 'addresses' | 'orders';

function authMessage(message: string) {
  if (message.includes('Invalid login credentials')) return 'E-posta veya şifre hatalı.';
  if (message.includes('Email not confirmed')) return 'E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.';
  if (message.includes('Password should be')) return 'Şifreniz en az 6 karakter olmalıdır.';
  if (message.includes('rate limit')) return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
  return 'İşlem sırasında beklenmeyen bir hata oluştu.';
}

export default function AccountPage({ onBack, initialMode = 'login' }: AccountPageProps) {
  const [tab, setTab] = useState<Tab>('account');
  const [user, setUser] = useState<Awaited<ReturnType<NonNullable<typeof supabase>['auth']['getUser']>>['data']['user']>(null);
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '' });
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; city: string; address_1: string; postcode: string; is_default_shipping: boolean }>>([]);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', password_confirmation: '', first_name: '', last_name: '' });
  const [status, setStatus] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setMode(initialMode);
    setShowPassword(false);
    setStatus('');
  }, [initialMode]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setAuthError('Supabase bağlantısı yapılandırılmamış.'); setBusy(false); return; }
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 8000)),
        ]);
        if (!active) return;
        if (result.error) throw result.error;
        const session = result.data.session;
        setUser(session?.user ?? null);
        setAuthError('');
      if (session?.user && (initialMode === 'login' || initialMode === 'signup') && window.location.pathname !== '/hesabim') {
        window.history.replaceState({}, '', '/hesabim');
      }
      if (session?.user) {
        const [{ data: profileData }, { data: addressData }] = await Promise.all([
          supabase.from('profiles').select('first_name,last_name,phone').eq('id', session.user.id).maybeSingle(),
          supabase.from('customer_addresses').select('id,label,city,address_1,postcode,is_default_shipping').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        ]);
        if (profileData) setProfile(profileData);
        setAddresses(addressData ?? []);
      }
        setBusy(false);
      } catch (error) {
        if (!active) return;
        setUser(null);
        setAuthError(error instanceof Error && error.message === 'AUTH_TIMEOUT' ? 'Oturum kontrolü zaman aşımına uğradı.' : 'Oturum kontrolü sırasında bağlantı hatası oluştu.');
        setBusy(false);
      }
    }
    load();
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)) ?? { data: { subscription: { unsubscribe() {} } } };
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [initialMode]);

  async function submitAuth(event: FormEvent) {
    event.preventDefault(); setStatus('');
    if (!supabase) { setStatus('Kimlik doğrulama servisine şu anda ulaşılamıyor.'); return; }
    if (mode === 'signup' && form.password !== form.password_confirmation) { setStatus('Şifreler eşleşmiyor.'); return; }
    setBusy(true);
    if (mode === 'reset') {
      const { error } = await supabase.auth.updateUser({ password: form.password });
      setBusy(false);
      setStatus(error ? authMessage(error.message) : 'Şifreniz güncellendi. Giriş yapabilirsiniz.');
      if (!error) setTimeout(() => { window.history.replaceState({}, '', '/giris'); setMode('login'); }, 1200);
      return;
    }
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/sifre-sifirla` });
      setBusy(false);
      setStatus(error ? authMessage(error.message) : 'Şifre yenileme bağlantısı e-posta adresinize gönderildi.');
      return;
    }
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      : await supabase.auth.signUp({ email: form.email, password: form.password, options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { first_name: form.first_name, last_name: form.last_name } } });
    setBusy(false);
    if (result.error) { setStatus(authMessage(result.error.message)); return; }
    if (mode === 'login' && result.data.user) {
      window.history.pushState({}, '', '/hesabim');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    setStatus(mode === 'signup' ? 'Doğrulama bağlantısı e-posta adresinize gönderildi.' : 'Giriş başarılı.');
    setUser(result.data.user);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); if (!supabase || !user) return; setBusy(true); setStatus('');
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    setBusy(false); setStatus(error ? 'Bilgileriniz güncellenemedi.' : 'Bilgileriniz güncellendi.');
  }

  async function signOut() { await supabase?.auth.signOut(); setUser(null); setStatus('Oturum kapatıldı.'); }

  if (busy && !user && !status && !authError) return <main className="account-page"><div className="account-shell"><p>Hesap bilgileriniz yükleniyor...</p></div></main>;
  if (authError) return <main className="account-page"><div className="account-shell auth-card"><h1>Oturum kontrol edilemedi.</h1><p className="account-muted">{authError}</p><button className="account-primary" onClick={() => window.location.reload()}>Tekrar dene</button></div></main>;
  if (!user) return <main className="account-page"><div className="account-shell auth-card"><button className="account-back" onClick={onBack}>← Mağazaya dön</button><span className="eyebrow">FOR COFFEE HESABIM</span><h1>{mode === 'login' ? 'Hesabınıza giriş yapın.' : mode === 'forgot' ? 'Şifrenizi yenileyin.' : mode === 'reset' ? 'Yeni şifrenizi belirleyin.' : 'Hesabınızı oluşturun.'}</h1><p className="account-muted">{mode === 'login' ? 'Siparişlerinizi, adreslerinizi ve favorilerinizi tek yerden yönetin.' : mode === 'forgot' ? 'E-posta adresinizi yazın; güvenli yenileme bağlantısını gönderelim.' : mode === 'reset' ? 'Hesabınız için yeni ve güvenli bir şifre belirleyin.' : 'For Coffee dünyasına katılın; siparişlerinizi, favorilerinizi ve adreslerinizi güvenle yönetin.'}</p>{mode === 'signup' && <div className="account-benefits"><span>Özel kahve seçkilerine erişim</span><span>Sipariş ve adres takibi</span><span>Size özel fırsatlar</span></div>}<form onSubmit={submitAuth} className="account-form">{mode === 'signup' && <div className="account-form-grid"><label>Ad<input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></label><label>Soyad<input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></label></div>}{mode !== 'reset' && <label>E-posta<input type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>}{mode !== 'forgot' && <label>Şifre<span className="account-password-field"><input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><button type="button" aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>}{mode === 'signup' && <label>Şifre tekrar<span className="account-password-field"><input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} /><button type="button" aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>}{mode === 'login' && <button type="button" className="account-forgot" onClick={() => { window.history.pushState({}, '', '/sifremi-unuttum'); setMode('forgot'); setStatus(''); }}>Şifremi unuttum</button>}<button className="account-primary" disabled={busy}>{busy ? 'İşleniyor...' : mode === 'login' ? 'Giriş yap' : mode === 'forgot' ? 'Yenileme bağlantısı gönder' : mode === 'reset' ? 'Şifreyi güncelle' : 'Kayıt ol'}</button></form>{status && <p className="account-status">{status}</p>}<button className="account-switch" onClick={() => { const nextMode = mode === 'login' ? 'signup' : 'login'; window.history.pushState({}, '', nextMode === 'signup' ? '/uye-ol' : '/giris'); setMode(nextMode); setStatus(''); }}>{mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}</button></div></main>;

  return <main className="account-page"><div className="account-shell"><div className="account-heading"><div><span className="eyebrow">FOR COFFEE HESABIM</span><h1>Hoş geldiniz{profile.first_name ? `, ${profile.first_name}` : ''}.</h1><p className="account-muted">{user.email} · {user.email_confirmed_at ? 'E-posta doğrulandı' : 'E-posta doğrulaması bekleniyor'}</p></div><button className="account-secondary" onClick={signOut}><LogOut size={16} /> Çıkış yap</button></div><nav className="account-tabs">{([['account','Hesabım',UserRound],['addresses','Adreslerim',MapPin],['orders','Siparişlerim',Package]] as const).map(([key,label,Icon]) => <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}><Icon size={17} />{label}</button>)}</nav>{tab === 'account' && <section className="account-panel"><h2>Hesap bilgileri</h2><form onSubmit={saveProfile} className="account-form"><div className="account-form-grid"><label>Ad<input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} /></label><label>Soyad<input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} /></label></div><label>Telefon<input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></label><label>E-posta<input value={user.email ?? ''} disabled /></label><button className="account-primary" disabled={busy}><LockKeyhole size={16} /> Bilgileri kaydet</button></form></section>}{tab === 'addresses' && <section className="account-panel"><h2>Adres defteri</h2>{addresses.length ? <div className="address-list">{addresses.map(address => <article key={address.id}><strong>{address.label}</strong>{address.is_default_shipping && <span className="address-badge">Varsayılan teslimat</span>}<p>{address.address_1}<br />{address.postcode} {address.city}</p></article>)}</div> : <p className="account-muted">Henüz kayıtlı adresiniz bulunmuyor. Adresleriniz güvenli şekilde hesabınıza bağlandığında burada görünecek.</p>}</section>}{tab === 'orders' && <section className="account-panel"><h2>Siparişlerim</h2><p className="account-muted">Sipariş geçmişiniz, WooCommerce müşteri eşleştirmeniz tamamlandığında güvenli sunucu bağlantısı üzerinden burada listelenecek.</p></section>}{status && <p className="account-status">{status}</p>}</div></main>;
}
