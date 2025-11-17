import React, { useState } from "react";
import CalenderSVG from './ContactFooterAssets/Calender.svg';
import CompassSVG from './ContactFooterAssets/Compass.svg';
import PhoneSVG from './ContactFooterAssets/Phone.svg';
import ContactForm from '../ContactForm';
import styles from './ContactFooterStyles.css';


const ContactFooter = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    return (
        <>
         <footer className={styles.box} role="contentinfo" aria-label="Contact us footer">
      <h3 className={styles.contactUsTitle}>Contact Us</h3>

      <div className={styles.textBlock} aria-hidden="false">
        <div className={styles.text}>
          <img src={PhoneSVG} className={styles.icon} alt="" aria-hidden="true" />
          (916) 562-9441
        </div>

        <div className={styles.text}>
          <img src={CompassSVG} className={styles.icon} alt="" aria-hidden="true" />
          2546 Tower Ave, Sacramento, CA 95825
        </div>

        <div className={styles.text}>
          <img src={CalenderSVG} className={styles.icon} alt="" aria-hidden="true" />
          Monday - Friday: 8AM - 5PM | Saturday: 9AM - 4PM
        </div>
      </div>
        <button 
            className={styles.contactFormButton} 
            aria-label="Open contact form"
            onClick={handleOpenForm}
        >
            Contact Form
        </button>
    </footer>
    
    <ContactForm isOpen={isFormOpen} onClose={handleCloseForm} />
    </>
    );
};
export default ContactFooter;




