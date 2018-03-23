"use strict";
const webpack = require('webpack');
const path = require('path');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');

const NODE_ENV = (process.env.NODE_ENV || "").trim().toLowerCase();
const DEV = NODE_ENV === 'development' || NODE_ENV === 'dev';
const TEST = NODE_ENV === 'test';
const PROD = NODE_ENV === 'production' || NODE_ENV === 'prod';

const PACKAGE = require("../package.json");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || "3000";

if (!NODE_ENV)
    throw new Error('Brak definicji zmiennej środowiskowej "NODE_ENV"');

const env = {};
env.NAME = PACKAGE.name;
env.BUILD_VERSION = PACKAGE.version;
env.BUILD_DATE = new Date().getTime();
env.NODE_ENV = NODE_ENV;
for (let name in env)
    env[name] = JSON.stringify(env[name]);


module.exports = {
    entry: ['./ui/Index.js'],
    devtool: PROD ? false : 'source-map',
    output: {
        publicPath: '/',
        path: path.join(__dirname, './src/main/webapp'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {loaders: []},
    devServer: {
        contentBase: "./ui/public",
        // noInfo: true,        // do not print bundle build stats
        hot: true,        // enable HMR
        inline: true,         // embed the webpack-dev-server runtime into the bundle
        // serve index.html in place of 404 responses to allow HTML5 history
        historyApiFallback: {  // wymagane przez router
            rewrites: [
                {
                    from: /^\/dev\/.*$/,
                    to: () => 'index.html'
                }
            ]
        },
        port: PORT,
        host: HOST
    },

};

module.exports.plugins = [
    new OpenBrowserPlugin({url: `http://${HOST}:${PORT}`}),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({'process.env': env}),
    new ExtractTextPlugin({
        filename: 'style.css',
        allChunks: true
    }),
    // do sprawdzenia czy potrzebny
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        "window.$": "jquery"
    }),
    new HtmlWebpackPlugin({
        template: './ui/view/index.html',
        files: {
            title: 'gRep',
            //  filename: 'assets/admin.html',
            // css: ['style.css'],
            js: ["bundle.js"],
        }
    }),
];

if (!DEV) {

    module.exports.plugins.push(
        new WebpackAutoInject({
            PACKAGE_JSON_PATH: '../package.json',
            components: {
                AutoIncreaseVersion: true,
                InjectAsComment: false
            },
            componentsOptions: {
                AutoIncreaseVersion: {
                    runInWatchMode: false
                },
            }
        }),
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15}),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}), // Minimum number of characters
        //  new webpack.optimize.CommonsChunkPlugin('common.js'),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
                keep_fnames: true
            },
            mangle: {
                warnings: false,
                keep_fnames: true
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin()
    )

}


//=============================== LOADERY =================================================
module.exports.module.loaders = [
    {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components|public\/)/,
        loader: "babel-loader",
        query: {
            presets: [// es2106 builduje się znacznie szybciej niż 2015 ale nie działa w połączeniu z uglify
                //DEV ? 'es2016' : 'es2015',
                'env', 'stage-2', 'flow'
            ],
            plugins: [ // tylko w trybie produkcyjnym
                //  "transform-react-constant-elements", // nie używać, powoduje błędy importu
                "transform-react-inline-elements"
            ]
        }
    },
    {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader?importLoaders=1'],
    },
    {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader?importLoaders=1', 'sass-loader'],
    },
    {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?name=assets/[hash].[ext]"
    },
    {
        test: /\.(woff|woff2)$/,
        loader: "url-loader?name=assets/[hash].[ext]&prefix=font/&limit=5000"
    },
    {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?name=assets/[hash].[ext]&limit=10000&mimetype=application/octet-stream"
    },
    {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?name=assets/[hash].[ext]&limit=10000&mimetype=image/svg+xml"
    },
    {
        test: /\.gif/,
        loader: "url-loader?name=assets/[hash].[ext]&limit=10000&mimetype=image/gif"
    },
    {
        test: /\.jpg/,
        loader: "url-loader?name=assets/[hash].[ext]&limit=10000&mimetype=image/jpg"
    },
    {
        test: /\.png/,
        loader: "url-loader?name=assets/[hash].[ext]&limit=10000&mimetype=image/png"
    }
];

