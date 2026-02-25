import '../App.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactInfoS4 = () => {

  return (
    <div className="contact-info-s4">
        <div className="contact-info-header">
            <h1>Contact Information</h1>
        </div>
        
        <div className="contact-info-form">
            <div className="contact-name-info">
                <div className="contact-info-fName">
                    First Name<br/>
                    <input className="contact-info-input"
                        type="text" 
                        name="fname"
                        placeholder="e.g. John"
                    />
                </div>
                <div className="contact-info-lName">
                    Last Name<br/>
                    <input className="contact-info-input"
                        type="text" 
                        name="lName"
                        placeholder="e.g. Doe"
                    />
                </div>
            </div>
            <div className="contact-info-email-phone">
                    <div className="contact-info-email">
                        Email<br/>
                        <input className="contact-info-input"
                            type="email"
                            name="email"
                            placeholder="e.g. john.doe@example.com"
                        />
                    </div>
                    <div className="contact-info-phone">
                        Phone Number<br/>
                        <input className="contact-info-input"
                            type="tel"
                            name="phone"
                            placeholder="e.g. 123-456-7890"
                        />
                    </div>
            </div>
            <div className="contact-info-notif-subBtn">
                <div className="contact-info-notifications">
                    <h1 className="notif-header">Notifications</h1>
                    <input  
                        type="checkbox" id="emailNotif" name="emailNotif" value="emailNotif"/>
                    <label for="emailNotif">  Notify by Email</label><br />
                    <input 
                        type="checkbox" id="textNotif" name="textNotif" value="textNotif"/>
                    <label for="textNotif">  Notify by Text Message</label><br />
                </div>  
                <button className="contact-info-sbmt-btn">Submit</button>
  
            </div>
        </div>
    </div> 
  );
}

export default ContactInfoS4;