/*
 * @Author: ran
 * @Date: 2022-02-22 18:00:08
 * @LastEditors: ran
 * @LastEditTime: 2022-02-22 18:02:29
 */
import React, { useState } from "react";
import Context from "@/lib/context";
import { Spin } from "antd";

const Modal = () => {
  const [state, setState] = useState({
    showLoading: false,
  });

  const doNothing = (e: {
    stopPropagation: () => void;
    preventDefault: () => void;
  }) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <Context.Consumer>
      {(value: { showLoading: any }) => {
        const { showLoading } = value;
        return showLoading ? (
          <div className="layout-modal-container" onClick={doNothing}>
            <Spin size="large" tip="加载中" />
          </div>
        ) : null;
      }}
    </Context.Consumer>
  );
};

export default Modal;
