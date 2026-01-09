import React, { useState }  from "react";
// import webpackLogo from "../assets/webpack.png";

const App = () => {

  const [ count, setCount ] = useState(0);
  const increment = () => setCount(count => count + 1);
  const decrement = () => setCount(count => count - 1);


  return (
    <main>
      <div id="app">
        {/* <img alt="Webpack logo" src={webpackLogo} /> */}
        <h1 className="heading">This is the <span>Shell Home </span> page!</h1>
      </div>
    </main>
  );
}

export default App;
