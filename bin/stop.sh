###
# @Author: ran
# @Date: 2022-02-22 16:26:33
 # @LastEditors: ran
 # @LastEditTime: 2022-02-22 17:27:12
###
port=$1
server='nodemon ./app/index.ts'
if [[ $port == "" ]]; then
    echo "请输入需要停止的端口号，举例：yarn stop [port]"
else
# 停止nodemon程序
ps aux | grep $server | awk '{print $2}' | xargs kill -9
# 停止指定端口号的程序
lsof -i:$port | grep node | awk '{print $2}' | xargs kill -9
fi