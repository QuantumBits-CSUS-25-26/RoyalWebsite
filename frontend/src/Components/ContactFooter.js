import React from "react";
import CalenderSVG from './ContactFooterAssets/Calender.svg';
import CompassSVG from './ContactFooterAssets/Compass.svg';
import PhoneSVG from './ContactFooterAssets/Phone.svg';
import styles from './ContactFooterStyles.css';


const ContactFooter = () => {

    return (
        <div style={styles.bar} role="contentinfo" aria-label="Contact information">
            <div style={styles.container}>
                <div style={styles.block}>
                    <img src={PhoneSVG} alt="" style={styles.icon} aria-hidden="true" />
                    <div style={styles.text}>(916)562-9441</div>
                </div>

                <div style={styles.block}>
                    <img src={CompassSVG} alt="" style={styles.icon} aria-hidden="true" />
                    <div style={styles.text}>2546 Tower Ave, Sacramento, CA 95825</div>
                </div>

                <div style={styles.block}>
                    <img src={CalenderSVG} alt="" style={styles.icon} aria-hidden="true" />
                    <div style={styles.text}>Monday - Friday: 8AM - 5PM | Saturday: 9AM - 4PM</div>
                </div>
            </div>
        </div>
    );
};
export default ContactFooter;




