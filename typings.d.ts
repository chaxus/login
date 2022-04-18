/*
 * @Author: ran
 * @Date: 2022-01-30 23:01:57
 * @LastEditors: ran
 * @LastEditTime: 2022-02-28 17:20:13
*/

declare module '@/lib/*'
declare module '@/client/*'
declare module '@/router'
declare module '@/pages/*'
declare module '@/utils/*'
declare module '@/assets/*'
declare module '@/components/*'
declare module '@/common/*'
declare module '*.png'
declare global {
    interface IResponseError {
      message: string;
      code?: number;
      detail?: any;
    }
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
    redirect?: H.LocationDescriptor,
    children?: Array<RoutConfigType>,
    element?: React.ReactNode | null,
    showByAuth?:boolean,
  };
  declare interface Window {
    userInfo: IUserInfo
    __INITIAL_STATE__: {
      env: 'local' | 'test' | 'staging' | 'prod'
    },
    jsonlint: any
    userInfo: IUserInfo,
    psdjs: any,
  }

