/*
 * @Author: ran
 * @Date: 2022-02-11 18:50:08
 * @LastEditors: ran
 * @LastEditTime: 2022-03-01 21:07:17
 */
import React from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import { routesComponent } from "./utils/routes";
import routes from "@/router";


export default function App() {
  return (
      <BrowserRouter>
        <Routes>
            {routesComponent({routes})}
        </Routes>
      </BrowserRouter>
  );
}
