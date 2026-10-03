import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sunflower: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          warm: '#E5A93C',
          gold: '#F4B942',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#cbdacb',
          300: '#a3c0a4',
          400: '#75a077',
          500: '#528255',
          600: '#4A7C59',
          700: '#325239',
        },
        cream: {
          50: '#FCFAF6',
          100: '#FAF8F5',
          200: '#F5EFE6',
          300: '#EFE5D7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'sway': 'sway 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'drop-fall': 'dropFall 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        dropFall: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.6)' },
          '50%': { opacity: '1', transform: 'translateY(15px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(40px) scale(0.8)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
