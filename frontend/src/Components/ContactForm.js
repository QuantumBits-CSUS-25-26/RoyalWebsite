import React from 'react';

const ContactForm = () => {
  return (
    <div class="contact_form">
      <div class="title">
        Contact Us
      </div>
      <div class="content">
        <div class="entries">
          First Name<br />
          <input type="text" placeholder="First Name"></input><br />
          Last Name<br />
          <input type="text" placeholder="Last Name"></input><br />
          Phone Number<br />
          <input type="text" placeholder="Phone Number"></input><br />
          Email<br />
          <input type="text" placeholder="Email"></input><br />
        </div>
        <div class="entries">
          <br />Comments/ Message<br />
          <textarea placeholder="Comments/ Message" rows="4"></textarea><br />
          <input type="checkbox"></input> Response Requested <br />
          <input type="checkbox"></input> Current Customer <br />
        </div>
      </div>
      <button>Submit</button><br />
      <p>
        Or call us at <a href="tel:+19255198710">(916) 562-9441</a><br />
        Find us at 2546 Tower Ave, Sacramento, CA 95825 <a href="https://maps.app.goo.gl/nhVarV8tpZaBLSLk8">Open in Maps</a>
      </p>
    </div>
  );
}

export default ContactForm;