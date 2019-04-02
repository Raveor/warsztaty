import React from 'react';
import ReactDOM from 'react-dom';

const Login = () => {
    const labelText = "Login From";
    const buttonText = "Login";

    return ( <div className="Login">
                <form>
                    <label htmlFor="login">{labelText}</label>
                    <input id="login" type="text" />
                    <input id="password" type="password" />
                    <button>{buttonText}</button>
                </form>
              </div>
    );
};

export default Login;
