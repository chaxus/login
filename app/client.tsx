import { renderToString } from 'react-dom/server';
import Home from '../client/app';
import React from 'react';

const content = renderToString(<Home />);
export default content