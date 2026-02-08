import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const CustomerDashboard = () => {
  const navigate = useNavigate();
  const handleClickUpdateInfo = () => {
    navigate('/account-update');
  };

  return (
    <div className="customerDashboard">
      <div className="hero-overlay" aria-hidden="true" />
      <div className="content">
        <Row className='justify-content-center'>
          <Col md='10' sm='2'>
            <Form className='updateForm fs-3 p-4'>
              <div className=' my-4'>Account Info</div>
              <button
                type="button"
                onClick={handleClickUpdateInfo}>
                Update Account Info
              </button>
              <Button
                type='button'
                className='btn btn-lg py-4'
              >
                Book an Appointment
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CustomerDashboard