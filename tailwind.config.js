/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        surface: {
          DEFAULT: '#09090b',
          1: '#111113',
          2: '#18181b',
          3: '#27272a',
          4: '#3f3f46',
        },
      },
      animation: {
        'fade-up':     'fadeUp .45s cubic-bezier(.16,1,.3,1) both',
        'fade-in':     'fadeIn .3s ease both',
        'scale-in':    'scaleIn .3s cubic-bezier(.16,1,.3,1) both',
        'slide-up':    'fadeUp .4s cubic-bezier(.16,1,.3,1) both',
        'slide-right': 'slideRight .3s cubic-bezier(.16,1,.3,1) both',
        'float':       'float 3s ease-in-out infinite',
        'pulse-dot':   'pulse-orange 2s ease-in-out infinite',
        'spin-slow':   'spin-slow 8s linear infinite',
        'shimmer':     'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:       { from:{ opacity:0, transform:'translateY(20px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeIn:       { from:{ opacity:0 }, to:{ opacity:1 } },
        scaleIn:      { from:{ opacity:0, transform:'scale(.95)' }, to:{ opacity:1, transform:'scale(1)' } },
        slideRight:   { from:{ opacity:0, transform:'translateX(-16px)' }, to:{ opacity:1, transform:'translateX(0)' } },
        float:        { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-6px)' } },
        'pulse-orange':{ '0%,100%':{ boxShadow:'0 0 0 0 rgba(249,115,22,.4)' }, '50%':{ boxShadow:'0 0 0 8px rgba(249,115,22,0)' } },
        'spin-slow':  { from:{ transform:'rotate(0deg)' }, to:{ transform:'rotate(360deg)' } },
        shimmer:      { '0%':{ backgroundPosition:'200% 0' }, '100%':{ backgroundPosition:'-200% 0' } },
      },
      boxShadow: {
        'glow':    '0 0 30px rgba(249,115,22,.15), 0 0 60px rgba(249,115,22,.05)',
        'glow-sm': '0 0 15px rgba(249,115,22,.2)',
        'card':    '0 4px 24px rgba(0,0,0,.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,.5)',
      },
    },
  },
  plugins: [],
}
