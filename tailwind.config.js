/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: '#f5f7fa',
        dark: '#111827',
        cardLight: '#ffffff',
        cardDark: '#27272a',
        textLight: '#1f2937',
        textDark: '#f1f5f9',
        borderLight: '#e2e8f0',
        borderDark: '#3f3f46',
        accent: '#facc15',
        accentHover: '#eab308',
      },
    },
  },
  plugins: [],
};
