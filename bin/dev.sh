###
# @Author: ran
# @Date: 2022-01-30 17:33:07
 # @LastEditors: ran
 # @LastEditTime: 2022-04-20 21:05:46
###

#client
# $bin/tsc loaders/*.ts
# $bin/webpack-dev-server --config ./config/config.local.ts --mode development
# rm -rf loaders/*.js
#app
# $bin/cross-env NODE_ENV=local $bin/nodemon ./app/index.ts
# all

bin=./node_modules/.bin
$bin/webpack serve --config ./webpack.dev.ts

