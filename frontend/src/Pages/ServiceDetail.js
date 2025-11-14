import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import './Homepage.css';
import ServiceDetailSection from './ServiceDetail/ServiceDetailSection';

const ServiceDetail = () => {
    return (
        <div className="homepage">
            <SideNavbar />
            <div className="homepage-content">

                <ServiceDetailSection />
            </div>
        </div>
    );
}

export default ServiceDetail;