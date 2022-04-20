/*
 * @Author: ran
 * @Date: 2022-04-19 18:15:57
 * @LastEditors: ran
 * @LastEditTime: 2022-04-20 20:47:25
 */
import React from 'react'

const LoginForm = () => {
    return <form className='form'>
            <h3>Login | 登录</h3>
            <label htmlFor="username">用户名</label>
            <input type="text" placeholder="Email or Phone" id="username" />

            <label htmlFor="password">密码</label>
            <input type="password" placeholder="Password" id="password" />
            <button>登录</button>
            <div className="social">
                {/* <a href="http://"> */}
                <div className="go"><i className="fas fa-gamepad"></i>游戏</div>
                {/* </a> */}
                {/* <a href="http://"> */}
                <div className="fb"><i className="far fa-comments"></i>联系</div>
                {/* </a> */}
            </div>
        </form>
}

export default LoginForm