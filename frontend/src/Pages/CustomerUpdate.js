import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';



const CustomerUpdate = () => {


  return (
    <div className="customerUpdate">
      <div className="content">
        <Row className='justify-content-center'>
          <Col md='10' sm='2'>
            <Form className='updateForm fs-3 p-4'>
              <div className=' my-4'>Account Info</div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
  
}

export default CustomerUpdate;