import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import NotLoggedIn from './views/NotLoggedIn/NotLoggedIn';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      userToken: ""
    }
  }

  setUser = (id, token) => {
    this.setState({ userId: id, userToken: token })
  }
  
  render() {
    let view;
    if (!this.state.userId) {
      view = <NotLoggedIn onLogin={this.setUser}></NotLoggedIn>;
    } else {
      view = `Logged in as user ${this.state.userId}`;
    }
    return (
      <div className="App">
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
        {view}
      </div>
    );
  }
}

export default App;
