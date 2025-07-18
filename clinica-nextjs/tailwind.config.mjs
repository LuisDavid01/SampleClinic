/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Los colores ya están definidos en global.css a través de CSS variables
      // Solo agregamos algunos alias adicionales si los necesitas
      colors: {
        'primary-custom': 'var(--color-primary-custom)',
        'secondary-custom': 'var(--color-secondary-custom)',
        'complementario': 'var(--color-complementario)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}