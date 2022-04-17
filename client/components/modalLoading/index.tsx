/*
 * @Author: ran
 * @Date: 2022-02-20 17:58:24
 * @LastEditTime: 2022-02-22 17:52:15
 * @LastEditors: ran
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Spin } from 'antd';

interface IState {
  showLoading: boolean;
}

const ModalLoading = () => {
    const [state, setState] = useState({
        showLoading: false,
      })
    const { showLoading } = state
    if (showLoading) {
      return (
        <div className="modal-loading-container">
          <Spin
            size="large"
            tip="加载中"
            spinning
            className="loading"
          />
        </div>
      )
    }
    return null
}
export default connect((state) => state)(ModalLoading)