import React from 'react';
import heroImage from '../images/HeroImage.jpg';
import '../App.css';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';


export default function HeroSection() {
    const [businessInfo, setBusinessInfo] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/business-info/`)
            .then(res => res.json())
            .then(data => setBusinessInfo(data[0]))
            .catch(() => setBusinessInfo(null));
    }, []);
    const style = { backgroundImage: `url(${heroImage})` };

    return (
        <section className="hero" style={style} role="region" aria-label="Hero">
            <div className="hero-overlay" aria-hidden="true" />
            <div className="hero-content">
                <h1 className="hero-title">{businessInfo?.name || 'Royal Auto and Body Repair'}</h1>
                <NavLink to="/admin">
                    <button className="HeroBookingButton">Book an Appointment</button>
                </NavLink>
            </div>
        </section>
    );
}
