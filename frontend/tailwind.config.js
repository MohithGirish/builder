/** @type {import('tailwindcss').Config} */

/*
 * Blueprint Index palette. `brand` is the institutional steel-blue that replaced
 * the original teal. Legacy `teal-*` utility classes (118 across the app) are
 * aliased onto the same scale so the re-skin propagates without touching every
 * file — use `brand-*` in new code. `ink` = navy dark surfaces, `brass` = the
 * single rare premium accent (CTA + signature peak tick).
 */
const steel = {
  50:  '#eef3f9',
  100: '#d8e3f1',
  200: '#b3c8e2',
  300: '#84a5cf',
  400: '#5681b6',
  500: '#36699f',
  600: '#2b5e93',
  700: '#234c78',
  800: '#1f3f63',
  900: '#1b3252',
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: steel,
        teal:  steel,                 // legacy alias — see header note
        ink:   { DEFAULT: '#0e1b2e', 900: '#0e1b2e', 800: '#16263c', 700: '#1f3a5c', 600: '#2c4a6e' },
        brass: { DEFAULT: '#c2954a', 300: '#d9b061', 600: '#c2954a', 700: '#9a7026' },
        azure: '#5aa0e0',             // data / live / instrument glow
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card:        '0 2px 16px rgba(15,23,42,0.07)',
        'card-hover':'0 8px 32px rgba(15,23,42,0.13)',
        soft:        '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        lifted:      '0 12px 40px -8px rgba(15,23,42,0.18)',
        glow:        '0 0 0 1px rgba(43,94,147,0.14), 0 8px 30px -6px rgba(43,94,147,0.38)',
        'glow-amber':'0 8px 30px -6px rgba(194,149,74,0.50)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #2b5e93, #36699f)',
        'gradient-cta':   'linear-gradient(135deg, #c2954a, #a87a2f)',
        'gradient-hero':  'linear-gradient(135deg, #0e1b2e 0%, #16263c 100%)',
      },
      keyframes: {
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in':  { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-down':{ '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'gradient-pan': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'pulse-ring':  { '0%': { transform: 'scale(0.9)', opacity: '0.6' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        'scroll-wheel': {
          '0%':   { transform: 'translateY(0)',    opacity: '1'   },
          '60%':  { transform: 'translateY(16px)', opacity: '0'   },
          '61%':  { transform: 'translateY(-3px)', opacity: '0'   },
          '100%': { transform: 'translateY(0)',    opacity: '0.9' },
        },
        'chev-fade': {
          '0%,40%,100%': { opacity: '0.08', transform: 'translateY(-2px)' },
          '65%':         { opacity: '0.65', transform: 'translateY(2px)'  },
        },
        'scan-line': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(2000%)' },
        },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(100%)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'ci-fill': { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-up':     'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':     'fade-in 0.6s ease-out forwards',
        'scale-in':    'scale-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-down':  'slide-down 0.2s ease-out forwards',
        float:         'float 6s ease-in-out infinite',
        shimmer:       'shimmer 2s linear infinite',
        'gradient-pan':'gradient-pan 8s ease infinite',
        'pulse-ring':  'pulse-ring 2s ease-out infinite',
        'scroll-wheel':'scroll-wheel 2.2s cubic-bezier(0.37, 0, 0.63, 1) infinite',
        'chev-fade':   'chev-fade 2.2s ease-in-out infinite',
        'scan-line':       'scan-line 5s linear infinite',
        'slide-in-right':  'slide-in-right 0.25s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },
  plugins: [],
};
