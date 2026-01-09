import React , {lazy} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
import About from '../components/About';
import Navbar from '../components/Navbar';

const Login = React.lazy(() => import("LoginInHost/Login"));


function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />

        <Route path="/about" element={<About msg="React" />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
