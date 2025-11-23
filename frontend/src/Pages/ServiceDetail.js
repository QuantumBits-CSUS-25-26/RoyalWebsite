import React from 'react';
import './Homepage.css';
import ServiceDetailSection from './ServiceDetail/ServiceDetailSection';

const ServiceDetail = () => {
    return (
        <div className="homepage">
            <div className="homepage-content">

                <ServiceDetailSection />
            </div>
        </div>
    );
}

export default ServiceDetail;