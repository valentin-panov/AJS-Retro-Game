const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// configure source and distribution folder paths
const srcFolder = 'src';
const distFolder = 'dist';

module.exports = {
  // entry point for application
  entry: {
    app: path.join(__dirname, srcFolder, 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, distFolder),
    // ... next 2 lines we r fighting with Error: Universal Chunk Loading is not implemented yet at EnableChunkLoadingPlugin.apply
    // chunkLoading: false,
    // wasmLoading: false,
    // ...
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
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};
