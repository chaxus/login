/*
 * @Author: ran
 * @Date: 2022-05-19 21:22:52
 * @LastEditors: ran
 * @LastEditTime: 2022-05-19 21:50:52
 */
import Koa, { Context } from 'koa';
import Router from 'koa-router';
import * as fs from 'fs'
import * as path from 'path'
import content from './client'
import serve from 'koa-static'

const app = new Koa();
const router = new Router();

const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf8');

router.get('/', (ctx: Context) => {
  ctx.type = 'html';
  ctx.body = template;
});

app.use(router.routes());

app.use(serve(path.resolve(__dirname, '../dist')));
app.use(serve(path.resolve(__dirname, '../')));

app.listen(30102);

console.log('Application is running on http://localhost:30102');

