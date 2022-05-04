/*
 * @Author: ran
 * @Date: 2022-04-19 18:15:57
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-05-05 00:41:18
 */
import React, { useState } from "react";
import { bindActions, bindState } from "@/lib/redux";
import { connect } from "react-redux";
import Warrning from '@/components/warnning'
import JSEncrypt from 'jsencrypt'

const LoginForm = (props: any) => {
  const { post, get } = props;
  const [opacity, setOpacity] = useState({
    name:true,
    password:true
  })
  // 表单提交
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    // post('/api/users/login', { })
    const result: Record<string, string> = {}
    const form = event.target as HTMLFormElement;
    for (const item of form.children) {
      const { name, value } = item as HTMLInputElement;
      if (name && value) {
        result[name] = value
      }
    }
    if(result.name && result.password){
      encryption(JSON.stringify(result))
    }
    // logintoken(result)
    event.preventDefault();
    return false
  };
  // 获取加密token，进行加密
  const encryption = async (userstring: string) => {
    try {
      const { success, data } = await get("/api/generate/key ");
      if (success) {
        const { token } = data
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(token);
        const encrypted = encrypt.encrypt(userstring);
        logintoken({token:`${token}#${encrypted}`})
      }

    } catch (error) {

    }
  }
  const valid = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const { value } = e.target
    if (value.length === 0) {
      setOpacity({ ...opacity, name: false})
    }
  }
  const change = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const { value } = e.target
    if (value.length > 0 && !opacity.name) {
      setOpacity({ ...opacity, name: true})
    }
  }
  const passValid = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const { value } = e.target
    if (value.length === 0) {
      setOpacity({ ...opacity, password: false})
    }
  }
  const passChange = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const { value } = e.target
    if (value.length > 0 && !opacity.password) {
      setOpacity({ ...opacity, password: true})
    }
  }
  const logintoken = async (params: Record<string, string>) => {
    try {
      const result = await post("/api/users/logintoken", params);
      console.log('result---->',result)
      const { success, data } = result;
      if (success) {

      }
    } catch (error) {

    }
  }
  const { name, password } = opacity
  return (
    <>
      <form
        className='form'
        onSubmit={submit}
      >
        <h3>Login</h3>
        <label htmlFor="username">用户名</label>
        <input
          id="username"
          type="text"
          placeholder="Username"
          name="name"
          autoComplete="off"
          onBlur={valid}
          onChange={change}
        />
        <Warrning message="Please input your username!" opacity={name}/>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="off"
          onBlur={passValid}
          onChange={passChange}
        />
        <Warrning message="Please input your password!" opacity={password}/>
        <button type="submit">Login</button>
        {/* <div className="social">
                <a href="http://">
                <div className="go"><i className="fas fa-gamepad"></i>游戏</div>
                </a>
                <a href="http://">
                <div className="fb"><i className="far fa-comments"></i>联系</div>
                </a>
            </div> */}
      </form>
    </>
  );
};

export default connect(bindState, bindActions())(LoginForm);
