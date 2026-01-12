// import React , {lazy} from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
// import About from '../components/About';
// import Navbar from '../components/Navbar';

// const AuthMFE = React.lazy(() => import("AuthMFE/AppRouter"));


// function AppRouter() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         {/* <Route path="/" element={<Home />} /> */}
//         <Route path="/auth/*" element={<AuthMFE />} />
//         <Route path="/about" element={<About msg="React" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default AppRouter;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';
import AuthMFE from '../mfe/AuthMFE';
import NavBar from '../components/Navbar';

// const AuthMFE = React.lazy(() => import('AuthM FE/AppRouter'));

function AppRouter() {
  return (
    <>
    <BrowserRouter>
    <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/*" element={<AuthMFE />} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default AppRouter;
