import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HERO_SLIDES = [
  {
    src: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/headerpic.png.png",
    alt: "FOR COFFEE Kafeinsiz Türk Kahvesi — Swiss Water Process",
  },
  {
    src: "https://www.forcoffeetr.com/wp-content/uploads/2026/10/hero2pic.png",
    alt: "FOR COFFEE kahve koleksiyonu",
  },
] as const;

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HERO_SLIDES.length);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [isHovered]);

  const slide = HERO_SLIDES[activeIndex];

  return (
    <section
      className="hero-banner"
      aria-label="FOR COFFEE tanıtım bannerları"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        key={slide.src}
        src={slide.src}
        alt={slide.alt}
        width={1920}
        height={720}
        loading={activeIndex === 0 ? "eager" : "lazy"}
        fetchPriority={activeIndex === 0 ? "high" : "auto"}
        decoding="async"
      />
      <button
        type="button"
        className="hero-banner__arrow hero-banner__arrow--prev"
        aria-label="Önceki banner"
        onClick={() => goTo(activeIndex - 1)}
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="hero-banner__arrow hero-banner__arrow--next"
        aria-label="Sonraki banner"
        onClick={() => goTo(activeIndex + 1)}
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>
      <div className="hero-banner__dots" aria-label="Banner seçimi">
        {HERO_SLIDES.map((item, index) => (
          <button
            key={item.src}
            type="button"
            className={`hero-banner__dot${index === activeIndex ? " is-active" : ""}`}
            aria-label={`${index + 1}. bannerı göster`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
