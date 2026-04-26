import '../App.css';
import React from 'react';

const ContactInfoS4 = ({
  contactInfo = {},
  onFieldChange = () => {},
  onNotifChange = () => {},
  onSubmit = () => {},
  submitting = false
}) => {
  const notif = contactInfo.notifPref || { email: false, text: false };

  return (
    <div className="contact-info-s4">
      <div className="contact-info-header" style={{ color: '#ffffff' }}>
        <h1>Contact Information</h1>
      </div>

      <form className="contact-info-form" onSubmit={onSubmit}>
        <div className="contact-name-info">
          <div className="contact-info-fName">
            First Name<br />
            <input
              className="contact-info-input"
              type="text"
              id="contact-fname"
              name="fname"
              value={contactInfo.fname || ''}
              onChange={onFieldChange}
              placeholder="e.g. John"
            />
          </div>

          <div className="contact-info-lName">
            Last Name<br />
            <input
              className="contact-info-input"
              type="text"
              id="contact-lname"
              name="lname"
              value={contactInfo.lname || ''}
              onChange={onFieldChange}
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div className="contact-info-email-phone">
          <div className="contact-info-email">
            Email<br />
            <input
              className="contact-info-input"
              type="email"
               id="contact-email"
              name="email"
              value={contactInfo.email || ''}
              onChange={onFieldChange}
              placeholder="e.g. john.doe@example.com"
            />
          </div>

          <div className="contact-info-phone">
            Phone Number<br />
            <input
              className="contact-info-input"
              type="tel"
              id="contact-phone"
              name="phone"
              value={contactInfo.phone || ''}
              onChange={onFieldChange}
              placeholder="e.g. 123-456-7890"
            />
          </div>
        </div>

        <div className="contact-info-notif-subBtn">
          <div className="contact-info-notifications">
            <h1 className="notif-header">Notifications</h1>

            <input
              type="checkbox"
              id="emailNotif"
              name="email"
              checked={!!notif.email}
              onChange={onNotifChange}
            />
            <label htmlFor="emailNotif"> Notify by Email</label>
            <br />

            <input
              type="checkbox"
              id="textNotif"
              name="text"
              checked={!!notif.text}
              onChange={onNotifChange}
            />
            <label htmlFor="textNotif"> Notify by Text Message</label>
            <br />
          </div>

          <button className="contact-info-sbmt-btn" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactInfoS4;