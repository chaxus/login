/*
 * @Author: your name
 * @Date: 2022-02-20 14:49:12
 * @LastEditTime: 2022-02-28 17:20:54
 * @LastEditors: ran
 */
import React from 'react'
import loadable from '@loadable/component';
import Loading from '@/components/loading';
 
const page = (component: string) => {
  const Element = loadable(() => import(`@/pages/${component}/index`), {
    fallback: <Loading />,
  });
  return <Element />
} 


const route = [
  {
    path:'/',
    element: page('login'),
    name: '登录页',
  },
  {
    path: 'login',
    element: page('login'),
    name: '登录页',
    showByAuth:true,
  },
]

const routes = [
  ...route,
];
export default routes
