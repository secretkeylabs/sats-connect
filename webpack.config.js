const webpack = require('webpack');
const path = require('path');

const NODE_ENV_PRODUCTION = 'production';
const NODE_ENV_DEVELOPMENT = 'development';

const isProduction = process.env.NODE_ENV === NODE_ENV_PRODUCTION;

module.exports = {
  mode: isProduction ? NODE_ENV_PRODUCTION : NODE_ENV_DEVELOPMENT,
  entry: ['./src/index.ts'],
  output: {
    filename: 'index.js',
    library: 'sats_connect',
    libraryTarget: 'var',
    path: path.resolve(process.cwd(), 'dist'),
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      fetch: 'cross-fetch',
    }),
  ],
  optimization: {
    minimize: isProduction,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      url: require.resolve('url'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      assert: require.resolve('assert'),
    },
  },
};
