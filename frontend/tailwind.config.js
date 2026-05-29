/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:        '0 2px 16px rgba(15,23,42,0.07)',
        'card-hover':'0 8px 32px rgba(15,23,42,0.13)',
        soft:        '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        lifted:      '0 12px 40px -8px rgba(15,23,42,0.18)',
        glow:        '0 0 0 1px rgba(13,148,136,0.12), 0 8px 30px -6px rgba(13,148,136,0.35)',
        'glow-amber':'0 8px 30px -6px rgba(245,158,11,0.45)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0d9488, #14c38e)',
        'gradient-cta':   'linear-gradient(to right, #f97316, #f59e0b)',
        'gradient-hero':  'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
      },
      keyframes: {
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in':  { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-down':{ '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'gradient-pan': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'pulse-ring':{ '0%': { transform: 'scale(0.9)', opacity: '0.6' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
      },
      animation: {
        'fade-up':   'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':   'fade-in 0.6s ease-out forwards',
        'scale-in':  'scale-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-down':'slide-down 0.2s ease-out forwards',
        float:       'float 6s ease-in-out infinite',
        shimmer:     'shimmer 2s linear infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        'pulse-ring':'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
