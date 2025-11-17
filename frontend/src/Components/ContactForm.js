import React, { useState } from 'react';
import { validateContactForm } from './validateContactForm';

const ContactForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    phone: '',
    email: '',
    message: '',
    responseRequested: false,
    currentCustomer: false
  });

  const [mouseDownTarget, setMouseDownTarget] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateContactForm(formData);
    
    if (Object.keys(validationErrors).length === 0) {
      
      alert('Form submitted successfully!');
      
      
      if (onClose) {
        onClose();
      }
      
      
      setFormData({
        fname: '',
        lname: '',
        phone: '',
        email: '',
        message: '',
        responseRequested: false,
        currentCustomer: false
      });
      
    } else {
      
      const errorMessages = Object.values(validationErrors).join('\n');
      alert('Please fix the following errors:\n\n' + errorMessages);

    }
  };

  
  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    setMouseDownTarget(e.target);
  };

  // Only close if both mousedown and mouseup happen outside box thing
  const handleMouseUp = (e) => {
    if (e.target.className === 'contact-form-overlay' && 
        mouseDownTarget?.className === 'contact-form-overlay') {
      onClose();
    }
    setMouseDownTarget(null);
  };

  return (
    <div 
      className="contact-form-overlay" 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="contact_form">
        <div className="title">
          Contact Us
        </div>
      <form onSubmit={handleSubmit}>
        <div className="content">
          <div className="entries">
            First Name<br />
            <input 
              type="text" 
              name="fname"
              placeholder="First Name"
              value={formData.fname}
              onChange={handleInputChange}
            />
            <br />
            
            Last Name<br />
            <input 
              type="text" 
              name="lname"
              placeholder="Last Name"
              value={formData.lname}
              onChange={handleInputChange}
            />
            <br />
            
            Phone Number<br />
            <input 
              type="text" 
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <br />
            
            Email<br />
            <input 
              type="text" 
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <br />
          </div>
          <div className="entries">
            <br />Comments/ Message<br />
            <textarea 
              name="message"
              placeholder="Comments/ Message" 
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
            />
            <br />
            
            <input 
              type="checkbox"
              name="responseRequested"
              checked={formData.responseRequested}
              onChange={handleInputChange}
            /> Response Requested <br />
            
            <input 
              type="checkbox"
              name="currentCustomer"
              checked={formData.currentCustomer}
              onChange={handleInputChange}
            /> Current Customer <br />
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
      
      <p>
        Or call us at <a href="tel:+19255198710">(916) 562-9441</a><br />
        Find us at 2546 Tower Ave, Sacramento, CA 95825 <a href="https://maps.app.goo.gl/nhVarV8tpZaBLSLk8">Open in Maps</a>
      </p>
      </div>
    </div>
  );
}

export default ContactForm;