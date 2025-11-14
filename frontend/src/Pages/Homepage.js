import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import Header from '../Components/Header';
import AboutServices from '../Components/AboutServices/AboutServices';
import HeroSection from '../Components/HeroSection';
import './Homepage.css';
import Reviews from '../Components/Reviews';
import ContactFooter from '../Components/Footer/ContactFooterr';

const Homepage = () => {
  return (
    <div className="homepage">
      <SideNavbar />
      <div className="homepage-content">
        <Header />
        <HeroSection />
        <Reviews />
        <AboutServices />
        <ContactFooter />
      </div>
    </div>
  );
}

export default Homepage;