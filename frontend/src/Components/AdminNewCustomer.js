import React, { useState } from 'react';


const AdminNewCustomer = ({ isOpen, onClose }) => {
  
  //temp values for validation
  const [ fName, setFName ] = useState("");
  const [ lName, setLName ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ phoneNumber, setPhoneNumber ] = useState("");

  const [ fNamePlaceHolder, setFNamePlaceholder] = useState("Enter Customer's First Name Here");
  const [ lNamePlaceHolder, setLNamePlaceholder] = useState("Enter Customer's Last Name Here");
  const [ emailPlaceHolder, setEmailPlaceholder] = useState("Enter Customer's Email Here");
  const [ phoneNumberPlaceHolder, setPhoneNumberPlaceholder] = useState("Enter Customer's Phone Number Here");

  const [ fNameError, setFNameError ] = useState(false);
  const [ lNameError, setLNameError ] = useState(false);
  const [ phoneError, setPhoneError] = useState(false);
  const [ emailError, setEmailError] = useState(false);

  // validated values to send to backend
  const [ validatedFName, setValidatedFName ] = useState("");
  const [ validatedLName, setValidatedLName ] = useState("");
  const [ validatedEmail, setValidatedEmail ] = useState("");
  const [ validatedPhone, setValidatedPhone ] = useState("");




  const [mouseDownTarget, setMouseDownTarget] = useState(null);


  const ValidateFirstName = (value) => {
    if (!fName) {
      setFNameError(true);
      return "Please enter a first name.";

    } 
    else if (!/^[\p{L}\s\-'.]+$/u.test(fName)) {
        setFNameError(true);
        return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    else {
      return "";
    }
  }
  const ValidateLastName = (value) => {
    if (!lName) {
      setLNameError(true);
      return "Please enter a last name.";
    } 
    else if (!/^[\p{L}\s\-'.]+$/u.test(lName)) {
        setLNameError(true);
        return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    else {
      return "";
    }
  }
  const validatePhoneNumber = (value) => {
    if (!phoneNumber) {
      setPhoneError(true);
      return "Please enter a phone number.";
    }
    else {
      // Remove all chars except plus signs and digits, and then check for misplaced or duplicate plus signs
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      
      if (cleanPhone.includes('+')) {
          const plusCount = (cleanPhone.match(/\+/g) || []).length;
          if (plusCount > 1 || !cleanPhone.startsWith('+')) {
              setPhoneError(true);
              return "Please enter a valid phone number."; 
          }
      }
      if (cleanPhone.startsWith('+1') && cleanPhone.length === 12) {
          // +1 followed by exactly 10 digits: valid US number

      } 
      else if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
        // 1 followed by exactly 10 digits: valid US number
      } 
      else if (cleanPhone.startsWith('+')) {
        // International numbers
        const digitsAfterPlus = cleanPhone.slice(1);
        if (digitsAfterPlus.length < 7 || digitsAfterPlus.length > 15) {
          setPhoneError(true);
          return "Please enter a valid phone number."; 
        }
        //fine otherwise
      } 
      else if (cleanPhone.length === 7) {
        setPhoneError(true);
        return "Please include area code";
      } 
      else if (cleanPhone.length === 10) {
        // 10 digits: valid US number
        return "";
      } 
      else {
        setPhoneError(true);
        return "Please enter a valid phone number";
      }
    }
  }
  const validateEmail = (value) => {
    if (!value) {
    setEmailError(true);
    return "Please enter an email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
    setEmailError(true);
    return "Please enter a valid email address.";
    }
    else {
      return "";
    }
  }


  const handleSubmit = async(e) => {
    e.preventDefault();
    const fNameErrorMsg = ValidateFirstName(fName);
    const lNameErrorMsg = ValidateLastName(lName);
    const phoneErrorMsg = validatePhoneNumber(phoneNumber);
    const emailErrorMsg = validateEmail(email);
    
    if (fNameError){
      setFNamePlaceholder(fNameErrorMsg);
      setFName('');
    }
    if (lNameError){
      setLNamePlaceholder(lNameErrorMsg);
      setLName('');
    }
    if (emailError){
      setEmailPlaceholder(emailErrorMsg);
      setEmail('');
    }
    if (phoneError){
      setPhoneNumberPlaceholder(phoneErrorMsg);
      setPhoneNumber('');
    }

    if (!fNameError && !lNameError && !emailError && !phoneError){
      // make api call to update information in database
      setValidatedFName(fName);
      setValidatedLName(lName);
      setValidatedEmail(email);
      setValidatedPhone(phoneNumber);

    }

  }

  
  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    setMouseDownTarget(e.target);
  };

  // Only close if both mousedown and mouseup happen outside box thing
  const handleMouseUp = (e) => {
    if (e.target.className === 'customer-list-popup-overlay' && 
        mouseDownTarget?.className === 'customer-list-popup-overlay') {
      onClose();
    }
    setMouseDownTarget(null);
  };

  return (
    <div 
      className="customer-list-popup-overlay" 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="customer-list-popup">
        <div className="title">
          Add New Customer
        </div>
      <form onSubmit={handleSubmit}>
        <div className="content">
          <div className="entries">
            First Name<br />
            <input 
              type="text" 
              name="fname"
              placeholder={fNamePlaceHolder}
              value={fName}
              onChange={(e) => setFName(e.target.value)}
            />
            <br />
            
            Last Name<br />
            <input 
              type="text" 
              name="lname"
              placeholder={lNamePlaceHolder}
              value={lName}
              onChange={(e) => setLName(e.target.value)}
            />
            <br />
            
            Phone Number<br />
            <input 
              type="text" 
              name="phone"
              placeholder={phoneNumberPlaceHolder}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <br />
            
            Email<br />
            <input 
              type="text" 
              name="email"
              placeholder={emailPlaceHolder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
      </div>
    </div>
  );
}

export default AdminNewCustomer;