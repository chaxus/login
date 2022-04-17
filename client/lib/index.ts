/*
 * @Author: ran
 * @Date: 2021-07-13 19:23:10
 * @LastEditTime: 2022-02-28 21:07:09
 * @LastEditors: ran
 */
// @ts-nocheck
import { message } from 'antd';
import { get, post } from './request'

const logout = async () => {
  try {
    await post('/api/logout');
  } catch (e) {
    message.error(e);
  }
}

const getQuery = variable => {
  let search = window.location.href.split('?')[1]
  if (search) {
    let vars = search.split('&')
    let queryObj = {}
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');
      queryObj[pair[0]] = pair[1]
    }
    if (variable) {
      return queryObj[variable]
    }
    return queryObj
  }
  return ''
}

const getUser = () => {
  // const { userInfo } = window.__INITIAL_STATE__;
  const userInfo = 'userName'
  return userInfo
}


const getEnv = () => {
  const { env } = window.__INITIAL_STATE__;
  return env
}

export { logout, getQuery, getUser, getEnv }