import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const CustomerLogin = () => {

  const [ email, setEmail ] = useState('');
  const [ password, setPassword] = useState('');
  const [ emailPlaceHolder, setEmailPlaceholder] = useState("Enter Email Here");
  const [ passPlaceHolder, setPassPlaceholder] =  useState("Enter Password Here");
  const [ emailError, setEmailError] = useState(false);
  const [ passError, setPassError] = useState(false);

  const validateEmail = (value) => {
     if (!value) {
      setEmailError(true);
      return "Email is required.";
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
        setPassError(true);
        return "Password is required.";
      }
      if (value.length < 8) {
        setPassError(true);
        return "Password must be at least 8 characters.";
      }
      return "";
  };

  const handleClickNoAcc = () => {
    navigate('/account-creation');
  }

  const handleClickLogin = async (e) => {
    e.preventDefault();

    const emailErrorMsg = validateEmail(email);
    const passErrorMsg = validatePassword(password);

    if (emailError){
      setEmailPlaceholder(emailErrorMsg);
      setEmail('');
    }
    if (passError){
      setPassPlaceholder(passErrorMsg);
      setPassword('');
    }
    
  }


  const navigate = useNavigate();

  return (
    <div className="customerLogin">
      <div className="content">
        <Row className='justify-content-center'>
          <Col md='5' sm='2'>
            <Form className='customerForm fs-3 p-4'>
              <div className=' my-4'>Account Login</div>
              <FormGroup className='mx-5 px-5 my-5 text-start'>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder={emailPlaceHolder}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
              <FormGroup className='mx-5 px-5 my-4 text-start'>
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder={passPlaceHolder}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>
              <Button
                type="submit"
                className='btn btn-lg my-4 py-4'
                onClick={handleClickLogin}
              >
                  Log In
                </Button>
              <div className='border-top border-black border-2 border-opacity-50 w-75 mx-auto my-2'></div>
              <Button
                type='btn'
                className='btn btn-lg my-4 py-4'
                onClick={handleClickNoAcc}
              >
                Create New Account
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CustomerLogin;