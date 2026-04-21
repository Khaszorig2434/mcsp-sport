import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#143D8C',
          dark:    '#0e3070',
          magenta: '#950D4C',
          navy:    '#0E1C39',
        },
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted:      'rgb(var(--muted)      / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface)        / <alpha-value>)',
          card:    'rgb(var(--surface-card)   / <alpha-value>)',
          hover:   'rgb(var(--surface-hover)  / <alpha-value>)',
          border:  'rgb(var(--surface-border) / <alpha-value>)',
        },
        win:  '#22c55e',
        loss: '#ef4444',
        live: '#950D4C',
      },
      fontFamily: {
        sans:    ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in-left':  'slideInLeft 5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-right': 'slideInRight 5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up':     'fadeInUp 0.8s ease-out 0.35s both',
        'fade-in':        'fadeIn 0.7s ease-out both',
      },
      keyframes: {
        slideInLeft: {
          '0%':   { transform: 'translateX(-120px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',       opacity: '1' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(120px)',  opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        fadeInUp: {
          '0%':   { transform: 'translateY(32px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
