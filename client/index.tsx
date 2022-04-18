/*
 * @Author: ran
 * @Date: 2022-02-11 18:50:32
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-20 14:10:46
 */
import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { Provider } from "react-redux";
import createStore from "./store";

const store = createStore({})

const app = document.querySelector("#app") as Element
const root = createRoot(app)

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

if (module.hot) {
  module.hot.accept();
}
