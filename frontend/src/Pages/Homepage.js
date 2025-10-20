import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import Header from '../Components/Header';
import AboutServices from '../Components/AboutServices/AboutServices';
import HeroSection from '../Components/HeroSection';
import './Homepage.css';

const Homepage = () => {
  return (
    <div className="homepage">
      <SideNavbar />
      <div className="homepage-content">
        <Header />
        <HeroSection />
        <AboutServices />
      </div>
    </div>
  );
}

export default Homepage;