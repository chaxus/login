/*
 * @Author: ran
 * @Date: 2022-02-20 17:47:42
 * @LastEditTime: 2022-02-24 22:37:13
 * @LastEditors: ran
 */
import React, { useContext } from 'react';
import Context from '@/lib/context';
import { logout } from '@/lib/index'
import {
  Dropdown,
  Menu,
} from 'antd';
import {
  WindowsOutlined,
} from '@ant-design/icons';

const RenderMenu = () => {
    return (
      <Menu>
        <Menu.Item>
          <div className='menu-item' onClick={logout}>退出系统</div>
        </Menu.Item>
      </Menu>
    );
  };
const Header = () => {
    // const context:any = useContext(Context)
    // const { userName } = context.userInfo;
    const getRouteOptions = (routeCofnig: RoutConfigType[], parentPath?: string, initOptions?: Record<string,any>):any => {
        if (!initOptions) {
          initOptions = {};
        }
        for (let i = 0, j = routeCofnig.length; i < j; i++) {
          const item = routeCofnig[i];
          let { path, name, children } = item;
          if (/^(\/[a-z][A-z])/.test(parentPath ?? '')) {
            path = `${parentPath}${path}`;
          }
          if (children && children.length) {
            return getRouteOptions(children, path, initOptions);
          }
          initOptions[path ?? ''] = name;
        }
      };
     
    return (
        <Context.Consumer>
          { () => {
            return (
              <header className='layout-header-container'>
                <div className='left-container'></div>
                <div className='user-info-container'>
                  <div>你好！{'userName'}</div>
                  <Dropdown overlay={RenderMenu} placement="bottomCenter">
                    <div className='menu-icon-container'>
                      <WindowsOutlined className='menu-icon' />
                    </div>
                  </Dropdown>
                </div>
              </header>);
          }}
        </Context.Consumer>
      );
}
export default Header