import { useState, useEffect, useRef, useCallback } from 'react';

const VIDEO_URL = 'https://www.forcoffeetr.com/magaza/wp-content/uploads/2026/08/headervideoweb.mp4';

const STATUS_MESSAGES = [
  'Çekirdekler özenle seçiliyor',
  'Kavrum profilleri hazırlanıyor',
  'Aroma notaları dengeleniyor',
  'Koleksiyonlar sunuma hazırlanıyor',
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setProgress(100);
    setFadingOut(true);
    setTimeout(onComplete, 900);
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress(Math.min((video.currentTime / video.duration) * 100, 100));
      }
    };
    const handleEnded = () => finish();
    const handleError = () => { setTimeout(finish, 2000); };
    const startPlay = () => {
      video.play().catch(() => { setTimeout(finish, 2000); });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', startPlay);

    // Start playing immediately — don't wait for full buffer
    startPlay();

    const overlayTimer = setTimeout(() => setShowOverlay(true), 300);
    // The remote video is decorative; never let a network issue block the app.
    const fallbackTimer = setTimeout(finish, 4500);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', startPlay);
      clearTimeout(overlayTimer);
      clearTimeout(fallbackTimer);
    };
  }, [finish]);

  const statusIndex = Math.min(Math.floor(progress / 25), STATUS_MESSAGES.length - 1);
  const currentStatus = STATUS_MESSAGES[statusIndex];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        backgroundColor: '#000',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 900ms ease-in-out',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{ opacity: 0.55 }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Cinematic dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* Subtle film grain */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div
          style={{
            opacity: showOverlay ? 1 : 0,
            transform: showOverlay ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
            filter: showOverlay ? 'blur(0)' : 'blur(10px)',
            transition: 'all 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <img
            src="https://www.forcoffeetr.com/wp-content/uploads/2026/10/logoforcoffee.png"
            alt="FOR COFFEE"
            style={{
              height: '60px',
              width: 'auto',
              filter: 'drop-shadow(0 0 24px rgba(143,169,139,0.35))',
            }}
          />
        </div>

        {/* Accent divider */}
        <div
          style={{
            width: showOverlay ? '48px' : '0px',
            height: '1px',
            marginTop: '28px',
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            transition: 'width 1000ms cubic-bezier(0.22, 1, 0.36, 1) 500ms',
          }}
        />

        {/* Main heading */}
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(26px, 4.5vw, 40px)',
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            lineHeight: 1.25,
            marginTop: '24px',
            textAlign: 'center',
            opacity: showOverlay ? 1 : 0,
            transform: showOverlay ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1000ms cubic-bezier(0.22, 1, 0.36, 1) 600ms',
          }}
        >
          Koleksiyonlar Hazırlanıyor
        </h1>

        {/* Rotating status message */}
        <div
          className="mt-5 h-5 overflow-hidden flex items-center"
          style={{
            opacity: showOverlay ? 1 : 0,
            transition: 'opacity 800ms ease 900ms',
          }}
        >
          <p
            key={currentStatus}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.28em',
              animation: 'loader-status-in 500ms ease-out',
            }}
          >
            {currentStatus}
          </p>
        </div>
      </div>

      {/* Bottom progress section */}
      <div
        className="absolute bottom-0 left-0 right-0 pb-8"
        style={{
          opacity: showOverlay ? 1 : 0,
          transition: 'opacity 800ms ease 1100ms',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.15em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(progress)}%
          </span>
          <div
            style={{
              width: 'min(280px, 72vw)',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-dark), var(--accent), var(--accent-hover))',
                borderRadius: '999px',
                transition: 'width 200ms linear',
                boxShadow: '0 0 12px rgba(143,169,139,0.4)',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loader-status-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
