/*
 * @Author: ran
 * @Date: 2021-07-13 19:23:10
 * @LastEditTime: 2022-02-20 15:37:33
 * @LastEditors: Please set LastEditors
 */

import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { bindActionCreators, Dispatch } from 'redux';
import actions from '../actions';


export const bindActions = (extraActions = {}) => (dispatch:Dispatch) => bindActionCreators({
  ...actions.axios,
  ...actions.setter,
  ...UndoActionCreators,
  ...extraActions,
} as any, dispatch);

export const bindState = (state:any) => ({
  ...state,
  drawData: state.drawData.present,
  canUndo: state.drawData.past.length > 1,
  canRedo: state.drawData.future.length > 0,
});
