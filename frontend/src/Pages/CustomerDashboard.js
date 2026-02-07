import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AppSumm from '../Components/AppointmentSummary';

const CustomerDashboard = () => {
  const [showAppointments, setShowAppointments] = useState(false);

  const appointments = [
    { id: 1, name: "Brake Work", description: "Brake inspection", paymentStatus: "Paid" },
    { id: 2, name: "Oil Change", description: "Oil and oil filter replacement", paymentStatus: "Pending" },
    { id: 3, name: "Tune Up", description: "Full vehicle tune up", paymentStatus: "Paid" },
    { id: 4, name: "Brake Work", description: "Brake inspection", paymentStatus: "Paid" },
    { id: 5, name: "Oil Change", description: "Oil and oil filter replacement", paymentStatus: "Pending" },
    { id: 6, name: "Tune Up", description: "Full vehicle tune up", paymentStatus: "Paid" },
    { id: 7, name: "Brake Work", description: "Brake inspection", paymentStatus: "Paid" },
    { id: 8, name: "Oil Change", description: "Oil and oil filter replacement", paymentStatus: "Pending" },
    { id: 9, name: "Tune Up", description: "Full vehicle tune up", paymentStatus: "Paid" },
    { id: 10, name: "Brake Work", description: "Brake inspection", paymentStatus: "Paid" },
    { id: 11, name: "Oil Change", description: "Oil and oil filter replacement", paymentStatus: "Pending" },
    { id: 12, name: "Tune Up", description: "Full vehicle tune up", paymentStatus: "Paid" }
  ];

  
  return (
    <div className="customerDashboard">
      <div className="content">
        <Row className='justify-content-center'>
          <Col md='10' sm='2'>
            <Form className='updateForm fs-3 p-4'>
              <div className=' my-4'>Account Info</div>
            </Form>

            {!showAppointments && ( 
              <button className="appSummBtn"onClick={() => setShowAppointments(true)}>Appointment Summary</button> 
            )} 
              
            {showAppointments && ( 
              <div className="appointment-page-overlay" onClick={() => setShowAppointments(false)} > 
                <AppSumm appointments={appointments} onClose={() => setShowAppointments(false)} /> 
              </div> )}
          </Col>
        </Row>
      </div>
    

    </div>
  );;
};
export default CustomerDashboard;