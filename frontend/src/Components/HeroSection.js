import React from 'react';
import heroImage from '../images/HeroImage.jpg';
import '../App.css';

export default function HeroSection() {
    const style = { backgroundImage: `url(${heroImage})` };
    return (
        <section className="hero" style={style} role="region" aria-label="Hero">
            <div className="hero__overlay" aria-hidden="true" />
            <div className="hero__content">
                <h1 className="hero__title">Royal Auto and Body Repair</h1>
                {/* <p className="hero__subtitle">Your trusted partner in excellence</p> */}
                <button className = "HeroBookingButton">Book an Appointment</button>
            </div>
        </section>
    );
}