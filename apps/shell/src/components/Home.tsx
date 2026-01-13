import React, { useState }  from "react";
import Hero from "./Hero";
import { useAuthStore } from "@visitly/app-store";
// import webpackLogo from "../assets/webpack.png";
// import {Card} from "@repo/ui/card";
const App = () => {

  const [ count, setCount ] = useState(0);
  const increment = () => setCount(count => count + 1);
  const decrement = () => setCount(count => count - 1);
  const LINKS = [
    {
      title: "Docs",
      href: "https://turborepo.com/docs",
      description: "Find in-depth information about Turborepo features and API.",
    },
    {
      title: "Learn",
      href: "https://turborepo.com/docs/handbook",
      description: "Learn more about monorepos with our handbook.",
    },
    {
      title: "Templates",
      href: "https://turborepo.com/docs/getting-started/from-example",
      description: "Choose from over 15 examples and deploy with a single click.",
    },
    {
      title: "Deploy",
      href: "https://vercel.com/new",
      description:
        "Instantly deploy your Turborepo to a shareable URL with Vercel.",
    },
  ];
  const user = useAuthStore();
  console.log("userrrrrrrrr" , user)
  return (
    <>
        <main>
      <div id="app">
        {/* <img alt="Webpack logo" src={webpackLogo} /> */}
        {/* <h1 className="heading">This is the <span>Shell Home </span> page!</h1> */}
        <div className="grid mb-32 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
          {/* {LINKS.map(({ title, href, description }) => (
            <Card href={href} key={title} title={title}>
              {description}
            </Card>
          ))} */}
        </div>
      </div>
    </main>
     <Hero msg="lorem" />
    </>

  );
}


export default App;



