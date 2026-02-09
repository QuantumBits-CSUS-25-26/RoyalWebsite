import '../App.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactInfoS4 = () => {

  return (
    <div className="contact-info-s4">
        <div className="contact-info-header">
            <h1 style={{color: '#2F6DAB'}}>4. </h1>
            <h1 style={{
                color: 'white', 
                backgroundColor:'#2F6DAB', 
                marginLeft: '1vh', 
                padding: '0 1vh 0 1vh' }}>Contact Information</h1>
            {/* <div className="step-4-title">
                Contact Information
            </div> */}
        </div>
        
        <div className="contact-info">
            <div className="contact-info-content">
                <div className="form">
                    <div className="entries">
                        First Name<br />
                        <input className="contact-info-input"
                            type="text" 
                            name="fname"
                            placeholder="First Name"
                        />
                        <br />
                            Email
                        <br />
                        <input className="contact-info-input"
                            type="text"
                            name="email"
                            placeholder="Email"
                        />

                        <div className="notif-check-boxes">
                            <h2 className="notif-header">Notifications</h2>
                            <input  
                                type="checkbox" id="emailNotif" name="emailNotif" value="emailNotif"/>
                            <label for="emailNotif">  Notify by Email</label><br />
                            <input 
                                type="checkbox" id="textNotif" name="textNotif" value="textNotif"/>
                            <label for="textNotif">  Notify by Text Message</label><br />
                        </div>
                    </div>
                    <div className="entries">
                        Last Name<br />
                        <input className="contact-info-input"
                                type="text"
                                name="lname"
                                placeholder="Last Name"
                        />
                        <br />
                        Phone Number<br />
                        <input className="contact-info-input"
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                        />
                        <button className="contact-info-sbmt-btn">
                            Submit
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default ContactInfoS4