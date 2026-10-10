/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF8',
          100: '#F9F6ED',
          200: '#F1E9D7',
          300: '#E5D6B8',
          400: '#D6BE93',
          500: '#CAA571',
          600: '#BB8D54',
          700: '#9C7041',
          800: '#7E5B37',
          900: '#664A2F',
        },
        sage: {
          50: '#F5F8F5',
          100: '#E6EFE6',
          200: '#CCDCCC',
          300: '#A4C3A4',
          400: '#7AA47A',
          500: '#5A875A',
          600: '#456A45',
          700: '#385538',
          800: '#2E452E',
          900: '#273927',
        },
        navy: {
          700: '#2A3450',
          800: '#1A233A',
          900: '#0F1626',
          950: '#080C15',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
