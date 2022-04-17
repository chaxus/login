/*
 * @Author: your name
 * @Date: 2022-02-20 14:49:12
 * @LastEditTime: 2022-02-28 17:20:54
 * @LastEditors: ran
 */
import React from 'react'
import loadable from '@loadable/component';
import Loading from '@/components/loading';
import {
  FileImageOutlined,
  BarChartOutlined,
  SolutionOutlined,
  CodepenOutlined,
  DribbbleOutlined,
  ArrowRightOutlined,
  FileDoneOutlined
} from '@ant-design/icons'
 
const page = (component: string) => {
  const Element = loadable(() => import(`@/pages/${component}/index`), {
    fallback: <Loading />,
  });
  return <Element />
} 

const defaultRoute = [
  {
    name: '数据查看',
    path: 'dashboard',
    icon: BarChartOutlined,
    element: page('dashboard'),
    // element:<Dashboard/>
  },
  {
    name: '生成列表',
    path: 'poster',
    icon: FileImageOutlined,
    element: page('posterList'),
    // element: <PosterList />
  },
  {
    name: '模板管理',
    path: 'template',
    icon: SolutionOutlined,
    element: page('templateList'),
  },
  {
    name: '服务管理',
    path: 'service',
    icon: CodepenOutlined,
    element: page('serviceList'),
  },
  {
    name: '域名白名单',
    path: 'picture-domain',
    icon: DribbbleOutlined,
    element: page('picDomain'),
  },
  {
    path: 'painter',
    element: page('painter'),
  },
];

const centerRoute = [
  {
    name: '用户端',
    path: '',
    icon: ArrowRightOutlined,
  },
  {
    path: 'center',
    children: [{
      path: 'design',
      element: page('center/design')
    }, {
      path: 'material',
      element: page('center/material')
    }]
  }
]

const logRoute = [
  {
    path: 'logService',
    element: page('logService'),
    name: '日志服务',
    showByAuth:true,
    icon:FileDoneOutlined
  },
]

const routes = [
  ...defaultRoute,
  ...centerRoute,
  ...logRoute,
];
export default routes
