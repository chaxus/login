/*
 * @Author: ran
 * @Date: 2022-01-30 23:01:57
 * @LastEditors: ran
 * @LastEditTime: 2022-04-20 20:39:17
*/

import { Path } from "typescript";
import { To } from 'react-router-dom'

declare module '@/lib/*'
declare module '@/client/*'
declare module '@/router'
declare module '@/pages/*'
declare module '@/utils/*'
declare module '@/assets/*'
declare module '@/components/*'
declare module '@/common/*'
declare module '*.png'
  declare interface IResponseError {
    message: string;
    code?: number;
    detail?: any;
  }
  declare interface NodeModule {
    cacheable: any,
    resourcePath: string,
    hot: {
      accept(path?: () => void, callback?: () => void): void
    };
  }
  
  declare interface Application {
    config:any
  }

  type RoutConfigType = {
    id?: string,
    path?: string,
    name?: string,
    icon?: any,
    redirect?: To,
    children?: Array<RoutConfigType>,
    element?: React.ReactNode | null,
    showByAuth?:boolean,
  };
  // declare interface Window {
  //   userInfo: IUserInfo
  //   __INITIAL_STATE__: {
  //     env: 'local' | 'test' | 'staging' | 'prod'
  //   },
  //   jsonlint: any
  //   userInfo: IUserInfo,
  //   psdjs: any,
  // }

  declare namespace JSX {
    interface IntrinsicElements {
      'css-doodle': any
    }
  }

