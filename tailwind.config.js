/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b8c2',
          400: '#9292a0',
          500: '#757585',
          600: '#5e5e6d',
          700: '#4c4c59',
          800: '#40404a',
          900: '#111827',
          950: '#0b0f19',
        },
        brand: {
          gold: '#c5a059',
          accent: '#d4af37',
          dark: '#121212',
          card: '#1e1e1e',
          lightBg: '#fafafa',
          border: '#e5e7eb',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'DM Sans', 'Inter', '-apple-system', 'sans-serif'],
        serif: ['Outfit', 'DM Sans', 'Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
