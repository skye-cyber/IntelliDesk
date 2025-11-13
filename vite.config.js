import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        react()
    ],
    base: './',
    //root: resolve(__dirname, 'src/react-app'),
    //publicDir: resolve(__dirname, 'src/assets'),
    server: {
        port: 40099,
    },
    build: {
        outDir: resolve(__dirname, 'build'),
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
            //input: resolve(__dirname, 'src/react-app/'),
            /*
             * output: {
                // Ensure relative paths in build
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
            */
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src/react-app/'),
            '@components': resolve(__dirname, 'src/react-app/components'),
            '@hooks': resolve(__dirname, 'src/react-app/hooks'),
            '@utils': resolve(__dirname, 'src/react-app/utils'),
            '@assets': resolve(__dirname, 'src/assets'),
            '@common': resolve(__dirname, 'src/common'),
            '@renderer': resolve(__dirname, 'src/renderer'),
            '@main': resolve(__dirname, 'src/main'),
            '@icons': resolve(__dirname, 'src/icons'),
            '@js': resolve(__dirname, 'src/renderer/js'),
            '@css': resolve(__dirname, 'src/renderer/css'),
            '@fonts': resolve(__dirname, 'src/renderer/fonts'),
            crypto: require.resolve('crypto-browserify'),
            process: require.resolve('process/browser'),
            fs: require.resolve('browserify-fs'),
            buffer: require.resolve('buffer/'),
        },
    },
    define: {
        'process.env': {}
    },
    optimizeDeps: {
        include: ['buffer'],
        //force: true
    },
    // Ensure proper React configuration
    esbuild: {
        //jsxInject: `import React from 'react'`
    }
});
