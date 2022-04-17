/*
 * @Author: your name
 * @Date: 2022-02-20 14:07:34
 * @LastEditTime: 2022-02-28 23:15:35
 * @LastEditors: Please set LastEditors
 */
import { AxiosInstance, AxiosRequestConfig } from 'axios' 

export function get(url: string, payload: any, loadingOptions: any, config: AxiosRequestConfig) {
    return {
      type: 'GET',
      loadingOptions,
      request(axios: AxiosInstance) {
        return axios.get(url, { params: payload, ...config });
      },
    };
  }
  
  export function post(url: string, payload: any, loadingOptions: any, config: AxiosRequestConfig) {
    return {
      type: 'POST',
      loadingOptions,
      request(axios: AxiosInstance) {
        return axios.post(url, payload, config);
      },
    };
  }
  
  export function put(url: string, payload: any, loadingOptions: any, config: AxiosRequestConfig) {
    return {
      type: 'PUT',
      loadingOptions,
      request(axios: AxiosInstance) {
        return axios.put(url, payload, config);
      },
    };
  }
  