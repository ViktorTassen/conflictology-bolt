/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './actions/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        cardChange: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.90)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        cardFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 1s forwards',
        fadeOut: 'fadeOut 1s forwards',
        cardChange: 'cardChange 0.5s ease-in-out',
        cardFromTop: 'cardFromTop 0.5s ease-out'
      }
    },
  },
  plugins: [],
}