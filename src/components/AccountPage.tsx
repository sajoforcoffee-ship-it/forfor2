import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AccountPageProps { onBack: () => void; initialMode?: 'login' | 'signup'; }
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
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setStatus('Supabase bağlantısı yapılandırılmamış.'); setBusy(false); return; }
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user);
      if (data.user) {
        const [{ data: profileData }, { data: addressData }] = await Promise.all([
          supabase.from('profiles').select('first_name,last_name,phone').eq('id', data.user.id).maybeSingle(),
          supabase.from('customer_addresses').select('id,label,city,address_1,postcode,is_default_shipping').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        ]);
        if (profileData) setProfile(profileData);
        setAddresses(addressData ?? []);
      }
      setBusy(false);
    }
    load();
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)) ?? { data: { subscription: { unsubscribe() {} } } };
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function submitAuth(event: FormEvent) {
    event.preventDefault(); setStatus('');
    if (!supabase) return;
    setBusy(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      : await supabase.auth.signUp({ email: form.email, password: form.password, options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { first_name: form.first_name, last_name: form.last_name } } });
    setBusy(false);
    if (result.error) { setStatus(authMessage(result.error.message)); return; }
    setStatus(mode === 'signup' ? 'Doğrulama bağlantısı e-posta adresinize gönderildi.' : 'Giriş başarılı.');
    setUser(result.data.user);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); if (!supabase || !user) return; setBusy(true); setStatus('');
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    setBusy(false); setStatus(error ? 'Bilgileriniz güncellenemedi.' : 'Bilgileriniz güncellendi.');
  }

  async function signOut() { await supabase?.auth.signOut(); setUser(null); setStatus('Oturum kapatıldı.'); }

  if (busy && !user && !status) return <main className="account-page"><div className="account-shell"><p>Hesap bilgileriniz yükleniyor...</p></div></main>;
  if (!user) return <main className="account-page"><div className="account-shell auth-card"><button className="account-back" onClick={onBack}>← Mağazaya dön</button><span className="eyebrow">FOR COFFEE HESABIM</span><h1>{mode === 'login' ? 'Tekrar hoş geldiniz.' : 'Hesabınızı oluşturun.'}</h1><p className="account-muted">Siparişlerinizi, adreslerinizi ve favorilerinizi tek yerden yönetin.</p><form onSubmit={submitAuth} className="account-form">{mode === 'signup' && <div className="account-form-grid"><label>Ad<input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></label><label>Soyad<input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></label></div>}<label>E-posta<input type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Şifre<input type="password" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="account-primary" disabled={busy}>{busy ? 'İşleniyor...' : mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</button></form>{status && <p className="account-status">{status}</p>}<button className="account-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}</button></div></main>;

  return <main className="account-page"><div className="account-shell"><div className="account-heading"><div><span className="eyebrow">FOR COFFEE HESABIM</span><h1>Hoş geldiniz{profile.first_name ? `, ${profile.first_name}` : ''}.</h1><p className="account-muted">{user.email} · {user.email_confirmed_at ? 'E-posta doğrulandı' : 'E-posta doğrulaması bekleniyor'}</p></div><button className="account-secondary" onClick={signOut}><LogOut size={16} /> Çıkış yap</button></div><nav className="account-tabs">{([['account','Hesabım',UserRound],['addresses','Adreslerim',MapPin],['orders','Siparişlerim',Package]] as const).map(([key,label,Icon]) => <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}><Icon size={17} />{label}</button>)}</nav>{tab === 'account' && <section className="account-panel"><h2>Hesap bilgileri</h2><form onSubmit={saveProfile} className="account-form"><div className="account-form-grid"><label>Ad<input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} /></label><label>Soyad<input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} /></label></div><label>Telefon<input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></label><label>E-posta<input value={user.email ?? ''} disabled /></label><button className="account-primary" disabled={busy}><LockKeyhole size={16} /> Bilgileri kaydet</button></form></section>}{tab === 'addresses' && <section className="account-panel"><h2>Adres defteri</h2>{addresses.length ? <div className="address-list">{addresses.map(address => <article key={address.id}><strong>{address.label}</strong>{address.is_default_shipping && <span className="address-badge">Varsayılan teslimat</span>}<p>{address.address_1}<br />{address.postcode} {address.city}</p></article>)}</div> : <p className="account-muted">Henüz kayıtlı adresiniz bulunmuyor. Adresleriniz güvenli şekilde hesabınıza bağlandığında burada görünecek.</p>}</section>}{tab === 'orders' && <section className="account-panel"><h2>Siparişlerim</h2><p className="account-muted">Sipariş geçmişiniz, WooCommerce müşteri eşleştirmeniz tamamlandığında güvenli sunucu bağlantısı üzerinden burada listelenecek.</p></section>}{status && <p className="account-status">{status}</p>}</div></main>;
}
