/*
 * @Author: ran
 * @Date: 2022-05-19 21:22:52
 * @LastEditors: ran
 * @LastEditTime: 2022-05-19 21:41:04
 */
import { renderToString } from 'react-dom/server';
import Home from '../client/app'
import React from 'react';

const content = renderToString(<Home />);
export default content