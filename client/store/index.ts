/*
 * @Author: your name
 * @Date: 2022-02-19 21:36:13
 * @LastEditTime: 2022-02-20 14:47:22
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /poster/client/store/index.ts
 */
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from '../reducers';
import AxiosCreator from '../middlewares/axios';

const middlewares = [
  AxiosCreator({
    baseURL: '/',
    timeout: 200 * 1000,
  }),
];

export default (initState: any) => {
  const composeEnhancers = composeWithDevTools({ trace: true, traceLimit: 25 });
  const store = createStore(reducers, initState, composeEnhancers(applyMiddleware(...middlewares)))
  return store;
};

