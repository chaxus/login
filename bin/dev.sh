###
# @Author: ran
# @Date: 2022-01-30 17:33:07
 # @LastEditors: ran
 # @LastEditTime: 2022-03-26 13:14:00
###

#client
# $bin/tsc loaders/*.ts
# $bin/webpack-dev-server --config ./config/config.local.ts --mode development
# rm -rf loaders/*.js
#app
# $bin/cross-env NODE_ENV=local $bin/nodemon ./app/index.ts
# all

bin=./node_modules/.bin
param=$1
app="app"
client="client"
startApp() {
    $bin/cross-env NODE_ENV=local $bin/nodemon ./app/index.ts
}
startClient() {
    $bin/webpack-dev-server --config ./webpack.dev.ts
}
if [[ $param == $app ]]; then
    startApp
fi
if [[ $param == $client ]]; then
    startClient
fi
if [[ $param == "" ]]; then
    startApp & startClient
fi
