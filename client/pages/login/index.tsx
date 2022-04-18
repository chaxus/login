import React from 'react'

const Login = () => {

    return <div className='login'>
        <div className="g-bg">
            <div className="g-polygon g-polygon-1"></div>
            <div className="g-polygon g-polygon-2"></div>
            <div className="g-polygon g-polygon-3"></div>
        </div>
        <div className="background">
            <div className="shape"></div>
            <div className="shape"></div>
        </div>

        <form>
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


    </div>
}

export default Login