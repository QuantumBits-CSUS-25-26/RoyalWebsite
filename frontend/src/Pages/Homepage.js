import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import Header from '../Components/Header';
import AboutServices from '../Components/AboutServices/AboutServices';
import HeroSection from '../Components/HeroSection';
import './Homepage.css';
import Reviews from '../Components/Reviews';
import InfoBar from '../Components/InfoBar';


const Homepage = () => {
  return (
    <div className="homepage">
      <SideNavbar />
      <div className="homepage-content">
        <InfoBar />
        <Header />
        <HeroSection />
        <Reviews />
        <AboutServices />
      </div>
    </div>
  );
}

export default Homepage;