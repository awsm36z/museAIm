const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './public/js/renderer.js', // Entry point for the renderer process
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // Output directory
        publicPath: '/', // Serve files from the root
    },
    target: 'electron-renderer', // Target Electron renderer process
    externals: {
        electron: 'require("electron")', // Exclude Electron from the bundle
    },
    resolve: {
        alias: {
            three: path.resolve(__dirname, 'node_modules/three'),
        },
        fallback: {
            global: require.resolve('global'), // Polyfill for global
            fs: false, // Exclude `fs` from browser environment
            path: require.resolve('path-browserify'), // Provide a browser-compatible `path` module
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Transpile JavaScript files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'], // Use Babel preset for modern JavaScript
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // Use the provided `index.html` as a template
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public/styles.css', to: 'styles.css' }, // Copy CSS file
                { from: 'public/images', to: 'images' }, // Copy images directory
                { from: 'public/models', to: 'models' }, // Copy 3D model files
                { from: 'public/js/app.js', to: 'js/app.js' }, // Copy additional JS file
            ],
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'), // Serve static files
        },
        port: 3001, // Change port to 3001
    },
};
