import React from 'react';
import heroImage from '../images/HeroImage.jpg';
import '../App.css';
import { NavLink } from 'react-router-dom';
export default function HeroSection() {
    const style = { backgroundImage: `url(${heroImage})` };
    return (
        <section className="hero" style={style} role="region" aria-label="Hero">
            <div className="hero-overlay" aria-hidden="true" />
            <div className="hero-content">
                <h1 className="hero-title">Royal Auto and Body Repair</h1>
                <NavLink to="/admin/login">
                    <button className = "HeroBookingButton">Book an Appointment</button>
                </NavLink>
            </div>
        </section>
    );
}