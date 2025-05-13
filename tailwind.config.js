/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', /*'[data-mode="dark"]'],*/
  content: ['./src/renderer/index.html', './src/renderer/js/**/*.js'],
  //content: ['loading.html'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    fontFamily: {
      display: ['Source Serif Pro', 'Georgia', 'serif'],
      body: ['Synonym', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'], // Adding JetBrains Mono for monospaced text
    },

    extend: {
      fontSize: {
        'h1': '36', // Adjust as needed
        'h2': '2rem',   // Adjust as needed
        'h3': '1.75rem', // Adjust as needed
        'h4': '1.5rem',  // Adjust as needed
        'h5': '1.25rem', // Adjust as needed
        'h6': '1rem',    // Adjust as needed
      },
      fontWeight: {
        'h1': '700',  // Adjust as needed
        'h2': '600',  // Adjust as needed
        'h3': '500',  // Adjust as needed
        'h4': '400',  // Adjust as needed
        'h5': '300',  // Adjust as needed
        'h6': '200',  // Adjust as needed
      },
      zIndex: {
        '41': '41',
        '45': '45',
        '51': '51',
        '55': '55',
        '60': '60',
        '65': '65',
        '70': '70',
        '75': '75',
        '80': '80',
        '85': '85',
        '90': '90',
        '95': '95',
        '100': '100'
      }
    },

      animation: {
        'bounce': 'bounce 0.5s infinite',
        'bounce-100': 'bounce 0.5s 100ms infinite',
        'bounce-200': 'bounce 0.5s 200ms infinite',
        'bounce-300': 'bounce 0.5s 300ms infinite',
        'bounce-400': 'bounce 0.5s 400ms infinite',
        'bounce-500': 'bounce 0.5s 500ms infinite',
        'bounce-600': 'bounce 0.5s 600ms infinite',
        'heartpulse': 'heartpulse 1s infinite',
        'spin-50': 'spin 0.5s linear infinite',
        'reload-100': 'spin 1s linear infinite',
        'spin-200': 'spin 2s linear infinite',
        'fadeIn': 'fadeIn 2s cubic-bezier(0.25, 1, 0.5, 1)'
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-300px)' },
          '10%': { opacity: 0.1 },
          '20%': { opacity: 0.2 },
          '30%': { opacity: 0.3 },
          '40%': { opacity: 0.4 },
          '50%': { opacity: 0.5, transform: 'translateY(-150px)' },
          '60%': { opacity: 0.6 },
          '70%': { opacity: 0.7 },
          '80%': { opacity: 0.8 },
          '90%': { opacity: 0.9 },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        bounce: {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        },
        heartpulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      /*gradientColorStops: {
        'gradient-primary': '#00b4d8',
        'gradient-secondary': '#00ffcc',
      },*/
    },
  plugins: [],
};
