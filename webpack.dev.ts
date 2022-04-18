/*
 * @Author: your name
 * @Date: 2022-02-19 17:56:26
 * @LastEditTime: 2022-03-09 21:01:45
 * @LastEditors: ran
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /poster/webpack.config.dev.ts
 */
import baseConfig from './webpack.config'
import { resolve } from 'path'
// const { HotModuleReplacementPlugin } = require('webpack')
const { merge } = require('webpack-merge');

const devConfig = {
        mode: 'development',
        devtool: 'source-map',
        performance: {
          hints: false,
        },
        devServer: {
          historyApiFallback: true,
          static: {
            directory: resolve('./'),
          },
          port: 30104,
          host: '127.0.0.1',
          open: true,  // 自动打开浏览器
          compress: true,  // 启动 gzip 压缩
          proxy: {
            '/api': {
                target: 'http://127.0.0.1:30103',
                changeOrigin: true,
                secure: false,
                logLevel: 'debug',
            },
        },
        },
        // plugins: [
        //   new HotModuleReplacementPlugin()
        // ],
      }
export default merge(baseConfig,devConfig)