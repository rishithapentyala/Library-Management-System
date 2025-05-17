/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#D9E2FF',
          200: '#B4C6FF',
          300: '#8DA9FF',
          400: '#6687FF',
          500: '#3B64FC',
          600: '#1E3A8A',
          700: '#172C66',
          800: '#111D44',
          900: '#0A1022',
        },
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#166534',
          700: '#064E3B',
          800: '#022C22',
          900: '#001911',
        },
        accent: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FCA5B1',
          400: '#F87171',
          500: '#EF4444',
          600: '#9F1239',
          700: '#881337',
          800: '#4C0519',
          900: '#270212',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FBD34D',
          400: '#F9BF24',
          500: '#F59E0B',
          600: '#B45309',
          700: '#8A4005',
          800: '#452001',
          900: '#271100',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};