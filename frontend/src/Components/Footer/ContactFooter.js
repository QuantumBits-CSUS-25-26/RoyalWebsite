import React, { useState, useEffect } from "react";
import CalenderSVG from './ContactFooterAssets/Calender.svg';
import CompassSVG from './ContactFooterAssets/Compass.svg';
import PhoneSVG from './ContactFooterAssets/Phone.svg';
import ContactForm from '../ContactForm';
import './ContactFooterStyles.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { API_BASE_URL } from '../../config';




const ContactFooter = () => {

  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/business-info/`)
      .then(res => res.json())
      .then(data => setBusinessInfo(data[0]));
  }, []);

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
            {businessInfo?.phone}
          </span>
          <span className='text'>
            <FontAwesomeIcon icon={faMapLocationDot} className="icon" />
            {businessInfo?.address}
          </span>
          <span className='text'>
            <FontAwesomeIcon icon={faClock} className="icon" />
            {businessInfo?.hours}
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




