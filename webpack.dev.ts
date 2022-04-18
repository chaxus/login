/*
 * @Author: your name
 * @Date: 2022-02-19 17:56:26
 * @LastEditTime: 2022-03-09 21:01:45
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
          host: '127.0.0.1',
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