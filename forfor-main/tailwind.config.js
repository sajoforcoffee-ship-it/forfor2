/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        border: 'var(--border)',
        accent: {
          DEFAULT: '#C9A96E',
          dark:    '#B8964E',
          light:   '#D8B67A',
        },
        footer: {
          bg:      '#121212',
          surface: '#1C1C1C',
          text:    '#D5D5D5',
          heading: '#FFFFFF',
        },
        success: '#22C55E',
        warning: '#F4B740',
        error:   '#EF4444',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'luxury': '14px',
        'card':   '32px',
        'panel':  '24px',
        'pill':   '999px',
      },
      boxShadow: {
        'card':       '0 8px 30px rgba(0,0,0,0.04)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.08)',
        'glow-gold':  '0 0 20px rgba(201,169,110,0.20)',
        'panel':      '0 2px 16px rgba(0,0,0,0.04)',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity:'0', transform:'translateY(24px)' },
          '100%': { opacity:'1', transform:'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity:'0', transform:'translateX(60px)' },
          '100%': { opacity:'1', transform:'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity:'0', transform:'scale(0.96)' },
          '100%': { opacity:'1', transform:'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition:'-1000px 0' },
          '100%': { backgroundPosition:'1000px 0'  },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s ease-out forwards',
        slideIn:  'slideIn 0.8s ease-out 0.2s forwards',
        scaleIn:  'scaleIn 0.6s ease-out forwards',
        shimmer:  'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
