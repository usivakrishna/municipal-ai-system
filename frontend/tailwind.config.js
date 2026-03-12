/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9f5',
          100: '#d6f1e7',
          200: '#aee2ce',
          300: '#7fceb0',
          400: '#48b48c',
          500: '#2f9a74',
          600: '#247d5e',
          700: '#1f644d',
          800: '#1b4f3d',
          900: '#163e31'
        },
        accent: {
          500: '#ff7a18',
          600: '#e56208'
        }
      },
      boxShadow: {
        soft: '0 12px 30px rgba(23, 36, 50, 0.12)'
      }
    }
  },
  plugins: []
};
