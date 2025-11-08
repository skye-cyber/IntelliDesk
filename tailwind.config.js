/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', /*'[data-mode="dark"]'],*/
    content: ['./src/renderer/index.html', './src/renderer/js/**/*.js', './src/components/**/*.js', './src/react-app/**/*.js*'],
    //content: ['loading.html'],
    theme: {
        screens: {
            sxs: '256px',
            xs: '384px',
            sm: '512px',
            md: '768px',
            sd: '896px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
        fontFamily: {
            display: ['Source Serif Pro', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
            body: ['Synonym', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            brand: ['Poppins', 'Montserrat', 'SF Pro Display', 'system-ui', 'sans-serif'],
            handwriting: ['Dancing Script', 'Pacifico', 'Caveat', 'cursive'],
            serif: ['Source Serif Pro', 'Merriweather', 'Lora', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
            sans: ['Synonym', 'Inter', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            modern: ['Poppins', 'Montserrat', 'SF Pro Display', 'Outfit', 'sans-serif'],
            elegant: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
            condensed: ['Roboto Condensed', 'Oswald', 'Arial Narrow', 'sans-serif-condensed'],
            code: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', 'Monaco', 'Consolas', 'monospace'],
        },

        extend: {
            boxShadow: {
                'balanced-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'balanced': '0 2px 6px 0 rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
                'balanced-md': '0 4px 12px 0 rgba(0, 0, 0, 0.1), 0 2px 6px 0 rgba(0, 0, 0, 0.08)',
                'balanced-lg': '0 8px 24px 0 rgba(0, 0, 0, 0.1), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
                'balanced-xl': '0 12px 36px 0 rgba(0, 0, 0, 0.1), 0 6px 18px 0 rgba(0, 0, 0, 0.08)',
                'balanced-2xl': '0 24px 48px 0 rgba(0, 0, 0, 0.1), 0 12px 24px 0 rgba(0, 0, 0, 0.08)',

                // Even more balanced (centered)
                'centered-sm': '0 0 3px 0 rgba(0, 0, 0, 0.1)',
                'centered': '0 0 6px 0 rgba(0, 0, 0, 0.1)',
                'centered-md': '0 0 12px 0 rgba(0, 0, 0, 0.1)',
                'centered-lg': '0 0 24px 0 rgba(0, 0, 0, 0.1)',
                'centered-xl': '0 0 36px 0 rgba(0, 0, 0, 0.15)',

                // Soft balanced shadows
                'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'soft-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
                'soft-lg': '0 8px 32px rgba(0, 0, 0, 0.1)',

                // For your message component specifically
                'message': '0 2px 8px rgba(0, 0, 0, 0.1)',
                'message-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
            },
            colors: {
                primary: {
                    50: '#5252ff',
                    100: '#4c4ceb',
                    200: '#4141ca',
                    300: '#33339f',
                    400: '#27277a',
                    500: '#212166',
                    600: '#22226a',
                    700: '#171746',
                    800: '#111136',
                    900: '#0d0d27',
                    950: '#070716',
                },
                secondary:{
                    50: '#6d98fd',
                    100: '#618ae2',
                    200: '#5174be',
                    300: '#4661a1',
                    400: '#3a5286',
                    500: '#27365a',
                    600: '#29395e',
                    700: '#202d4b',
                    800: '#151e32',
                    900: '#0f1422',
                    950: '#06080d',
                },
                accent:{
                    50: '#83b4fd',
                    100: '#78a5e8',
                    200: '#729cdc',
                    300: '#668cc5',
                    400: '#5878a8',
                    500: '#4b6790',
                    600: '#3a5070',
                    700: '#2a3a51',
                    800: '#192230',
                    900: '#141d28',
                    950: '#0d1219',
                },
                blend: {
                    50: '#6e77fe',
                    100: '#646de8',
                    200: '#5860cc',
                    300: '#4c53b1',
                    400: '#42489a',
                    500: '#424899',
                    600: '#2f346d',
                    700: '#21244c',
                    800: '#1c1f41',
                    900: '#161732',
                    950: '#12142a',
                },
            },
            transitionTimingFunction: {
                'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
                'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
            },
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
            'heartpulse-slow': 'heartpulse-slow 1s infinite',
            'spin-50': 'spin 0.5s linear infinite',
            'spin': 'spin 1s linear infinite',
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
            'heartpulse-slow': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
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
    plugins: [
        function({ addComponents }) {
            addComponents({
                '.gradient-neon': {
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box, border-box',
                    backgroundOrigin: 'border-box',
                    backgroundImage: `
                    linear-gradient(to bottom right, hsl(0, 0%, 100%, 1), hsl(0, 0%, 100%, 1)),
                          linear-gradient(135deg, rgba(255, 0, 255, 0.8) 0%, rgba(0, 0, 255, 0.6) 50%, rgba(0, 255, 255, 0.67) 100%)
                          `,
                },
                '.gradient-neon-dark': {
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box, border-box',
                    backgroundOrigin: 'border-box',
                    backgroundImage: `
                    linear-gradient(to bottom right, hsl(0, 0%, 15%, 0.9), hsl(0, 0%, 15%, 0.9)),
                          linear-gradient(135deg, rgba(255, 0, 255, 0.67) 0%, rgba(0, 0, 255, 0.6) 50%, rgba(0, 255, 255, 0.8) 100%)
                          `,
                }
            })
        },
    ],
};
