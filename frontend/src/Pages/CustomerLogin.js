import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from "axios";


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

        if (emailErrorMsg || passErrorMsg) {
            setEmailPlaceholder(emailErrorMsg);
            setPassPlaceholder(passErrorMsg);
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/customers/login/",
                {
                    email: email,
                    password: password
                }
            );

            console.log("Login success:", response.data);

            if (response.data.access) {
                localStorage.setItem("authToken", response.data.access);
            }

            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setPassPlaceholder("Invalid email or password");
            setPassword("");
        }
    };

  const navigate = useNavigate();

  return (
    <div className="customerLogin">
      <div className="content">
        <Row className='justify-content-center'>
          <Col md='5' sm='2'>
            <Form className='customerForm fs-3 p-4'>
              <div className=' my-4'><strong>Log In</strong></div>
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
              <FormGroup className='mx-3vh px-5 my-4vh w-150 text-start'>
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
                className='btn btn-lg my-4 py-4 w-50'
                onClick={handleClickLogin}
              >
                  Log In
                </Button>
              <div className="mt-3 mb-4" style={{ fontSize: '1rem' }}>
                <span style={{ color: '#6c757d' }}>Don't have an account? </span>
                <span
                  style={{ color: '#2F6DAB', cursor: 'pointer', fontWeight: 500 }}
                  onClick={handleClickNoAcc}
                >
                  Sign Up
                </span>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CustomerLogin;
