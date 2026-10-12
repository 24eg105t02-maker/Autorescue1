/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',
          100: '#d9e2f2',
          200: '#b3c6e6',
          300: '#8da9d9',
          400: '#668ccc',
          500: '#335c99',
          600: '#1e3a6e',
          700: '#152952',
          800: '#0f1e3d',
          900: '#0a1628',
          950: '#060d18',
        },
        safety: {
          50: '#fff5ed',
          100: '#ffe8d4',
          200: '#ffd0a8',
          300: '#ffb071',
          400: '#ff8538',
          500: '#ff6b00',
          600: '#e65a00',
          700: '#bf4600',
          800: '#993800',
          900: '#7a2e00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
