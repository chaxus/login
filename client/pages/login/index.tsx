/*
 * @Author: ran
 * @Date: 2022-04-19 18:12:04
 * @LastEditors: ran
 * @LastEditTime: 2022-04-20 20:45:52
 */
import React from "react";
import LoginForm from '@/components/loginform'
import Glassback from '@/components/glassback'

const Login = () => {
  return (
    <div className="login">
      <Glassback /> 
      <LoginForm /> 
    </div>
  );
};

export default Login;
