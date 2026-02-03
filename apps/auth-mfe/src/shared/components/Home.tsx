import React, { useState }  from "react";
// import webpackLogo from "../assets/webpack.png";

const App = () => {

  const [ count, setCount ] = useState(0);
  const increment = () => setCount(count => count + 1);
  const decrement = () => setCount(count => count - 1);


  return (
    <main data-test-id="auth-mfe-home-root">
      <div id="app">
        {/* <img alt="Webpack logo" src={webpackLogo} /> */}
        <h1 className="heading" data-test-id="auth-mfe-home-title">This is the <span>Auth</span> MFE page!</h1>
      </div>
    </main>
  );
}

export default App;
