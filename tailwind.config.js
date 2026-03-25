/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0e0e12',
          secondary: '#16161e',
          card: '#1c1c26',
          hover: '#22222e',
        },
        accent: {
          DEFAULT: '#c9a96e',
          light: '#e8c98a',
          dark: '#a07840',
          muted: 'rgba(201,169,110,0.15)',
        },
        text: {
          primary: '#f0ead6',
          secondary: '#9e9878',
          muted: '#5a5640',
        },
        urgency: {
          low: '#4ade80',
          medium: '#facc15',
          high: '#fb923c',
          critical: '#f87171',
        },
        border: 'rgba(201,169,110,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
