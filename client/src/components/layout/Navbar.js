import React, {Component} from "react";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

class Navbar extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    render() {
        let button = (window.location.pathname !== "/" && window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/dashboard") ?
            <button
                className="col s5 center btn-flat top material-icons small"
                onClick={this.context.router.history.goBack}>
                chevron_left
            </button> : "";

        return (
            <div className="navbar-fixed">
                <nav className="z-depth-0">
                    <div className="nav-wrapper white">
                        {button}
                        <Link
                            to="/"
                            style={{
                                fontFamily: "monospace"
                            }}
                            className="col s5 brand-logo center black-text"
                        >
                            <i className="material-icons">code</i>
                            MERN
                        </Link>
                    </div>
                </nav>
            </div>
        );
    }
}

export default Navbar;
