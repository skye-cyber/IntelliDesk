const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");

const entries = {
    //HF_Chat: './src/renderer/js/managers/HF_Chat.js',
    //XPutility: './src/renderer/js/Utils/XPutility.js',
    chatUtils: './src/renderer/js/Utils/chatUtils.js',
    MistralChatsAdmin: './src/renderer/js/managers/MistralChatsAdmin.js',
    //V_Utils: './src/renderer/js/diagraming/V_Utils.js',
    //HF_Audio: './src/renderer/js/managers/HF_Audio.js',
    //V_DG: './src/renderer/js/diagraming/V_DG.js',
    //V_Charts: './src/renderer/js/diagraming/V_Charts.js',
    //fileHandler: './src/renderer/js/Utils/fileHandler.js',
    //mathHandler: './src/renderer/js/MathBase/mathHandler.js'
};

module.exports = Object.entries(entries).map(([name, entryPath]) => {
    const absEntryPath = path.resolve(__dirname, entryPath);
    const outputDir = path.dirname(absEntryPath); // Output to same folder as source

    return {
        name,
        entry: absEntryPath,
        output: {
            filename: `packed_${name}.js`,
            path: outputDir,
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/',
                Buffer: ['buffer', 'Buffer'],
                crypto: ['crypto-browserify'],
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.join(__dirname, "node_modules/katex/dist"),
                        to: "katex"        // <-- this folder will appear in your `dist/`
                    }
                ]
            }),
        ],
        optimization: {
            usedExports: true,
            minimize: true,
        },
        resolve: {
            extensions: ['.js', '.mjs', '.json'],
            fallback: {
                buffer: require.resolve('buffer/'),
                path: require.resolve('path-browserify'),
                os: require.resolve('os-browserify/browser'),
                crypto: require.resolve('crypto-browserify'),
                vm: require.resolve('vm-browserify'),
                stream: require.resolve('stream-browserify'),
                fs: require.resolve('browserify-fs'),
                util: require.resolve('util/'),
                zlib: require.resolve('browserify-zlib'),
                https: require.resolve('https-browserify'),
                url: require.resolve('url/'),
                http: require.resolve('stream-http'),
                assert: require.resolve('assert/'),
                process: require.resolve('process/browser'),
                child_process: false
            }
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.html$/i,
                    loader: "html-loader",
                    options: { sources: false }   // don’t rewrite <link>/@href URLs
                },
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader', // Injects CSS into <style> tags at runtime
                        'css-loader'    // Resolves @import and url()
                    ]
                },
            ],
        },
        devtool: 'source-map',
        mode: 'production',
        //watch: true, // Enable HMR for renderer
    };
});
