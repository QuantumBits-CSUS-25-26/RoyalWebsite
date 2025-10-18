import React from 'react';
import Navbar from '../Components/Navbar';
import AboutServices from '../Components/AboutServices/AboutServices';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <Navbar />
      <div className="homepage-content">
        <AboutServices />
      </div>
    </div>
  );
}

export default Homepage;