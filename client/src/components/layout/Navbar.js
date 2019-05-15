import React, { Component } from "react";
import { Link } from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import {logoutUser} from "../../actions/authActions";
import PropTypes from "prop-types";

class Navbar extends Component {
    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {
      return (
          <div className="navbar-fixed ">
              <nav className="z-depth-0">
                  <div className="nav-wrapper teal lighten-2">
                      <Link to="/"
                            style={{fontFamily: "monospace"}}
                            className="col s5 brand-logo black-text" >
                          <i className="material-icons">code</i>
                          MERN
                      </Link>
                      <ul id="nav-mobile" className="right hide-on-med-and-down black-text">
                          <li><a href="/walka">Walka</a></li>
                          <li><a href="" onClick={this.onLogoutClick}>Logout</a></li>
                      </ul>
                  </div>
              </nav>
          </div>
      );
    }
}
Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(Navbar);;
