import "./Homepage.css";
import "../App.css";
import { Row, Col, Button, Form, FormGroup, Label } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppSumm from "../Components/AppointmentSummary";

const CustomerDashboard = () => {
  const [showAppointments, setShowAppointments] = useState(false);

  const appointments = [
    {
      id: 1,
      name: "Brake Work",
      description: "Brake inspection",
      paymentStatus: "Paid",
    },
    {
      id: 2,
      name: "Oil Change",
      description: "Oil and oil filter replacement",
      paymentStatus: "Pending",
    },
    {
      id: 3,
      name: "Tune Up",
      description: "Full vehicle tune up",
      paymentStatus: "Paid",
    },
    {
      id: 4,
      name: "Brake Work",
      description: "Brake inspection",
      paymentStatus: "Paid",
    },
    {
      id: 5,
      name: "Oil Change",
      description: "Oil and oil filter replacement",
      paymentStatus: "Pending",
    },
    {
      id: 6,
      name: "Tune Up",
      description: "Full vehicle tune up",
      paymentStatus: "Paid",
    },
    {
      id: 7,
      name: "Brake Work",
      description: "Brake inspection",
      paymentStatus: "Paid",
    },
    {
      id: 8,
      name: "Oil Change",
      description: "Oil and oil filter replacement",
      paymentStatus: "Pending",
    },
    {
      id: 9,
      name: "Tune Up",
      description: "Full vehicle tune up",
      paymentStatus: "Paid",
    },
    {
      id: 10,
      name: "Brake Work",
      description: "Brake inspection",
      paymentStatus: "Paid",
    },
    {
      id: 11,
      name: "Oil Change",
      description: "Oil and oil filter replacement",
      paymentStatus: "Pending",
    },
    {
      id: 12,
      name: "Tune Up",
      description: "Full vehicle tune up",
      paymentStatus: "Paid",
    },
  ];

  const navigate = useNavigate();
  const handleClickUpdateInfo = () => {
    navigate("/account-update");
  };

  return (
    <div className="customerDashboard">
      <div className="content">
        <Row className="justify-content-center">
          <Col md="10" sm="2">
            <Form className="updateForm fs-3 p-4">
              <div className=" my-4">Account Info</div>
              <Row>
                <Col md="6" sm="12">
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label for="name">Account Owner:</Label>
                      <div className="info-text">John Doe</div>
                    </FormGroup>
                    <FormGroup>
                      <Label for="email">Email:</Label>
                      <div className="info-text">JohnDoe@email.com</div>
                    </FormGroup>
                    <FormGroup>
                      <Label for="phone">Phone Number:</Label>
                      <div className="info-text">555-123-4567</div>
                    </FormGroup>
                  </div>
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label for="appts">Appointments:</Label>
                      <div className="info-text">
                        <Row>
                          <Col md="4" sm="6">
                            <div className="apptsPlateLabel">Date</div>
                            <div className="apptText">10/15/2025</div>
                            <div className="apptText">09/12/2025</div>
                          </Col>
                          <Col md="4" sm="6">
                            <div className="apptsPlateLabel">Time</div>
                            <div className="apptText">10:00 AM</div>
                            <div className="apptText">11:00 AM</div>
                          </Col>
                          <Col md="4" sm="12">
                            <div className="apptsPlateLabel">Service</div>
                            <div className="apptText">Brake Inspection</div>
                            <div className="apptText">Oil Change</div>
                          </Col>
                        </Row>
                      </div>
                    </FormGroup>
                  </div>
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label for="vehicles">Vehicles:</Label>
                      <div className="info-text">
                        <Row className="vehiclesRow">
                          <Col md="3" sm="6" className="vehiclesCol">
                            <div className="apptsPlateLabel">Make</div>
                            <div className="plateText">Toyota</div>
                            <div className="plateText">Honda</div>
                          </Col>
                          <Col md="3" sm="6" className="vehiclesCol">
                            <div className="apptsPlateLabel">Model</div>
                            <div className="plateText">Camry</div>
                            <div className="plateText">Civic</div>
                          </Col>
                          <Col md="3" sm="6" className="vehiclesCol">
                            <div className="apptsPlateLabel">Year</div>
                            <div className="plateText">2020</div>
                            <div className="plateText">2018</div>
                          </Col>
                          <Col md="3" sm="6" className="vehiclesCol">
                            <div className="apptsPlateLabel">Plate</div>
                            <div className="plateText">ABC123</div>
                            <div className="plateText">XYZ789</div>
                          </Col>
                        </Row>
                      </div>
                    </FormGroup>
                  </div>
                </Col>
                <Col md="6" sm="12" className="buttonsCol">
                  <Row className="mb-4">
                    <Button type="button" onClick={handleClickUpdateInfo} className="btn btn-lg py-4">
                      Update Account Info
                    </Button>
                  </Row>
                  <Row className="mb-4">
                    <Button type="button" className="btn btn-lg py-4">
                      Book an Appointment
                    </Button>
                  </Row>
                  <Row>
                    {!showAppointments && (
                      <Button
                        className="appSummBtn btn-lg py-4"
                        onClick={() => setShowAppointments(true)}
                      >
                        Appointment Summary
                      </Button>
                    )}

                    {showAppointments && (
                      <div
                        className="appointment-page-overlay"
                        onClick={() => setShowAppointments(false)}
                      >
                        <AppSumm
                          appointments={appointments}
                          onClose={() => setShowAppointments(false)}
                        />
                      </div>
                    )}
                  </Row>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default CustomerDashboard;
