import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";

class Dashboard extends Component {
    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };


    render() {

        return (

            <div style={{height: "75vh"}} className="container valign-wrapper">
                <div className="row">
                    <div className="landing-copy col s12 center-align">
                        <h4>
                            <b>Hey there</b>
                            <p className="flow-text grey-text text-darken-1">
                                You are logged into{" "}
                                <span style={{fontFamily: "monospace"}}>MERN</span> 👏
                            </p>
                        </h4>
                        <button
                            style={{
                                width: "150px",
                                borderRadius: "3px",
                                marginTop: "1rem"
                            }}
                            onClick={() => this.props.history.push("/expeditions")}
                            className="btn btn-large waves-effect waves-light hoverable accent-3"
                        >
                            Expeditions
                        </button>
                        <button
                            style={{
                                width: "150px",
                                borderRadius: "3px",
                                marginTop: "1rem"
                            }}
                            onClick={() => this.props.history.push("/character")}
                            className="btn btn-large waves-effect waves-light hoverable accent-3"
                        >
                            Character
                        </button>
                        <br></br>
                        <button
                            style={{
                                width: "150px",
                                borderRadius: "3px",
                                letterSpacing: "1.5px",
                                marginTop: "1rem"
                            }}
                            onClick={this.onLogoutClick}
                            className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

Dashboard.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    {logoutUser}
)(Dashboard);
