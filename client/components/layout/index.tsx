/*
 * @Author: ran
 * @Date: 2022-02-20 15:41:54
 * @LastEditTime: 2022-02-28 21:04:50
 * @LastEditors: ran
 */
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import routes from "@/router";
import Context from "@/lib/context";
import { RouteProps, RouterProps } from "react-router";
import SideMenu from "@/components/sideMenu";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ModalLoading from "@/components/modalLoading";
import Modal from "@/components/modal";
import { createBrowserHistory } from "history";

type State = {
  routes: any;
  showLoading?: boolean;
  isMenuFetched: boolean;
};

type Props = {
  history: RouterProps & { history: any };
  location: RouteProps & { location: any };
};

const Layout = (props: Props) => {
  const history = createBrowserHistory();
  const [state, updateState] = useState<State>({
    routes,
    showLoading: false,
    isMenuFetched: false,
  });
  // const { userInfo = '' } = window.__INITIAL_STATE__;
  return (
    <Context.Provider
      value={{
        updateState,
        history,
        // userInfo,
        ...state,
      }}
    >
      <div className="layout-container">
        <SideMenu></SideMenu>
        <div className="layout-content-container">
          <Header />
          <section className="layout-content">
            <Outlet />
          </section>
          <Footer />
          <ModalLoading />
        </div>
        <Modal />
      </div>
    </Context.Provider>
  );
};
export default Layout;
