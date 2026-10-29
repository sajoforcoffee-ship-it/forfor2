import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SpecialDrinksProps {
  onNavigate?: (page: string) => void;
}

interface DrinkItem {
  id: number;
  title: string;
  image: string;
  href: string;
  origin: string;
}

const drinks: DrinkItem[] = [
  {
    id: 1,
    title: 'Winterfell Bitki Çayı',
    image:
      'https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/02/winterfell.png',
    href:
      'https://www.forcoffeetr.com/magaza/urun/winterfell-ozel-bitki-cayi-karisimi/',
    origin: 'Bitki Çayı',
  },
  {
    id: 2,
    title: 'Sıcak Çikolata',
    image:
      'https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/02/sicak-cikolata.png',
    href:
      'https://www.forcoffeetr.com/magaza/urun/hot-chocolate/',
    origin: 'Sıcak İçecek',
  },
  {
    id: 3,
    title: 'Mavi Kelebek Çayı',
    image:
      'https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/02/bluebutterfly.png',
    href:
      'https://www.forcoffeetr.com/magaza/urun/blue-butterfly-tea/',
    origin: 'Bitki Çayı',
  },
  {
    id: 4,
    title: 'Orijinal Matcha',
    image:
      'https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/02/matcha.png',
    href:
      'https://www.forcoffeetr.com/magaza/urun/orijinal-matcha-japon-yesil-cay-tozu-saf-matcha/',
    origin: 'Japon Yeşil Çayı',
  },
];

const AUTO_INTERVAL = 4800;
const EASE = [0.22, 1, 0.36, 1] as const;

type CardPosition = 'center' | 'left' | 'right' | 'far-left' | 'far-right';

function DrinkCard({
  drink,
  isActive,
  isHovered,
  position,
  onActivate,
  isDark,
}: {
  drink: DrinkItem;
  isActive: boolean;
  isHovered: boolean;
  position: CardPosition;
  onActivate: () => void;
  isDark: boolean;
}) {
  const transforms: Record<CardPosition, string> = {
    center: 'translateX(0) translateZ(0) rotateY(0deg) scale(1)',
    left: 'translateX(-180px) translateZ(-120px) rotateY(18deg) scale(0.88)',
    right: 'translateX(180px) translateZ(-120px) rotateY(-18deg) scale(0.88)',
    'far-left': 'translateX(-320px) translateZ(-240px) rotateY(22deg) scale(0.78)',
    'far-right': 'translateX(320px) translateZ(-240px) rotateY(-22deg) scale(0.78)',
  };

  const opacities: Record<CardPosition, number> = {
    center: 1,
    left: 0.72,
    right: 0.72,
    'far-left': 0.4,
    'far-right': 0.4,
  };

  const scale = isActive && isHovered ? 1.035 : 1;
  const translateY = isActive && isHovered ? -12 : 0;

  const cardBg = isDark
    ? 'linear-gradient(145deg, var(--surface) 0%, var(--bg-secondary) 100%)'
    : 'linear-gradient(145deg, var(--surface) 0%, var(--bg-secondary) 100%)';
  const cardBorder = isActive
    ? isDark
      ? '1px solid rgba(143,169,139,0.35)'
      : '1px solid rgba(143,169,139,0.40)'
    : isDark
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(0,0,0,0.06)';

  const shadowActive = isDark
    ? isHovered
      ? '0 40px 80px rgba(0,0,0,0.50), 0 0 35px rgba(143,169,139,0.12)'
      : '0 25px 60px rgba(0,0,0,0.40)'
    : isHovered
      ? '0 40px 80px rgba(0,0,0,0.12), 0 0 35px rgba(143,169,139,0.15)'
      : '0 25px 60px rgba(0,0,0,0.08)';
  const shadowInactive = isDark
    ? '0 8px 28px rgba(0,0,0,0.30)'
    : '0 8px 28px rgba(0,0,0,0.06)';

  const imageBg = isDark
    ? 'radial-gradient(circle at center, var(--surface-hover) 0%, var(--surface) 62%, var(--bg-secondary) 100%)'
    : 'radial-gradient(circle at center, var(--surface) 0%, var(--bg-secondary) 62%, var(--bg) 100%)';

  const glowBg = isDark
    ? isActive
      ? 'rgba(143,169,139,0.10)'
      : 'rgba(143,169,139,0.04)'
    : isActive
      ? 'rgba(143,169,139,0.12)'
      : 'rgba(143,169,139,0.04)';

  const dropShadow = isDark
    ? isActive
      ? 'drop-shadow(0 22px 22px rgba(0,0,0,0.50))'
      : 'drop-shadow(0 14px 15px rgba(0,0,0,0.35))'
    : isActive
      ? 'drop-shadow(0 22px 22px rgba(0,0,0,0.18))'
      : 'drop-shadow(0 14px 15px rgba(0,0,0,0.12))';

  const infoBg = 'var(--surface)';
  const titleColor = 'var(--text-primary)';
  const linkColor = 'var(--accent)';
  const badgeBg = 'rgba(143,169,139,0.12)';
  const badgeColor = 'var(--accent-dark)';

  return (
    <motion.div
      onClick={onActivate}
      style={{
        width: 360,
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -180,
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
      }}
      animate={{
        transform: `${transforms[position]} translateY(${translateY}px) scale(${scale})`,
        opacity: opacities[position],
        zIndex: isActive ? 10 : 1,
      }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <div
        style={{
          overflow: 'hidden',
          borderRadius: 30,
          background: cardBg,
          border: cardBorder,
          boxShadow: isActive ? shadowActive : shadowInactive,
          transition: 'border-color 400ms ease, box-shadow 400ms ease',
        }}
      >
        {/* Image Area */}
        <div
          style={{
            position: 'relative',
            height: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            background: imageBg,
          }}
        >
          {/* Soft warm glow */}
          <div
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: glowBg,
              filter: 'blur(45px)',
              transition: 'all 500ms ease',
            }}
          />

          <img
            src={drink.image}
            alt={drink.title}
            style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: '88%',
              maxHeight: 300,
              objectFit: 'contain',
              filter: dropShadow,
              transform: isActive && isHovered ? 'scale(1.06)' : 'scale(1)',
              transition:
                'transform 500ms cubic-bezier(.22,.61,.36,1), filter 500ms ease',
            }}
          />

          {/* Category */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              left: 18,
              zIndex: 2,
              padding: '7px 12px',
              borderRadius: 999,
              background: badgeBg,
              color: badgeColor,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
            }}
          >
            {drink.origin}
          </div>
        </div>

        {/* Information */}
        <div style={{ padding: '25px 28px 28px', background: infoBg }}>
          <h3
            style={{
              margin: '0 0 20px',
              color: titleColor,
              fontSize: 20,
              fontWeight: 400,
              lineHeight: 1.3,
              fontFamily: 'serif',
            }}
          >
            {drink.title}
          </h3>

          <a
            href={drink.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              color: linkColor,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              textDecoration: 'none',
            }}
          >
            Keşfet
            <ArrowRight size={14} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function SpecialDrinks({ onNavigate }: SpecialDrinksProps) {
  const isDark = false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % drinks.length);
    }, AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleActivate = useCallback((index: number) => {
    setActiveIndex(index);
    resetTimer();
  }, [resetTimer]);

  const getPosition = (index: number): CardPosition => {
    const difference = index - activeIndex;
    const length = drinks.length;
    let normalized = difference;
    if (normalized > length / 2) normalized -= length;
    if (normalized < -length / 2) normalized += length;
    if (normalized === 0) return 'center';
    if (normalized === -1) return 'left';
    if (normalized === 1) return 'right';
    if (normalized === -2) return 'far-left';
    if (normalized === 2) return 'far-right';
    return normalized < 0 ? 'far-left' : 'far-right';
  };

  const sectionBg = isDark
    ? 'linear-gradient(180deg, var(--bg) 0%, var(--bg-secondary) 100%)'
    : 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg) 100%)';
  const headingColor = 'var(--text-primary)';
  const eyebrowColor = 'var(--accent)';
  const linkColor = isDark ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)';
  const indicatorActive = 'var(--accent)';
  const indicatorInactive = isDark
    ? 'rgba(255,255,255,0.25)'
    : 'rgba(143,169,139,0.25)';

  return (
    <section
      style={{
        paddingTop: 32,
        paddingBottom: 40,
        background: sectionBg,
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 1, background: eyebrowColor }} />
              <span
                style={{
                  color: eyebrowColor,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                }}
              >
                Kahve Dışında
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                color: headingColor,
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 300,
                lineHeight: 1.05,
                fontFamily: 'serif',
              }}
            >
              Özel Demler
              <br />
              & Sıcaklar
            </h2>
          </div>

          <button
            onClick={() => onNavigate?.('special-drinks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              alignSelf: 'flex-start',
              border: 'none',
              background: 'transparent',
              color: linkColor,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            Tüm Ürünler
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 3D Coverflow */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 520,
          overflow: 'hidden',
          perspective: '1400px',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={{
            position: 'relative',
            width: 360,
            height: '100%',
            margin: '0 auto',
            transformStyle: 'preserve-3d',
          }}
        >
          {drinks.map((drink, index) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              isActive={index === activeIndex}
              isHovered={hovered}
              position={getPosition(index)}
              onActivate={() => handleActivate(index)}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {drinks.map((_, index) => (
          <button
            key={index}
            onClick={() => handleActivate(index)}
            aria-label={`İçecek ${index + 1}`}
            style={{
              width: index === activeIndex ? 28 : 8,
              height: 8,
              padding: 0,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: index === activeIndex ? indicatorActive : indicatorInactive,
              transition: 'all 400ms cubic-bezier(.22,.61,.36,1)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
