import { Droplets, Zap, Wind, FlaskConical, Flame, Beaker } from 'lucide-react';

const methods = [
  { icon: Droplets,     name: 'Pour Over',    desc: 'Narin ve temiz fincan profili için ideal. Su sıcaklığı 92-96°C, öğütme orta-ince.', time: '3-4 dk',  ratio: '1:16' },
  { icon: Zap,          name: 'Espresso',      desc: 'Yoğun ve konsantre. Yüksek basınçla kısa sürede ekstraksiyon. Öğütme çok ince.',     time: '25-30 sn', ratio: '1:2'  },
  { icon: Wind,         name: 'Aeropress',     desc: 'Esnek ve hızlı. Farklı profiller elde etmek için ideal. Öğütme orta.',                time: '1-2 dk',  ratio: '1:15' },
  { icon: FlaskConical, name: 'French Press',  desc: 'Dolu gövde ve yoğun aromalar. Tam ekstraksiyon için ideal. Öğütme kaba.',             time: '4 dk',    ratio: '1:15' },
  { icon: Flame,        name: 'Moka Pot',      desc: 'Espresso benzeri yoğunluk. Ateş üzerinde basınçla demleme. Öğütme ince.',             time: '5 dk',    ratio: '1:10' },
  { icon: Beaker,       name: 'Chemex',        desc: 'Kristal berraklıkta fincan. Kalın filtre ile yağları tutar. Öğütme orta-kaba.',       time: '4-5 dk',  ratio: '1:17' },
];

export default function BrewingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      <div className="pt-8 lg:pt-12">
        <div className="container-luxury py-12 lg:py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px" style={{ background: 'var(--accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--accent)' }}>Demleme Rehberi</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-serif font-light mb-6 text-balance leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
            Mükemmel demleme sanatı
          </h1>

          <p className="text-base lg:text-lg max-w-2xl leading-relaxed font-light mb-12" style={{ color: 'var(--text-secondary)' }}>
            Her demleme yöntemi, kahvenin farklı yönlerini öne çıkarır. Doğru yöntem, doğru
            öğütme ve doğru su sıcaklığı ile kahvenizin potansiyelini keşfedin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {methods.map(method => {
              const Icon = method.icon;
              return (
                <div key={method.name} className="card-luxury group p-8 lg:p-10">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                    style={{ background: 'rgba(201,169,110,0.10)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.10)'; }}
                  >
                    <Icon size={24} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{method.name}</h3>
                  <p className="text-sm leading-relaxed mb-6 font-light" style={{ color: 'var(--text-secondary)' }}>{method.desc}</p>
                  <div className="flex items-center gap-8 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Süre</div>
                      <div className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{method.time}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Oran</div>
                      <div className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>{method.ratio}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
