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
          DEFAULT: '#f97316',
          dark:    '#ea6c0a',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#1a1d2e',
          hover:   '#22253a',
          border:  '#2a2d3e',
        },
        win:  '#22c55e',
        loss: '#ef4444',
        live: '#f97316',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
