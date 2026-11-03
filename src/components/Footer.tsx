import { Instagram, Youtube, Linkedin, ArrowRight, Gem } from 'lucide-react';
const Footer = () => {
  const columns = [
    {
      title: 'Kahvelerimiz',
      links: [
        ['Single Origin', 'https://www.forcoffeetr.com/magaza/kategori/single-origin/'],
        ['Espresso Blend', 'https://www.forcoffeetr.com/magaza/kategori/espresso-blend/'],
        ['Filtre Kahveler', 'https://www.forcoffeetr.com/magaza/kategori/filtre-kahveler/'],
        ['Türk Kahvesi', 'https://www.forcoffeetr.com/magaza/urun/turkish-coffee/'],
      ],
    },
    {
      title: 'Mağaza Desteği',
      links: [
        ['Sık Sorulan Sorular', 'https://www.forcoffeetr.com/sss.html'],
        ['Kargo Takibi', 'https://www.forcoffeetr.com/magaza/kargo-takibi/'],
        ['İade Politikası', 'https://www.forcoffeetr.com/magaza/iade-politikasi/'],
        ['Gizlilik Politikası', 'https://www.forcoffeetr.com/magaza/kvkk-aydinlatma-metni/'],
      ],
    },
    {
      title: 'Hızlı Erişim',
      links: [
        ['Tüm Kahveler', '/magaza'],
        ['Hesabım', '/hesabim'],
        ['Sepetim', '/sepet'],
        ['İletişim', '/iletisim'],
      ],
    },
    {
      title: 'Destek',
      links: [
        ['Sık Sorulan Sorular', 'https://www.forcoffeetr.com/sss.html'],
        ['Kargo Takibi', 'https://www.forcoffeetr.com/magaza/kargo-takibi/'],
        ['İade Politikası', 'https://www.forcoffeetr.com/magaza/iade-politikasi/'],
        ['Gizlilik Politikası', 'https://www.forcoffeetr.com/magaza/kvkk-aydinlatma-metni/'],
      ],
    },
  ];

  const socials = [
    { icon: Instagram, href: 'https://instagram.com/forcoffeetrr', label: 'Instagram' },
    { icon: Youtube,   href: '#', label: 'YouTube' },
    { icon: Linkedin,  href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer style={{
      backgroundColor: '#101827',
      backgroundImage: `linear-gradient(rgba(8,14,25,.84), rgba(8,14,25,.9)), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000c944820ab4cde19e6eec4d41-PMfa3xLXuE6QzKjLWl4quMzAxZB6QF.png')`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      borderTop: '1px solid rgba(198,164,106,.28)'
    }}>
      <div className="container-luxury py-10 md:py-12">

        {/* Newsletter */}
        <div className="text-center mb-10 pb-10" style={{ borderBottom: '1px solid var(--footer-border)' }}>
          <div className="inline-flex items-center gap-2 mb-4">
            <Gem size={16} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--accent)' }}>Özel Erişim</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-3" style={{ color: '#D6B779' }}>
            Premium Üyelik
          </h2>
          <p className="text-sm max-w-md mx-auto mb-8" style={{ color: '#D8D6D0' }}>
            Yeni kavurumlar, ürün lansmanları ve mağaza kampanyalarından ilk siz haberdar olun.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="E-posta adresiniz"
              className="flex-1 px-5 py-3.5 text-sm outline-none transition-all duration-300"
              style={{ borderRadius: '14px', backgroundColor: 'rgba(10,17,29,.72)', border: '1px solid rgba(198,164,106,.42)', color: '#F2EDE3' }} />
            <button type="submit" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold transition-all duration-300 group"
              style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #D6B779, #A77D3B)', color: '#101827' }}>
              Katıl
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {columns.map(col => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#D6B779' }}>
                {col.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition-colors duration-200"
                      style={{ color: '#D8D6D0' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--footer-text)')}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-4 py-6" style={{ borderTop: '1px solid var(--footer-border)', borderBottom: '1px solid var(--footer-border)' }}>
          {socials.map(({ icon: Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300"
              style={{ border: `1px solid ${'rgba(214,183,121,.34)'}`, color: '#F2EDE3' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(16,29,56,0.12)'; e.currentTarget.style.color = 'var(--footer-text)'; }}>
              <Icon size={18} strokeWidth={1.5} />
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#D8D6D0' }}>
            © 2026 FOR COFFEE Specialty Coffee
          </p>
          <div className="flex items-center gap-3">
            {['VISA', 'MC', 'TROY', 'Apple Pay'].map(c => (
              <span key={c} className="px-3 py-1.5 rounded-luxury text-[10px] font-bold"
                style={{ border: `1px solid ${'rgba(214,183,121,.34)'}`, color: '#F2EDE3', backgroundColor: 'var(--footer-surface)' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
