import React, { useState } from "react";
import CalenderSVG from './ContactFooterAssets/Calender.svg';
import CompassSVG from './ContactFooterAssets/Compass.svg';
import PhoneSVG from './ContactFooterAssets/Phone.svg';
import ContactForm from '../ContactForm';
import './ContactFooterStyles.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";




const ContactFooter = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="footer mx-auto">
      <footer className='box' role="contentinfo" aria-label="Contact us footer">
        <h3 className='contactUsTitle'>Contact Us</h3>
        <div className='textblock'>
          <span className='text phone'>
            <img src={PhoneSVG} className='icon' alt="" aria-hidden="true" />
            (916) 562-9441
          </span>
          <span className='text'>
            <FontAwesomeIcon icon={faMapLocationDot} className="icon" />
            2546 Tower Ave, Sacramento, CA 95825
          </span>
          <span className='text'>
            <FontAwesomeIcon icon={faClock} className="icon" />
            Monday - Friday: 8AM - 5PM
            <span className="pipe"> | </span>
            <br className="mobileBreakpoint" />
            <span className="mobileSpacing">Saturday: 9AM - 4PM</span>
          </span>
        </div>
        <button
          className='contactFormButton'
          aria-label="Open contact form"
          onClick={handleOpenForm}
        >
          Contact Form
        </button>
      </footer>

      <ContactForm isOpen={isFormOpen} onClose={handleCloseForm} />
    </div>
  );
};
export default ContactFooter;




