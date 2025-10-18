import React from 'react';
import Navbar from '../Components/Navbar';
import Header from '../Components/Header';
import AboutServices from '../Components/AboutServices/AboutServices';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <Header />
      <Navbar />
      <div className="homepage-content">
        <AboutServices />
      </div>
    </div>
  );
}

export default Homepage;