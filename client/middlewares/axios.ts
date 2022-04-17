/*
 * @Author: your name
 * @Date: 2022-02-19 21:56:52
 * @LastEditTime: 2022-02-20 14:45:32
 * @LastEditors: Please set LastEditors
 */
import Axios, { AxiosRequestConfig } from 'axios';
import { Dispatch } from 'redux';

interface D {
    dispatch:Dispatch
}
interface A {
    type:string,
    [k:string]:string|boolean
}
export default function(options: AxiosRequestConfig<any> | undefined) {
  const axios = Axios.create(options);
  axios.interceptors.request.use((config) => {
      if(config.headers){
        config.headers['cache-control'] = 'no-cache';
        config.headers.Pragma = 'no-cache';
      }
    return config;
  });
  axios.interceptors.response.use(data => {
    const { code, redirectUrl } = data.data;
    if (code === 302) {
      // 未登录时，重定向到sso登录页
      window.location.href = redirectUrl;
    } else if (code === 200) {
      // 登录成功之后，重定向到原始的页面
      window.location.href = redirectUrl;
    }
    return data;
  });

  return ({ dispatch }:D) => {
    const loadingController = (loadingOptions: { hideLoading: boolean; loadingType: string; }, status: boolean) => {
      if (typeof loadingOptions === 'object') {
        const { hideLoading, loadingType } = loadingOptions
        if (hideLoading) return;
        const actionOptions:A = { type: 'LOADING' };
        actionOptions[loadingType] = status;
        dispatch(actionOptions);
      } else {
        dispatch({ type: 'LOADING', showLoading: status });
      }
    };

    return (next: any) => (action: any) => {
      const { type, request, loadingOptions } = action;
      if (!request) {
        return next(action);
      }

      loadingController(loadingOptions, true);
      const successCallback = (response: { data: any; }) => {
        loadingController(loadingOptions, false);
        next({ type, response, action });
        return response.data;
      };
      const failCallback = (error: any) => {
        loadingController(loadingOptions, false);
        next({ type, error, action });
        return Promise.reject(error);
      };
      if (typeof request === 'function') {
        return request(axios).then(successCallback).catch(failCallback);
      }
      return axios.request(request).then(successCallback).catch(failCallback);
    };
  };
}
