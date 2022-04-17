/*
 * @Author: your name
 * @Date: 2022-02-20 15:06:19
 * @LastEditTime: 2022-03-01 00:26:58
 * @LastEditors: Please set LastEditors
 */
import React, { useContext, useState, useEffect } from "react";
import { To, useNavigate, Routes, Route } from "react-router-dom";
import Context from "@/lib/context";
import { logout, getUser } from "@/lib/index";
import { Menu, Dropdown } from "antd";
import { LogoutOutlined, AntDesignOutlined } from "@ant-design/icons";
import Design from "./design";
import Material from "./material";

const MenuItem = Menu.Item;

const CenterLayout = () => {
  const context: any = useContext(Context);
  const navigate = useNavigate();
  const [state, setState] = useState({
    activePath: "",
  });
  const toPage = (path: To) => {
    navigate(path, { replace: true });
  };

  const initPath = () => {
    const pathname = context.history?.location?.pathname ?? "路有配置错误";
    setState({ activePath: pathname });
  };

  const changeRoute = (path: any) => {
    toPage(path);
    setState({
      activePath: path,
    });
  };
  useEffect(() => {
    initPath();
  }, []);
  const { activePath } = state;
  const menu = (
    <Menu>
      <MenuItem>
        <div
          className="header-menu-item-container"
          onClick={() => toPage("/template")}
        >
          <AntDesignOutlined />
          <div className="menu-text">前往管理后台</div>
        </div>
      </MenuItem>
      <MenuItem>
        <div className="header-menu-item-container" onClick={logout}>
          <LogoutOutlined />
          <div className="menu-text">退出</div>
        </div>
      </MenuItem>
    </Menu>
  );
  return (
    <div className="usercenter-layout-container">
      <div className="header">
        <div className="header-container">
          <div className="logo" />
          <div className="navigation-right">
            <Dropdown overlay={menu}>
              <span className="username">{`你好！ ${getUser().userName}`}</span>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="content-container">
        <div className="menu-container">
          <Menu
            mode="inline"
            className="sidebar"
            defaultSelectedKeys={[activePath]}
            selectedKeys={[activePath]}
          >
            <MenuItem key="/" onClick={() => changeRoute("/")}>
              我的设计
            </MenuItem>
            <MenuItem
              key="material"
              onClick={() => changeRoute("material")}
            >
              我的素材
            </MenuItem>
          </Menu>
        </div>
        <div className="main-container">
          <Routes>
            <Route path="/" element={<Design />} />
            <Route path="material" element={<Material />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
export default CenterLayout;
