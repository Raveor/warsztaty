import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";

import {logoutUser, setCurrentUser} from "./actions/authActions";
import {Provider} from "react-redux";
import store from "./store";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import PrivateRoute from "./components/private-route/PrivateRoute";

import "./App.css";
import ExpeditionSelectList from "./components/expeditions/ExpeditionSelectList";
import ExpeditionReportList from "./components/expeditions/ExpeditionReportList";
import Character from "./components/character/Character";
import Shop from "./components/shop/Shop";
import ResetPassword from "./components/password-reset/SetNewPasswordForm";
import ResetEmailForm from "./components/password-reset/ResetEmailForm";
import AdminRoute from "./components/private-route/AdminRoute";
import AdminPanel from "./components/admin/AdminPanel";
import ClanList from "./components/clan/ClanList";
import Clan from "./components/clan/Clan";
import ChatList from "./components/clan/ChatList";

import Fight from "./components/fight/Fight";

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = "./login";
  }
}
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route path="/setNewPassword" component={ResetPassword} />
            <Route exact path="/passwordReset" component={ResetEmailForm} />
            <Switch>
              <PrivateRoute exact path="/expeditions" component={ExpeditionSelectList} />
              <PrivateRoute exact path="/expeditions/reports" component={ExpeditionReportList} />
              <PrivateRoute exact path="/character" component={Character}/>
              <PrivateRoute exact path="/shop" component={Shop}/>
              <PrivateRoute exact path="/clan/show" component={Clan}/>
              <PrivateRoute exact path="/clan/chat" component={ChatList}/>
              <PrivateRoute exact path="/clan" component={ClanList}/>
              <PrivateRoute exact path="/fight" component={Fight}/>
              <AdminRoute exact path="/admin" component={AdminPanel}/>
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
