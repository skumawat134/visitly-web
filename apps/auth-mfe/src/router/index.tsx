import React from 'react';
import {Route, Routes } from 'react-router-dom';
import Home from '../components/Home';
import About from '../components/About';
import Navbar from '../components/Navbar';
import Login from '../Login';

function AppRouter() {
  return (
    
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="login" element={<Login />} />
        <Route path="about" element={<About msg="React" />} />
      </Routes>
   
  );
}

export default AppRouter;
