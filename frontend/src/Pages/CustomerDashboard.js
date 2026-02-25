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
  const serviceHistory = [
    {
      service: "Brake Inspection",
      date: "17/2/2026",
      cost: "$20",
    },
    {
      service: "Oil Change",
      date: "17/2/2026",
      cost: "$17",
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
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Service</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>10/15/2025</td>
                              <td>10:00 AM</td>
                              <td>Brake Inspection</td>
                            </tr>
                            <tr>
                              <td>09/12/2025</td>
                              <td>11:00 AM</td>
                              <td>Oil Change</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </FormGroup>
                  </div>
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label for="vehicles">Vehicles:</Label>
                      <div className="info-text">
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>Make</th>
                              <th>Model</th>
                              <th>Year</th>
                              <th>Plate</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Toyota</td>
                              <td>Camry</td>
                              <td>2020</td>
                              <td>ABC123</td>
                            </tr>
                            <tr>
                              <td>Honda</td>
                              <td>Civic</td>
                              <td>2018</td>
                              <td>XYZ789</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </FormGroup>
                  </div>
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label>Service History:</Label>

                      <div className="info-text">
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>Service</th>
                              <th>Date</th>
                              <th>Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceHistory.map((item, index) => (
                              <tr key={`sh-${index}`}>
                                <td>{item.service}</td>
                                <td>{item.date}</td>
                                <td>{item.cost}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="info-text mt-2">
                        <Row className="vehiclesRow">
                          <div className="pagination">
                            <button>&laquo;</button>
                            {[1, 2, 3, 4].map((page) => (
                                <button
                                    key={page}
                                    className={page === 2 ? "active" : ""}
                                >
                                  {page}
                                </button>
                            ))}
                            <button>&raquo;</button>
                          </div>
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
                  <Row className="mb-4">
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
                  <Row className="mb-4">
                    <Button type="button" className="btn btn-lg py-4">
                      New Vehicle
                    </Button>
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
