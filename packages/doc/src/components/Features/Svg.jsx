import React, { Component } from 'react';
class App extends Component(props) {
  render() {
    return (
      <div className="App">
        <img src={props.src} className="App-logo" alt="logo" />
      </div>
    );
  }
}
export default App;
