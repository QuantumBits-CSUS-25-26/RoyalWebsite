import React from 'react';
import AboutServices from '../Components/AboutServices/AboutServices';
import HeroSection from '../Components/HeroSection';
import './Homepage.css';
import Reviews from '../Components/Reviews';
import ContactFooter from '../Components/Footer/ContactFooter';
import ServicesCarousel from '../Components/ServicesCarousel';


const Homepage = () => {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <HeroSection />
        <AboutServices />   
        <ServicesCarousel />     
        <Reviews />
        <ContactFooter />
      </div>
    </div>
  );
}

export default Homepage;