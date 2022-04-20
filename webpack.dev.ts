/*
 * @Author: your name
 * @Date: 2022-02-19 17:56:26
 * @LastEditTime: 2022-04-20 21:03:12
 * @LastEditors: ran
 */
import baseConfig from './webpack.config'
import { resolve } from 'path'
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
          host: 'localhost',
          open: true, 
          compress: true,
          proxy: {
            '/api': {
                target: 'http://127.0.0.1:30103',
                changeOrigin: true,
                secure: false,
                logLevel: 'debug',
            },
        },
        },
      }
export default merge(baseConfig,devConfig)