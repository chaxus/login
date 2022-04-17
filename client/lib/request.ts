/*
 * @Author: liuzhenli
 * @Date: 2020-11-05 22:55:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-20 15:38:10
 */
import Axios, { AxiosRequestHeaders } from 'axios';

const axios = Axios.create({
  baseURL: '/',
  timeout: 5 * 1000,
});

const post = async (url:string, payload?:any, headers?:AxiosRequestHeaders) => {
  const { data } = await axios.post(url, payload, { headers });
  return data;
};

const get = async (url:string, payload:any, headers:AxiosRequestHeaders) => {
  const { data } = await axios.get(url, { params: payload, headers });
  return data;
};

export {
  post,
  get,
};
