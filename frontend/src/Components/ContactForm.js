import React, { useState, useEffect } from 'react';
import { validateContactForm } from './validateContactForm';
import { API_BASE_URL } from '../config';


const ContactForm = ({ isOpen, onClose }) => {

  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/business-info/`)
      .then(res => res.json())
      .then(data => setBusinessInfo(data[0]));
  }, []);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    message: '',
    response: false,
    current_customer: false,
  });

  const [mouseDownTarget, setMouseDownTarget] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateContactForm(formData);

    try {
      if (Object.keys(validationErrors).length === 0) {

        const response = await fetch(`${API_BASE_URL}/api/contact/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Submission failed:', errorData);
          alert('Failed to submit form. Please try again later.');
          return;
        } else {
          alert('Form submitted successfully!');
        }


        if (onClose) {
          onClose();
        }

        setFormData({
          first_name: '',
          last_name: '',
          phone_number: '',
          email: '',
          message: '',
          response: false,
          current_customer: false,
        });

      } else {

        const errorMessages = Object.values(validationErrors).join('\n');
        alert('Please fix the following errors:\n\n' + errorMessages);

      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again later.');

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
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              <br />

              Last Name<br />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
              <br />

              Phone Number<br />
              <input
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
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
                name="response"
                checked={formData.response}
                onChange={handleInputChange}
              /> Response Requested <br />

              <input
                type="checkbox"
                name="current_customer"
                checked={formData.current_customer}
                onChange={handleInputChange}
              /> Current Customer <br />
            </div>
          </div>
          <button type="submit">Submit</button>
        </form>

        <p>
          Or call us at <a href="tel:+19255198710">{businessInfo?.phone}</a><br />
          Find us at {businessInfo?.address} <a href="https://maps.app.goo.gl/nhVarV8tpZaBLSLk8">Open in Maps</a>
        </p>
      </div>
    </div>
  );
}

export default ContactForm;