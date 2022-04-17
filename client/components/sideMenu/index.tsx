/*
 * @Author: ran
 * @Date: 2022-02-20 17:23:38
 * @LastEditTime: 2022-02-28 17:27:23
 * @LastEditors: ran
 */
import React, { useContext, useState, useEffect } from 'react';
import { Menu } from 'antd';
import classnames from 'classnames';
import { useNavigate } from "react-router-dom";
import routes from '@/router';
import Context from '@/lib/context';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    CodepenCircleOutlined,
} from '@ant-design/icons';
const { SubMenu } = Menu;


type State = {
    collapsed: boolean,
    activePath: string,
    openMenu: string[],
    subMenuOptions: any[],
    routeComponent: any[],
    routes: any[],
};
const SideMenu = () => {
    const context:any = useContext(Context)
    const navigate = useNavigate();
    const [state, setState] = useState<State>({
        collapsed: false,
        activePath: '/',
        openMenu: ['/'],
        subMenuOptions: [],
        routeComponent: [],
        routes: [],
    })
    const initData = () => {
        const pathname = context.history?.location?.pathname ?? '路有配置错误';
        const routeComponent = generateMenus(routes);
        setState({...state, activePath: pathname, routeComponent, routes });
    };
    const toggleCollapsed = () => {
        const { collapsed } = state
        setState({
            ...state,
            collapsed: !collapsed,
        });
    };
    useEffect(()=>{
        initData();
    },[state.activePath])
    const changeRoute = (path: string) => {
        context.history.push(path);
        navigate(path, { replace: true });
        setState({
            ...state,
            activePath: path,
        });
        navigate(path, { replace: true });
    };
    const generateMenus = (routesConfig: Array<RoutConfigType>, parentPath?: string) => {
        return routesConfig.map(item => {
            let { path = '', children, name, icon } = item;
            const Icon = icon
            path = `/${path}`
            if (name) {
                if (/^(\/[a-z][A-z])/.test(parentPath ?? '')) {
                    path = `${parentPath}${path}`;
                }
                if (children) {
                    console.log('in', children)
                    const { subMenuOptions } = state;
                    if (!subMenuOptions.includes(path)) {
                        subMenuOptions.push(path);
                        setState({ ...state, subMenuOptions });
                    }
                    return (
                        <SubMenu key={path} title={name}>
                            {generateMenus(children, path)}
                        </SubMenu>
                    );
                }
                return (
                    <Menu.Item key={path} onClick={() => changeRoute(path)}>
                        {icon && <Icon />}
                        <span>{name}</span>
                    </Menu.Item>
                );
            }
            return null
        });
    };
    const { collapsed, activePath, routeComponent, subMenuOptions } = state;
    const openMenu = subMenuOptions.filter(item => activePath.includes(item));
    return (
        <nav className={classnames('side-nav-container', { collapsed })}>
            <header className='logo-box'>
                {collapsed ? <CodepenCircleOutlined /> : '标题'}
            </header>
            <div className='menu-container'>
                <Menu
                    defaultSelectedKeys={[activePath]}
                    defaultOpenKeys={openMenu}
                    selectedKeys={[activePath]}
                    mode="inline"
                    theme="dark"
                    inlineCollapsed={collapsed}
                >
                    {routeComponent}
                </Menu>
            </div>
            <footer className='side-menu-footer'>
                {collapsed
                    ? <MenuUnfoldOutlined onClick={toggleCollapsed} className='button-icon' />
                    : <MenuFoldOutlined onClick={toggleCollapsed} className='button-icon' />
                }
            </footer>
        </nav>
    );
}

export default SideMenu