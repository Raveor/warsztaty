import React, {Component} from "react";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import {logoutUser} from "../../actions/authActions";
import { createBrowserHistory } from 'history';

class Navbar extends Component {
    static contextTypes = {
        router: PropTypes.object
    };

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {
        let text = {
            fontFamily: "monospace"
        };

        let backButton = (this.context.router.history.length > 1)?<button
                className="btn-flat top material-icons small"
                onClick={this.context.router.history.goBack}>
                chevron_left
            </button>: "";

        let menu = (this.props.auth.isAuthenticated)?
                <div className="nav-wrapper white">
                    {backButton}
                    <span style={{ fontFamily: "monospace" }} className="brand-logo center black-text">
                        <i className="material-icons">code</i> MERN
                    </span>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li>
                            <Link to="/character" className="black-text valign-wrapper">
                                <i className="material-icons small valign">accessibility_new</i>
                                <span style={{ text }}>character</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/expeditions" className="black-text valign-wrapper">
                                <i className="material-icons small valign">directions_run</i>
                                <span style={{ text }}>expeditions</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/fight" className="black-text valign-wrapper">
                                <i className="material-icons small valign">colorize</i>
                                <span style={{ text }}>fight</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/clan/show" className="black-text valign-wrapper">
                                <i className="material-icons small valign">group</i>
                                <span style={{ text }}>clan</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/shop" className="black-text valign-wrapper">
                                <i className="material-icons small valign">shopping_cart</i>
                                <span style={{ text }}>shop</span>
                            </Link>
                        </li>
                        <li>
                            <a href="" onClick={this.onLogoutClick} className="black-text valign-wrapper">
                                <i className="material-icons small valign">exit_to_app</i>
                                <span style={{ text }}>logout</span>
                            </a>
                        </li>
                    </ul>
                </div>: "";

        return (
            <nav className="z-depth-0 white">
                {menu}
            </nav>
        );
    }
}
Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    {logoutUser}
)(Navbar);
