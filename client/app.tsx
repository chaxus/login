/*
 * @Author: ran
 * @Date: 2022-02-11 18:50:08
 * @LastEditors: ran
 * @LastEditTime: 2022-03-01 21:07:17
 */
import React from "react";
import Layout from "@/components/layout";
import { ConfigProvider } from "antd";
import CenterLayout from "@/pages/center";
import zhCN from "antd/lib/locale/zh_CN";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routesComponent } from "@/utils/routes";
import routes from "@/router";
import Painter from "./pages/painter";


export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CenterLayout />} />
          <Route path="/painter" element={<Painter />} />
          <Route path="*" element={<Layout />}>
            {routesComponent({routes})}
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
