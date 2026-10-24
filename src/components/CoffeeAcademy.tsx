import { ArrowRight, ChevronDown, Play } from 'lucide-react';

// Add the uploaded video URL here when it is ready.
const ACADEMY_VIDEO_URL = 'https://www.forcoffeetr.com/wp-content/uploads/2026/10/akademivid.mp4';
const ACADEMY_VIDEO_POSTER = 'https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/02/ChatGPT-Image-4-Sub-2026-09_20_56.png';

const CoffeeAcademy = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    const body = `Eğitim Bilgi Formu\n\nİsim: ${data.isim} ${data.soyisim}\nEmail: ${data.email}\nTelefon: ${data.telefon}\nEğitim: ${data.egitim}\nNot: ${data.not || '-'}\n\nGönderim: ${new Date().toLocaleString('tr-TR')}`;
    window.location.href = `mailto:info@forcoffeetr.com?subject=Eğitim Bilgi Formu - ${data.isim} ${data.soyisim}&body=${encodeURIComponent(body)}`;
    alert('Email uygulamanız açılıyor. Gönder butonuna tıklayın.');
  };

  return (
    <section className="section-luxury" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Image */}
          <div className="relative w-full max-w-2xl mx-auto lg:mx-0 animate-slideIn opacity-0 [animation-fill-mode:forwards]">
            <div className="overflow-hidden bg-black"
              style={{ borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 16px 48px var(--shadow-strong)' }}>
              {ACADEMY_VIDEO_URL ? (
                <video
                  src={ACADEMY_VIDEO_URL}
                  poster={ACADEMY_VIDEO_POSTER}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  aria-label="Kahve Akademisi tanıtım videosu"
                  className="block w-full h-auto max-h-[70vh] object-contain"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img src={ACADEMY_VIDEO_POSTER} alt="Kahve Akademisi video kapağı" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-black/35 text-white" aria-label="Video bağlantısı bekleniyor">
                      <Play size={24} fill="currentColor" />
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }} />
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-white text-2xl md:text-3xl font-serif font-semibold drop-shadow-lg">Kahve Akademisi</h3>
              <p className="text-xs tracking-widest uppercase mt-1 drop-shadow-lg" style={{ color: 'var(--accent)' }}>For Coffee</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="heading-eyebrow">Ustalık Yolculuğu</span>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>For Coffee Akademi</h2>
              <h3 className="text-lg font-serif" style={{ color: 'var(--text-secondary)' }}>Bilinçli Ustalığa Giden Yol</h3>
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))' }} />
              <div className="space-y-3 text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <p>Barista eğitimleri ile kahvenin temellerini öğrenir, ileri seviye tekniklerle uzmanlaşma yolculuğunuza sağlam bir zemin hazırlarsınız.</p>
                <p>Kavurma eğitimlerimizde çekirdeğin potansiyelini anlayarak, kendi kahvenizi doğru profillerle kavurmayı deneyimlersiniz.</p>
              </div>
              <button className="btn-secondary group">
                Eğitimleri Keşfet
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Form */}
            <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Eğitim Bilgi Formu</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Size en uygun eğitim programını birlikte planlayalım.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="label-luxury">İsim <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <input type="text" name="isim" required placeholder="İsminiz" className="input-luxury" /></div>
                  <div><label className="label-luxury">Soyisim <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <input type="text" name="soyisim" required placeholder="Soyisminiz" className="input-luxury" /></div>
                  <div><label className="label-luxury">E-Posta <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <input type="email" name="email" required placeholder="ornek@email.com" className="input-luxury" /></div>
                  <div><label className="label-luxury">Telefon <span style={{ color: 'var(--accent)' }}>*</span></label>
                    <input type="tel" name="telefon" required placeholder="(5XX) XXX XX XX" className="input-luxury" /></div>
                </div>

                <div>
                  <label className="label-luxury">Eğitim Seçimi <span style={{ color: 'var(--accent)' }}>*</span></label>
                  <div className="relative">
                    <select name="egitim" required className="select-luxury">
                      <option value="">Lütfen bir eğitim seçiniz</option>
                      {['Latte Art Eğitimi','Kavurma Eğitimi','Danışmanlık','Barista Foundation','Barista Professional','Master Barista'].map(o =>
                        <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div><label className="label-luxury">Notunuz</label>
                  <textarea name="not" rows={3} placeholder="Eklemek istediğiniz notlar..." className="input-luxury resize-none" /></div>

                <button type="submit" className="btn-primary w-full group">
                  Bilgi Gönder
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Form gönderildiğinde info@forcoffeetr.com adresine iletilecektir.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoffeeAcademy;
