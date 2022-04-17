
###
 # @Author: ran
 # @Date: 2022-01-30 17:33:07
 # @LastEditors: ran
 # @LastEditTime: 2022-03-26 13:13:53
### 
# ./node_modules/.bin/tsc $1
bin=./node_modules/.bin
# $bin/tsc loaders/*.ts
$bin/webpack --mode production
# rm -rf loaders/*.js