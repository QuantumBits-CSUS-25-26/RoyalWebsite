import React from 'react';
import './Homepage.css';
import ServicesSection from '../Components/Services/ServicesSection';

const Services = () => {
  return (
    <div className="homepage">
      <div className="homepage-content">

        <ServicesSection />
      </div>
    </div>
  );
}

export default Services;