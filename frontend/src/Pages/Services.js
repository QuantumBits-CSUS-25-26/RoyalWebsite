import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import './Homepage.css';
import ServicesSection from '../Components/Services/ServicesSection';

const Services = () => {
  return (
    <div className="homepage">
      <SideNavbar />
      <div className="homepage-content">

        <ServicesSection />
      </div>
    </div>
  );
}

export default Services;