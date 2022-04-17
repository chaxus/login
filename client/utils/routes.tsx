/*
 * @Author: ran
 * @Date: 2022-02-26 19:29:32
 * @LastEditors: ran
 * @LastEditTime: 2022-02-28 17:19:11
 */
import React from 'react'
import {
    Navigate,
    Route,
  } from "react-router-dom";
type RProps = {
    routes?: RoutConfigType[];
    parentPath?: string;
  };

  const routesComponent = ({ routes }: RProps): any => {
    const arr:RoutConfigType[] = []
    routes?.forEach(item=>{
      const {children } = item
      children ? children.forEach(v=>arr.push(v)) :  arr.push(item)
    })
    return (
      <>
        {arr?.map((item) => {
          let { path = "", element, redirect } = item;
          if (redirect)
            return (
              <Route
                path={path}
                key={path}
                element={<Navigate replace to={redirect} />}
              />
            );
          return <Route key={path} path={path} element={element} />;
        })}
      </>
    );
  };

  export {
    routesComponent
  }