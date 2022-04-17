/*
 * @Author: your name
 * @Date: 2022-02-20 14:50:20
 * @LastEditTime: 2022-02-24 21:03:54
 * @LastEditors: ran
 */
import * as React from 'react';
import { Spin } from 'antd';

export default class Loading extends React.Component {
  render() {
    return (
      <div className="loading-container">
        <Spin
          size="large"
          tip="加载中"
          spinning
          className="loading"
        />
      </div>
    );
  }
}
