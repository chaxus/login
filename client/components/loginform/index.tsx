/*
 * @Author: ran
 * @Date: 2022-04-19 18:15:57
 * @LastEditors: ran
 * @LastEditTime: 2022-04-27 14:30:23
 */
import React from "react";
import { bindActions, bindState } from "@/lib/redux";
import { connect } from "react-redux";

const LoginForm = (props: any) => {
  const { post } = props;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    // post('/api/users/login', { })
    const result:Record<string,string> = {}
    const form = event.target as HTMLFormElement;
    for(const item of form.children){
        const { name, value } = item as HTMLInputElement;
        if(name && value){
            result[name] = value
        }
    }
    login(result)
    event.preventDefault();
    return false
  };
  const login = async (params:Record<string,string>) => {
      try {
          const result = await post("/api/users/login", params);
          const { success, data } = result;
          if(success){
              
          }
      } catch (error) {
          
      }
  }
  return (
    <>
      <form
        className="form"
        onSubmit={submit}
      >
        <h3>Login</h3>
        <label htmlFor="username">用户名</label>
        <input
          type="text"
          placeholder="Username"
          name="name"
          autoComplete="off"
        />

        <label htmlFor="password">密码</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="off"
        />
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
