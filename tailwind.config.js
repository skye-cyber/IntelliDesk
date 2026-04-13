/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', /*'[data-mode="dark"]'],*/
    content: ['index.html', './src/core/**/*.js', './src/ui/**/*.js', './src/ui/**/*.jsx', './src/ui/**/*.tsx'],
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
            mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            brand: ['Poppins', 'Montserrat', 'SF Pro Display', 'system-ui', 'Outfit', 'sans-serif'],
            handwriting: ['Dancing Script', 'Pacifico', 'Caveat', 'cursive'],
            serif: ['Source Serif Pro', 'Merriweather', 'Lora', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
            sans: ['Synonym', 'Inter', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            // elegant: ['Playfair Display', 'Cormorant Garamond', 'Georgia'],
            condensed: ['Roboto Condensed', 'Oswald', 'Arial Narrow', 'sans-serif-condensed'],
            blink: ['system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'sans-serif'],
            // For elegant code display - prioritize ligatures and clarity
            code: [
                'JetBrains Mono',      // Best for ligatures, elegant curves
                'Fira Code',           // Excellent ligature support, modern
                'Cascadia Code',       // Microsoft's elegant monospace with cursive italics
                'Source Code Pro',     // Adobe's refined, highly readable
                'SF Mono',             // Apple's elegant system font
                'Menlo',               // Classic, beautiful on macOS
                'Monaco',              // Timeless, compact elegance
                'Consolas',            // Windows standard, very clean
                'monospace'
            ],

            // For elegant UI text around code
            elegant: [
                'Playfair Display',    // High-contrast serif, very elegant
                'Cormorant Garamond',  // Refined, classical proportions
                'Inter',               // Clean, modern, highly readable
                'SF Pro Text',         // Apple's elegant sans-serif
                'system-ui'
            ],

            // Alternative elegant monospace with character
            codeElegant: [
                'iA Writer Mono',      // Designed for clarity, minimal distractions
                'Victor Mono',         // Includes cursive italics for elegance
                'Operator Mono',       // Very expensive but beautiful cursive italics
                'Input Mono',          // Highly customizable, elegant proportions
                'monospace'
            ]
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
                secondary: {
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
                accent: {
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
                cyber: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#041824',
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
            bounce: 'bounce 0.5s infinite',
            'bounce-100': 'bounce 0.5s 100ms infinite',
            'bounce-200': 'bounce 0.5s 200ms infinite',
            'bounce-300': 'bounce 0.5s 300ms infinite',
            'bounce-400': 'bounce 0.5s 400ms infinite',
            'bounce-500': 'bounce 0.5s 500ms infinite',
            'bounce-600': 'bounce 0.5s 600ms infinite',
            heartpulse: 'heartpulse 1s infinite',
            'heartpulse-slow': 'heartpulse-slow 1s infinite',
            'heartpulse-super': 'heartpulse-super 1.2s infinite',
            'spin-50': 'spin 0.5s linear infinite',
            spin: 'spin 1s linear infinite',
            'reload-100': 'spin 1s linear infinite',
            'spin-200': 'spin 2s linear infinite',
            fadeIn: 'fadeIn 2s cubic-bezier(0.25, 1, 0.5, 1)',
            write: 'write 1.2s ease-in-out infinite',
            'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            // Quill
            'quill-write': 'quillWrite 1s ease-in-out infinite',
            'ink-drop': 'inkDrop 1.5s ease-out infinite',
            'ink-drop-delayed': 'inkDrop 1.5s ease-out 0.5s infinite',

            // Letters
            'letter-bounce': 'letterBounce 0.6s ease-in-out infinite',

            // Cursor
            'cursor-blink': 'cursorBlink 1s step-end infinite',

            // Brain
            'spin-slow': 'spin 3s linear infinite',
            'think-pulse': 'thinkPulse 1.2s ease-in-out infinite',

            // Scribble
            'scribble': 'scribble 1.5s ease-in-out infinite',

            // Paper plane
            'plane-fly': 'planeFly 2s ease-in-out infinite',
            'dash': 'dash 0.5s linear infinite',
            'fade-in-out': 'fadeInOut 1.5s ease-in-out infinite',

            // Voice wave
            'wave': 'wave 0.8s ease-in-out infinite',

            // Orbits
            'orbit-1': 'orbit 2s linear infinite',
            'orbit-2': 'orbit 2s linear infinite 0.66s',
            'orbit-3': 'orbit 2s linear infinite 1.33s',
            'typing-dots': 'typingDots 1.4s ease-in-out infinite',
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
            'heartpulse-super': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.4)' },
                '100%': { transform: 'scale(1)' },
            },
            spin: {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
            },
            write: {
                '0%, 100%': { transform: 'rotate(-15deg) translateX(0)' },
                '50%': { transform: 'rotate(5deg) translateX(2px)' },
            },
            quillWrite: {
                '0%, 100%': { transform: 'rotate(-10deg) translateX(0)' },
                '50%': { transform: 'rotate(5deg) translateX(2px)' },
            },
            inkDrop: {
                '0%': { transform: 'translateY(0) scale(1)', opacity: 0.6 },
                '100%': { transform: 'translateY(6px) scale(0)', opacity: 0 },
            },
            letterBounce: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-3px)' },
            },
            cursorBlink: {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0 },
            },
            thinkPulse: {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.5)' },
            },
            scribble: {
                '0%': { strokeDashoffset: '100' },
                '100%': { strokeDashoffset: '0' },
            },
            planeFly: {
                '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
                '50%': { transform: 'translateX(3px) rotate(5deg)' },
            },
            dash: {
                '0%': { width: '0px', opacity: 0 },
                '50%': { width: '16px', opacity: 0.5 },
                '100%': { width: '0px', opacity: 0 },
            },
            fadeInOut: {
                '0%, 100%': { opacity: 0.3 },
                '50%': { opacity: 1 },
            },
            wave: {
                '0%, 100%': { transform: 'scaleY(1)' },
                '50%': { transform: 'scaleY(2)' },
            },
            orbit: {
                '0%': { transform: 'rotate(0deg) translateX(8px) rotate(0deg)' },
                '100%': { transform: 'rotate(360deg) translateX(8px) rotate(-360deg)' },
            },
            typingDots: {
                '0%, 20%': { content: '"."' },
                '40%': { content: '".."' },
                '60%, 100%': { content: '"..."' },
            },
        },

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
