import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import AboutServices from '../Components/AboutServices/AboutServices';
import HeroSection from '../Components/HeroSection';
import './Homepage.css';
import Reviews from '../Components/Reviews';
import InfoBar from '../Components/InfoBar';


const Homepage = () => {
  return (
    <div className="homepage">
      <InfoBar />
      <SideNavbar />
      <div className="homepage-content">
        <HeroSection />
        <Reviews />
        <AboutServices />
      </div>
    </div>
  );
}

export default Homepage;