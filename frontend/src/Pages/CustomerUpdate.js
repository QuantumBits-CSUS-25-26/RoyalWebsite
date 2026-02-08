import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const currentEntries = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "123-456-7890",
    password: "examplePassword"
  }
];

const CustomerUpdate = () => {

  const [ firstName, setFirstName ] = useState(currentEntries[0].firstName);
  const [ lastName, setLastName ] = useState(currentEntries[0].lastName);
  const [ email, setEmail ] = useState(currentEntries[0].email);
  const [ phoneNumber, setPhoneNumber ] = useState(currentEntries[0].phoneNumber);
  const [ password, setPassword] = useState(currentEntries[0].password);

  const [ newFirstName, setNewFirstName ] = useState('');
  const [ newLastName, setNewLastName ] = useState('');
  const [ newEmail, setNewEmail ] = useState('');
  const [ newPhoneNumber, setNewPhoneNumber ] = useState('');
  const [ newPassword, setNewPassword] = useState('');
  const [ newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [ firstNamePlaceHolder, setFirstNamePlaceholder] = useState("Enter First Name Here");
  const [ lastNamePlaceHolder, setLastNamePlaceholder] = useState("Enter Last Name Here");
  const [ emailPlaceHolder, setEmailPlaceholder] = useState("Enter Email Here");
  const [ phoneNumberPlaceHolder, setPhoneNumberPlaceholder] = useState("Enter Phone Number Here");
  const [ passPlaceHolder, setPassPlaceholder] =  useState("Enter Password Here");
  const [ passPlaceHolderConfirm, setPassPlaceholderConfirm] =  useState("Confirm Password Here");

  const [ phoneError, setPhoneError] = useState(false);
  const [ emailError, setEmailError] = useState(false);
  const [ passError, setPassError] = useState(false);
  const [ passMatchError, setPassMatchError] = useState(false);
  

  const validateFirst = (value) => {
    if (!value) {
      setNewFirstName(firstName);
      return "";
    }
    return "";
  }

  const validateLast = (value) => {
    if (!value) {
      setNewLastName(lastName);
      return "";
    }
  }

  const validateEmail = (value) => {
     if (!value) {
      setNewEmail(email);
      return "";
     }
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(value)) {
      setEmailError(true);
      return "Please enter a valid email address.";
     }
     return "";
  }

  const validatePassword = (value) => {
      if (!value) {
        setNewPassword(password);
        return "";
      }
      if (value.length < 8) {
        setPassError(true);
        return "Password must be at least 8 characters.";
      }
      return "";
  };

  const validatePasswordMatch = (value) => {
    if (value !== newPassword) {
      setPassMatchError(true);
      return "Passwords do not match.";
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!value) {
      setNewPhoneNumber(phoneNumber);
      return "";
    }
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError(true);
      return "Please enter a valid phone number (e.g., 123-456-7890).";
    }
  }

  const handleClickUpdate = async(e) => {
    e.preventDefault();

    const emailErrorMsg = validateEmail(newEmail);
    const phoneErrorMsg = validatePhoneNumber(newPhoneNumber);
    const passErrorMsg = validatePassword(newPassword);
    const passMatchErrorMsg = validatePasswordMatch(newPasswordConfirm);

    if (emailError){
      setEmailPlaceholder(emailErrorMsg);
      setNewEmail('');
    }
    if (passError){
      setPassPlaceholder(passErrorMsg);
      setNewPassword('');
    }
    if (passMatchError){
      setPassPlaceholderConfirm(passMatchErrorMsg);
      setNewPasswordConfirm('');
    }
    if (phoneError){
      setPhoneNumberPlaceholder(phoneErrorMsg);
      setNewPhoneNumber('');
    }
    
    if (!emailError && !passError && !passMatchError && !phoneError){
      // make api call to update information in database
      setFirstName(newFirstName);
      setLastName(newLastName);
      setEmail(newEmail);
      setNewPassword(newPassword);
      setNewPasswordConfirm(newPasswordConfirm);
      setNewPhoneNumber(newPhoneNumber);
    } 
      

  }




  return (
    <div className="customerUpdate">
      <div className="title">
        <Row className='justify-content-center'>
          <Col md='10' sm='2'>
            <Form className='updateForm fs-3 p-4'>
              <div className=' my-4'>Update Account Information</div>
              <div className="container" > 
                <div className="contentLeft">
                <FormGroup className='mx-5 px-5 my-5 text-start'>
                  <Label for="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder={firstNamePlaceHolder}
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                  />
                </FormGroup>
                </div>
                <div className="contentRight">
                  <FormGroup className='mx-5 px-5 my-5 text-start'>
                    <Label for="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder={lastNamePlaceHolder}
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                    />
                  </FormGroup>
                </div>
              </div>
              <div className="container" >
                <div className="contentLeft">
                  <FormGroup className='mx-5 px-5 my-4 text-start'>
                    <Label for="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder={emailPlaceHolder}
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </FormGroup>
                </div>
                <div className="contentRight">
                  <FormGroup className='mx-5 px-5 my-4 text-start'>
                    <Label for="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder={phoneNumberPlaceHolder}
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                    />
                  </FormGroup>
                </div>
              </div>  
              <div className="container" >
                <div className="contentLeft">
                  <FormGroup className='mx-5 px-5 my-4 text-start'>
                    <Label for="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      placeholder={passPlaceHolder}
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </FormGroup>
                </div>
                <div className="contentRight">
                  <FormGroup className='mx-5 px-5 my-4 text-start'>
                    <Label for="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      placeholder={passPlaceHolderConfirm}
                      type="password"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    />
                  </FormGroup>
                </div>
              </div> 
              <Button
                type='btn'
                className='btn btn-lg my-4 py-4'
                onClick={handleClickUpdate}
              >
                Update
              </Button> 
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
  
}

export default CustomerUpdate;