import { useState, useRef, useEffect, useCallback, type PointerEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";

export interface Product {
  id: number;
  title: string;
  video?: string;
  image?: string;
  url: string;
  origin: string;
  flavorNotes: string;
  roastLevel: string;
  accent: string;
  description?: string;
  tastingNotes?: string;
  brewing?: string;
  category?: string;
  productCode?: string;
  weightGrams?: number;
  price?: number;
  fullOrigin?: string;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Special Espresso Blend",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/espressoblend.png.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "Çok Satanlar • Espresso Serisi",
    flavorNotes: "Çikolata, karamel ve kavrulmuş fındık notaları.",
    roastLevel: "Espresso Serisi",
    accent: "#4A7FB5",
  },
  {
    id: 2,
    title: "Special Filter Blend",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/specialfilterblend.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "Harman",
    flavorNotes: "Kırmızı meyve, çikolata ve karamel notaları.",
    roastLevel: "Orta",
    accent: "#E86A5C",
  },
  {
    id: 3,
    title: "Nicaragua Gold",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/nicaragua.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "Nikaragua",
    flavorNotes: "Yasemin, narenciye, karamel ve fındık notaları.",
    roastLevel: "Dengeli",
    accent: "#F4B860",
  },
  {
    id: 4,
  title: "Colombia Supremo",
  image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/colombiasupremo.png",
  video: "https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/07/colombiaa.mp4",
    url: "https://www.forcoffeetr.com/magaza/urunler/kahvelerimiz/single-origin/colombia-supremo/",
    origin: "Kolombiya",
    flavorNotes: "Karamel, fındık, dengeli asidite",
    roastLevel: "Orta",
    accent: "#5BBF8A",
  },
  {
    id: 5,
    title: "Moka Pot Blend",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/mokapot.png.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "İtalyan usulü",
    flavorNotes: "Yoğun aroma, dolgun gövde ve ipeksi içim.",
    roastLevel: "Özel harman",
    accent: "#D7A85C",
  },
  {
    id: 6,
    title: "Sumatra Blue Batak",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/sumatrbluebatak.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "Endonezya",
    flavorNotes: "Bitter çikolata, topraksı baharat ve sedir ağacı notaları. Yoğun gövde, düşük asidite ve kalıcı aroma.",
    roastLevel: "Orta-Koyu",
    accent: "#78966F",
  },
  {
    id: 7,
    title: "Jamaica Blue Mountain",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/jamaicabluemountain.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "Jamaika",
    flavorNotes: "Bal, karamel, sütlü çikolata ve hafif narenciye notaları. Yumuşak içim, dengeli asidite ve rafine aroma.",
    roastLevel: "Orta",
    accent: "#79A9C7",
  },
  {
    id: 8,
    title: "Peru Organic Decaf",
    image: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/file_000000004b50820aadacc1efe0abc4fa.png",
    url: "https://www.forcoffeetr.com/magaza/",
    origin: "Peru · Swiss Water®",
    flavorNotes: "Bitter çikolata, karamel ve hafif fındık notaları. Yumuşak içim, dengeli gövde ve %100 Arabica.",
    roastLevel: "Kafeinsiz",
    accent: "#B98B6B",
  },
];

// Shuffle once when the homepage loads so each new visit starts with a different order.
for (let index = products.length - 1; index > 0; index -= 1) {
  const swapIndex = Math.floor(Math.random() * (index + 1));
  [products[index], products[swapIndex]] = [products[swapIndex], products[index]];
}

const AUTO_ADVANCE_MS = 10000;

export default function App({ onShopClick, onProductClick }: { onShopClick?: () => void; onProductClick?: (product: Product) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const dragState = useRef<{ startX: number; active: boolean; moved: boolean }>({
    startX: 0,
    active: false,
    moved: false,
  });
  
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const trackRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback(
    (idx: number) =>
      setCurrentIndex(((idx % products.length) + products.length) % products.length),
    []
  );
  
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(
      () => setCurrentIndex((i) => (i + 1) % products.length),
      AUTO_ADVANCE_MS
    );
    return () => clearInterval(t);
  }, [isPaused, currentIndex]);

  // Sadece ortadaki aktif videoyu oynat, diğerlerini durdur ve ilk kareye sar
  useEffect(() => {
    const activeId = products[currentIndex].id;
    
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el) return;
      
      try {
        if (Number(id) === activeId) {
          // Ortaya gelen aktif video: baştan başlat ve oynat
          el.currentTime = 0;
          const playPromise = el.play();
          
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              // Otomatik oynatma engellemelerini sessizce yakala
              console.log("Video otomatik başlatılamadı:", error);
            });
          }
        } else {
          // Kenardaki pasif videolar: durdur ve ilk kareye dön (sabit resim efekti)
          el.pause();
          el.currentTime = 0; 
        }
      } catch (err) {
        console.error("Video kontrol hatası:", err);
      }
    });
  }, [currentIndex]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Ignore pointer down on buttons (arrows) so they can receive their own clicks
    if ((e.target as HTMLElement).closest('button')) return;
    dragState.current = { startX: e.clientX, active: true, moved: false };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsPaused(true);
  };
  
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    setDragOffset(dx);
  };
  
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.active = false;
    setDragOffset(0);
    if (dx < -60) next();
    else if (dx > 60) prev();
    setTimeout(() => setIsPaused(false), 300);
  };

  const active = products[currentIndex];

  return (
    <section
      className="relative overflow-hidden py-10 md:py-14"
      style={{ backgroundColor: "#0B0A08", color: "#fff" }}
    >
      {/* Soft accent glow follows active card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(60% 55% at 70% 40%, ${active.accent}33 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-6 md:px-10">
        {/* Heading */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:items-end md:gap-16">
          <div className="flex items-center gap-2 md:pb-2">
            <span
              className="inline-block h-px w-8"
              style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
              Çok Satanlar
            </span>
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            <span style={{ color: products[0].accent }}>Guatemala</span>
            <span className="text-white">, </span>
            <span style={{ color: products[1].accent }}>Special Filter Blend</span>
            <span className="text-white">, </span>
            <span style={{ color: products[2].accent }}>Nikaragua</span>
            <span className="text-white"> ve </span>
            <span style={{ color: products[3].accent }}>Kolombiya</span>
            <span className="text-white">
              {" "}
              yolculuğunda en özel çekirdekleri keşfet.
            </span>
          </h2>
        </div>

        {/* Carousel track */}
        <div
          className="relative mt-6 md:mt-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Drag hint bubble */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-6 left-1/2 z-30 -translate-x-1/2 md:left-[38%]"
          >
            <div
              className="flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium text-white shadow-2xl transition-colors duration-500"
              style={{
                backgroundColor: active.accent,
                boxShadow: `0 20px 40px -10px ${active.accent}66`,
              }}
            >
              <MousePointer2 size={14} />
              Sürükleyin veya tıklayın
            </div>
          </div>

          <div
            ref={trackRef}
            className="relative h-[520px] cursor-grab select-none touch-pan-y active:cursor-grabbing md:h-[640px]"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {products.map((p, index) => {
              // Signed distance so cards fan out both sides of the active one
              let diff = index - currentIndex;
              const half = products.length / 2;
              if (diff > half) diff -= products.length;
              if (diff < -half) diff += products.length;

              const isActive = diff === 0;
              const absDiff = Math.abs(diff);
              const visible = absDiff <= 2;

              // Layout: fan of tilted cards, active centered, siblings to sides
              const translateX = diff * 260 + dragOffset * 0.6;
              const translateY = absDiff * 24;
              const rotate = diff * -6;
              const scale = isActive ? 1 : 1 - absDiff * 0.08;

              return (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (dragState.current.moved) { e.preventDefault(); return; }
                    if (!isActive) { e.preventDefault(); goTo(index); return; }
                    if (onProductClick) { e.preventDefault(); onProductClick(p); }
                  }}
                  className="absolute left-1/2 top-1/2 aspect-[2/3] w-[280px] overflow-hidden rounded-[28px] md:w-[360px]"
                  style={{
                    marginLeft: "-140px",
                    marginTop: "-210px",
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})`,
                    opacity: visible ? (isActive ? 1 : 0.7 - absDiff * 0.15) : 0,
                    zIndex: 30 - absDiff,
                    pointerEvents: isActive ? "auto" : (visible ? "auto" : "none"), // Allow clicking on side cards to go to them
                    backgroundColor: "#141210",
                    boxShadow: isActive
                      ? `0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px -20px ${p.accent}55`
                      : "0 20px 50px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                    transition:
                      "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, box-shadow 0.5s ease",
                  }}
                >
                  {/* Accent wash background so entire video is visible without cropping */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(160deg, ${p.accent}30 0%, #0B0A08 70%)`,
                    }}
                  />
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={`${p.title} ürün görseli`}
                      width={1200}
                      height={1800}
                      loading={isActive ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-contain"
                      style={{ opacity: 0.95 }}
                    />
                  ) : (
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current[p.id] = el;
                      }}
                      src={p.video}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ opacity: 0.95 }}
                    />
                  )}

                  {/* Bottom gradient + text */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 0%, rgba(11,10,8,0.85) 60%, rgba(11,10,8,0.98) 100%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                    <span
                      className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em]"
                      style={{ color: p.accent }}
                    >
                      {p.origin} · {p.roastLevel}
                    </span>
                    <h3 className="mb-2 text-xl font-semibold leading-tight text-white md:text-2xl">
                      {p.title}
                    </h3>
                    <p className="mb-4 text-xs leading-relaxed text-white/70 md:text-sm">
                      {p.flavorNotes}
                    </p>
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                      style={{ backgroundColor: "#fff", color: "#0B0A08" }}
                    >
                      İncele <ArrowRight size={12} />
                    </span>
                  </div>
                </a>
              );
            })}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
              aria-label="Önceki"
              className="absolute left-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors md:left-6 hover:bg-white/20"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
              aria-label="Sonraki"
              className="absolute right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors md:right-6 hover:bg-white/20"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Progress bars */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {products.map((p, index) => (
              <button
                key={p.id}
                onClick={() => goTo(index)}
                aria-label={p.title}
                className="relative h-1 overflow-hidden rounded-full transition-all duration-500"
                style={{
                  width: index === currentIndex ? "44px" : "8px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                }}
              >
                {index === currentIndex && (
                  <span
                    key={`${currentIndex}-${isPaused}`}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      backgroundColor: p.accent,
                      width: isPaused ? "100%" : undefined,
                      animation: isPaused
                        ? "none"
                        : `bestsellers-fill ${AUTO_ADVANCE_MS}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <style>{`@keyframes bestsellers-fill { from { width: 0%; } to { width: 100%; } }`}</style>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center md:mt-8">
          <button
            onClick={onShopClick}
            className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-medium transition-colors"
            style={{
              border: `1px solid ${active.accent}`,
              color: "#fff",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${active.accent}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Tüm koleksiyonu keşfet
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
