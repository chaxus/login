/*
 * @Author: ran
 * @Date: 2022-02-14 16:09:18
 * @LastEditors: ran
 * @LastEditTime: 2022-04-20 21:06:00
 */
const path = require("path");
const LoadablePlugin = require("@loadable/webpack-plugin") ;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WebpackBar = require('webpackbar')
const tsImportPluginFactory = require('ts-import-plugin');

const resolve = (filePath: string) => path.resolve(__dirname, filePath);

const DIST_PATH = resolve("client/index.tsx");

export default {
  mode:'production',
  entry: {
    index: DIST_PATH,
  },
  output: {
    filename: "bundle.js",
    path: resolve("dist"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", "jsx", ".json"],
    alias: {
      "@/lib": resolve("client/lib"),
      "@/router": resolve("client/router"),
      "@/pages": resolve("client/pages"),
      "@/utils": resolve("client/utils"),
      "@/assets": resolve("client/assets"),
      "@/components": resolve("client/components"),
      "@/common": resolve("client/common"),
      "@/client": resolve("client"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
                  tsImportPluginFactory({
                    libraryName: 'antd',
                    libraryDirectory: 'es',
                    style: true,
                  }),
                ],
              }),
              compilerOptions: {
                module: 'esnext'
              }
            },
          },
        ],
        exclude: '/node_modules/',
      },
      {
        test: /\.(js|jsx|tsx)?$/,
        use: [{
          loader:"auto-require-css",
          options:{
            mode:'module'
          }
        }],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:base64:5]",
              }
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:base64:5]",
              }
            },
          },
          {
            loader: "less-loader",
            options:{
              lessOptions: { javascriptEnabled: true }
            }
          },
        ],
      },
      {
        test:/\.(jpg|png|gif|ico|svg|xlsx)$/,
        type:"asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          }
        },
        generator:{ 
          filename:'assets/[name].[hash:6][ext]',
          publicPath:'./'
        },
      },
    ],
  },
  resolveLoader: {
    modules: ["node_modules"],
  },
  plugins: [
    new WebpackBar(),
    new CleanWebpackPlugin(),
    new LoadablePlugin(),
    new HtmlWebpackPlugin({
      template: "views/index.html",
      chunksSortMode: "none",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve("client/assets/js/css-doodle.min.js"),
          to: resolve("public/js"),
        },
        {
          from: resolve("client/assets/images/favicon.ico"),
          to: resolve("public/images"),
        },
      ],
    }),
  ],
  // performance: {
  //   hints: "error",
  //   maxAssetSize: 200000,
  // },
  devtool: 'source-map',
};
