/*
 * @Author: ran
 * @Date: 2022-02-14 16:09:18
 * @LastEditors: ran
 * @LastEditTime: 2022-03-26 14:35:31
 */
// 优化打包速度：https://cloud.tencent.com/developer/article/1842613
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
    // 忽略对 min.js 文件的递归解析处理
    noParse: [/\*.min\.js$/],
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
        use: ["auto-import-less"],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
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
          },
          {
            loader: "less-loader",
            options:{
              // Inline JavaScript is not enabled. Is it set in your options?
              lessOptions: { javascriptEnabled: true }
            }
          },
        ],
      },
      // {
      //   test: /\.(ico|png|jpg|jpeg|svg)?$/,
      //   use: {
      //     loader: "url-loader",
      //     // file-loader
      //     options: {
      //       publicPath:'/assets/svgs',//相对打包后index.html的图片位置
      //       limit: 10 * 1024,
      //       outputPath:'public/images',
      //     },
      //   },
      // },
      {
        test:/\.(jpg|png|gif|ico|svg|xlsx)$/,
        type:"asset",
        //解析
        parser: {
          //转base64的条件
          dataUrlCondition: {
            maxSize: 10 * 1024, // 10kb
          }
        },
        generator:{ 
          //与output.assetModuleFilename是相同的,这个写法引入的时候也会添加好这个路径
          filename:'assets/[name].[hash:6][ext]',
          //打包后对资源的引入，文件命名已经有/img了
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
    // 参考文档：https://www.cnblogs.com/wonyun/p/6030090.html
    new HtmlWebpackPlugin({
      template: "views/index.html",
      // inject: false,
      chunksSortMode: "none",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve("client/assets/images/favicon.ico"),
          to: resolve("public/images"),
        },
      ],
    }),
  ],
  performance: {
    // hints: false,
    hints: "error",
    maxAssetSize: 430000,
  },
  devtool: 'source-map',
};
