import React, { Component } from "react";
import PropTypes from "prop-types";
import Register from "../Register/Register";

class NotLoggedIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "default",
            message: ""
        };
    }

    setDefaultView = () => {
        this.setState({ view: "default" });
    };

    setRegisterView = () => {
        this.setState({ view: "register" });
    };

    setLoginView = () => {
        this.setState({ view: "login" });
    };

    render() {
        let view;
        switch (this.state.view) {
            case "register":
                view = <Register onCancel={this.setDefaultView} />;
                break;

            case "login":
                view = "TODO: login"; //TODO: login
                break;

            case "default":
            default:
                view = (
                    <div>
                        <button onClick={this.setRegisterView}>Register</button>
                        <button onClick={this.setLoginView}>Login</button>
                    </div>
                );
                break;
        }
        return <div>{view}</div>;
    }
}

NotLoggedIn.propTypes = {
    onLogin: PropTypes.func.isRequired // setting an user
};

export default NotLoggedIn;
