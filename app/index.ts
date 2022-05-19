import Koa from 'koa'
import content from './client'
// import serve from 'koa-static'


const app = new Koa();

app.use(ctx => {
    ctx.body = `
    <html>
    <head>
      <title>ssr</title>
    </head>
    <body>
      <div id="root">${content}</div>
    </body>
  </html>
    `;
  });
// 服务的静态文件地址，所以打开 localhost:3000 访问的时候就会默认在该目录下找对应的 index.html 文件。如果没有配置该选项，访问会报 404。
// app.use(serve(__dirname + '/example')); 

app.listen(30102, () => {
    console.log('Example app listening on port 30102!\n');
});
