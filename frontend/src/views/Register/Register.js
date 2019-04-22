import React, { Component } from "react";
import PropTypes from "prop-types";

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: ""
        };
    }

    render() {
        let view;
        switch (this.state.view) {
            case "password":
                view = <div>TODO: password register</div>;
                break;

            case "google":
                view = <div>TODO: Google register</div>;
                break;

            case "default":
            default:
                view = (
                    <div>
                        <button
                            onClick={() => this.setState({ view: "password" })}
                        >
                            Register with password
                        </button>
                        <br />
                        <button
                            onClick={() => this.setState({ view: "google" })}
                        >
                            Register with Google
                        </button>
                    </div>
                );
                break;
        }
        return (
            <div>
                {view}
                <br />
                <button onClick={this.props.onCancel}>Cancel</button>
            </div>
        );
    }
}

Register.propTypes = {
    onCancel: PropTypes.func
};

export default Register;
