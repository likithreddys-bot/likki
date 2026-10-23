import type { Config } from 'tailwindcss';

// Tokens mirror the Figma variable collection "Tokens" (file "AI Zero to Hero UI").
const rgb = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: rgb('paper'),
        paper2: rgb('paper-2'),
        card: rgb('card'),
        ink: rgb('ink'),
        soft: rgb('soft'),
        pink: { DEFAULT: rgb('pink'), soft: rgb('pink-soft'), deep: rgb('pink-deep') },
        orange: rgb('orange'),
        yellow: rgb('yellow'),
        cream: rgb('cream'),
        green: rgb('green'),
        red: rgb('red'),
        gold: rgb('gold'),
        silver: rgb('silver'),
        bronze: rgb('bronze'),
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        hand: ['Caveat', '"Comic Sans MS"', 'cursive'],
      },
      borderRadius: { card: '12px', btn: '8px' },
      borderWidth: { 2.5: '2.5px' },
      boxShadow: {
        hard: '4px 4px 0 0 rgb(var(--ink))',
        'hard-sm': '3px 3px 0 0 rgb(var(--ink))',
        'hard-md': '5px 5px 0 0 rgb(var(--ink))',
        'hard-lg': '6px 6px 0 0 rgb(var(--ink))',
        'hard-xl': '8px 8px 0 0 rgb(var(--ink))',
      },
      keyframes: {
        waddle: {
          '0%, 100%': { transform: 'rotate(-5deg) translateY(0)' },
          '25%': { transform: 'rotate(0deg) translateY(-3px)' },
          '50%': { transform: 'rotate(5deg) translateY(0)' },
          '75%': { transform: 'rotate(0deg) translateY(-3px)' },
        },
        'frame-a': { '0%, 49.99%': { opacity: '1' }, '50%, 100%': { opacity: '0' } },
        'frame-b': { '0%, 49.99%': { opacity: '0' }, '50%, 100%': { opacity: '1' } },
        plop: {
          '0%': { transform: 'scale(1.08, 0.88)' },
          '60%': { transform: 'scale(0.97, 1.04)' },
          '100%': { transform: 'scale(1, 1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scaleY(1) rotate(0deg)' },
          '50%': { transform: 'scaleY(1.025) rotate(-1deg)' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.28' },
          '50%': { transform: 'scale(1.12)', opacity: '0.12' },
        },
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        waddle: 'waddle 0.9s ease-in-out infinite',
        'frame-a': 'frame-a 0.9s steps(1, end) infinite',
        'frame-b': 'frame-b 0.9s steps(1, end) infinite',
        plop: 'plop 0.45s ease-out',
        breathe: 'breathe 3.4s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s ease-in-out infinite',
        rise: 'rise 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
export default config;
