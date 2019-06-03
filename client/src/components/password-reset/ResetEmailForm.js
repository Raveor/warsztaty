import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { resetEmail } from "../../actions/authActions";
import classnames from "classnames";

class ResetEmail extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      errors: {}
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const data = {
      "email": this.state.email
    };

    this.props.resetEmail(data, ()=>{this.setState({success:true})});
  };

  render() {
    const { errors } = this.state;

    let form = this.state.success ? (<div></div>) : (<form noValidate onSubmit={this.onSubmit}>
      <div className="input-field col s12">
        <input
          onChange={this.onChange}
          value={this.state.email}
          error={errors.email}
          id="email"
          type="email"
          className={classnames("", {
            invalid: errors.email
          })}
        />
        <label htmlFor="email">Email</label>
        <span className="red-text">{errors.email}</span>
      </div>
      <div className="col s12" style={{ paddingLeft: "11.250px" }}>
        <button
          style={{
            width: "150px",
            borderRadius: "3px",
            letterSpacing: "1.5px",
            marginTop: "1rem"
          }}
          type="submit"
          className="btn btn-large waves-effect waves-light hoverable blue accent-3"
        >
          Submit
        </button>
      </div>
    </form>);

    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                Reset password
              </h4>
              <p>{this.state.success ? "Email sent! If you don't see it soon, check your spam folder." : "Enter your account's email address, and we will send you a link to set a new password."}</p>
            </div>
            <div className="input-field col s12">
                <span className="red-text">
                  {(!(Object.entries(errors).length === 0 && errors.constructor === Object)) ? errors.data.message : " " }
                </span>
            </div>
            {form}
          </div>
        </div>
      </div>
    );
  }
}

ResetEmail.propTypes = {
  resetEmail: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { resetEmail }
)(withRouter(ResetEmail));
