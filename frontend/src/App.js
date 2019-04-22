import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import NotLoggedIn from './views/NotLoggedIn/NotLoggedIn';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: null}
  }
  
  render() {
    let view = <NotLoggedIn></NotLoggedIn>
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
