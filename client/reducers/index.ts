/*
 * @Author: your name
 * @Date: 2022-02-19 21:36:33
 * @LastEditTime: 2022-02-20 14:09:22
 * @LastEditors: Please set LastEditors
 */
import { combineReducers } from 'redux';
import { cloneDeep } from 'lodash';
import {
  LOADING,
  SHOWMODAL,
  SET_SCREEN_INFO,
  DRAW_DATA,
  SELECTED_ELEMENT_ID,
} from '../actions/setter';
import { CLEAN_INIT_DATA } from '../actions/clean';
import undoable from 'redux-undo';

const loadingInitState = {
  showLoading: false,
};
const modalInitState = {
  component: null,
};
const reducers = {
  initData: (state = {}, action: { type: any; key: any; }) => {
    const { type, key } = action;
    switch (type) {
      case CLEAN_INIT_DATA:
        return {
          [key]: null,
        };
      default:
        return state;
    }
  },
  screenInfo: (state = {}, action: { [x: string]: any; type: any; }) => {
    const { type, ...rest } = action;
    switch (type) {
      case SET_SCREEN_INFO:
        return {
          ...rest,
        };
      default:
        return state;
    }
  },
  modalState: (state = modalInitState, action: { type: any; options?: {} | undefined; }) => {
    const { type, options = {} } = action;
    switch (type) {
      case SHOWMODAL:
        return {
          ...options,
        };
      default:
        return state;
    }
  },

  loadingState: (state = loadingInitState, action: { [x: string]: any; type: any; }) => {
    const { type, ...rest } = action;
    switch (type) {
      case LOADING:
        return {
          ...rest,
        };
      default:
        return state;
    }
  },
  error: (state = {}) => state,
  selectedElementId: (state = -1, action: { type: any; id: any; }) => {
    const { type, id } = action;
    switch (type) {
      case SELECTED_ELEMENT_ID:
        return id;
      default:
        return state;
    }
  },
  drawData: undoable((state = {}, action) => {
    const { type, options } = action;
    switch (type) {
      case DRAW_DATA:
        return cloneDeep(options);
      default:
        return state;
    }
  }, { limit: 15,filter: (action,currentChange:any, previousHistory) =>{
    return !currentChange.ignore;
  } }),
};

export default combineReducers(reducers);

