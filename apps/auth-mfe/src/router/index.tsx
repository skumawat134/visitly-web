import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
import About from '../components/About';
import Navbar from '../components/Navbar';
import Login from '../Login';

function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About msg="React" />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
