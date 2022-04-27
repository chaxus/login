/*
 * @Author: ran
 * @Date: 2021-07-13 19:23:10
 * @LastEditTime: 2022-04-27 11:36:59
 * @LastEditors: ran
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
  canUndo: state.drawData.past.length > 1,
  canRedo: state.drawData.future.length > 0,
});
