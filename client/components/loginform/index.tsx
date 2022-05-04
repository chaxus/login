/*
 * @Author: ran
 * @Date: 2022-04-19 18:15:57
 * @LastEditors: ran
 * @LastEditTime: 2022-04-27 14:30:23
 */
import React from "react";
import { bindActions, bindState } from "@/lib/redux";
import { connect } from "react-redux";
import Warrning from '@/components/warnning'

interface userInfo {
  name: string,
  password: string
}

const LoginForm = (props: any) => {
  const { post, get } = props;
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
    encryption(JSON.stringify(result))
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
        console.log('---->', token, userstring)
      }

    } catch (error) {

    }
  }
  const valid = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const { value } = e.target
    if (value.length === 0) {

    }
  }
  const logintoken = async (params: Record<string, string>) => {
    try {
      const result = await post("/api/users/logintoken", params);
      const { success, data } = result;
      if (success) {

      }
    } catch (error) {

    }
  }
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
        />
        <Warrning message="Please input your username!"/>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="off"
        />
        <Warrning />
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
