/*
 * @Author: your name
 * @Date: 2022-02-20 14:08:03
 * @LastEditTime: 2022-02-20 14:40:46
 * @LastEditors: Please set LastEditors
 */
export const LOADING = 'LOADING';
export function setLoading(laodingOptions: any) {
  return {
    type: LOADING,
    ...laodingOptions,
  };
}

export const SHOWMODAL = 'SHOWMODAL';
export function setModal(options: any) {
  return {
    type: SHOWMODAL,
    options,
  };
}

export const SET_SCREEN_INFO = 'SET_SCREEN_INFO';
export function setScreenInfo(info: any) {
  return {
    type: SET_SCREEN_INFO,
    ...info,
  };
}

export const SELECTED_ELEMENT_ID = 'SELECTED_ELEMENT_ID';
export function setSelectedElementId(id: any) {
  return {
    type: SELECTED_ELEMENT_ID,
    id,
  };
}

export const DRAW_DATA = 'DRAW_DATA';
export function setDrawData(options: any) {
  return {
    type: DRAW_DATA,
    options,
  };
}

