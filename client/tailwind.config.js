/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#001F3F',
        'primary-dark': '#0C1E3F',
        'primary-light': '#003D7A',
        secondary: '#64748b',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#ea580c',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
