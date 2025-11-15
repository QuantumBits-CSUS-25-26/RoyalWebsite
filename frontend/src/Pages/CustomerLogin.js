import React from 'react';
import SideNavbar from '../Components/SideNavbar';
import Header from '../Components/Header';
import InfoBar from '../Components/InfoBar';
import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const CustomerLogin = () => {

  const [ email, setEmail ] = useState('');
  const [ password, setPassword] = useState('');

  const navigate = useNavigate();

  return (
    <div className="customerLogin">
      <InfoBar />
      <Header />
      <SideNavbar />
      <div className="content">
        <Row className='justify-content-center'>
          <Col md='5' sm='2'>
            <Form className='customerForm fs-3 p-4'>
              <div className='title my-4'>Account Login</div>
              <FormGroup className='mx-5 px-5 my-5 text-start'>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter Email Here"
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
                  placeholder="Enter Password Here"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>
              <Button
                type="submit"
                className='btn btn-lg my-4 py-4'
                onClick={() => navigate('/dashboard')}
              >
                  Log In
                </Button>
              <div className='border-top border-black border-2 border-opacity-50 w-75 mx-auto my-2'></div>
              <Button
                type='btn'
                className='btn btn-lg my-4 py-4'
                onClick={() => navigate('/')}
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