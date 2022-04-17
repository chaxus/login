/*
 * @Author: your name
 * @Date: 2022-02-20 14:07:52
 * @LastEditTime: 2022-02-20 14:07:53
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /poster/client/actions/clean.ts
 */
export const CLEAN_INIT_DATA = 'CLEAN_INIT_DATA';

export function cleanInitData(key: any) {
  return {
    type: CLEAN_INIT_DATA,
    key,
  };
}
