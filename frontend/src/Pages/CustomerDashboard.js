import "./Homepage.css";
import "../App.css";
import { Row, Col, Button, Form, FormGroup, Label } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AppSumm from "../Components/AppointmentSummary";
import VehicleInfoPopUp from "../Components/VehicleInfoPopup";
import NewVehiclePopUp from "../Components/newVehiclePopup";
import AuthErrorPage from "../Components/AuthErrorPage/AuthErrorPage";
import { API_BASE_URL } from "../config";


const sampleCustomer = [
  { customer_id: 1,
    first_name: "Trevor",
    last_name: "Gould",
    phone: 9166984779,
    email: "something@email.com"
  }
]
const sampleVehicle = [
  { vehicle_id: 2,
    make: "Hyundai",
    model: "Sonata",
    year: 2008,
    license_plate: "234bcd",
    customer_id: 1
  },
  { vehicle_id: 3,
    make: "Honda",
    model: "Civic",
    year: 2010,
    license_plate: "567efg",
    customer_id: 1
  }
]
const sampleRecommendations = [
  { recommendation_id: 1,
    note: "Brakes are worn, recommend replacement",
    customer_id: 1,
    service_id: 1,
    vehicle_id: 2
  },
  {
    recommendation_id: 3,
    note: "Oil is dirty, recommend change",
    customer_id: 1,
    service_id: 3,
    vehicle_id: 2
  },
  {
    recommendation_id: 2,
    note: "Brakes are close to worn, should replace soon",
    customer_id: 1,
    service_id: 2,
    vehicle_id: 3
  }
]
const sampleService = [
  {
    service_id: 2,
    name: "Brakes",
    description: "Work on brakes.",
    price: 50.00
  },
  {
    service_id: 3,
    name: "Oil Change",
    description: "Regular oil change service",
    price: 50.00
  },
  {
    service_id: 1,
    name: "Tire Rotation",
    description: "Rotate tires for even wear",
    price: 30.00
  }
]









const CustomerDashboard = () => {
  

  const parseStoredUser = () => {
      try {
          const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
          return raw ? JSON.parse(raw) : null;
      } catch (e) {
          return null;
      }
  };

  const storedUser = parseStoredUser();

  const isAuthorized = (user) => {
      // if a token exists assume authenticated and allow; stored user may not be saved by login flow
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
      if (!user && token) return true;
      if (!user) return false;
      if (user.is_customer || user.is_superuser) return true;
      if (user.role && (user.role === "customer")) return true;
      if (Array.isArray(user.roles) && (user.roles.includes("customer"))) return true;
      return false;
  };



  const [showAppointments, setShowAppointments] = useState(false);
  //const [showRecommendations, setShowRecommendations] = useState(false);
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [showNewVehicleModal, setShowNewVehicleModal] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchProfile = fetch(`${API_BASE_URL}/api/customers/me/`, { headers });
    const fetchVehicles = fetch(`${API_BASE_URL}/api/vehicles/`, { headers });
    const fetchAppointments = fetch(`${API_BASE_URL}/api/appointments/`, { headers });
    const fetchRecommends = fetch(`${API_BASE_URL}/api/recommendations/`, { headers });

    Promise.all([fetchProfile, fetchVehicles, fetchAppointments, fetchRecommends])
      .then(async ([resProfile, resVehicles, resAppts, resRecommends]) => {
        if (!resProfile.ok) throw new Error('Failed to load profile');
        if (!resVehicles.ok) throw new Error('Failed to load vehicles');
        if (!resAppts.ok) throw new Error('Failed to load appointments');
        if (!resRecommends.ok) throw new Error('Failed to load recommendations');


        const profileData = await resProfile.json().catch(() => null);
        const vehiclesData = await resVehicles.json().catch(() => []);
        const apptsData = await resAppts.json().catch(() => []);
        const recommendsData = await resRecommends.json().catch(() => []);


        setProfile(profileData);
        setVehicles(vehiclesData || []);
  

        // normalize appointments (backend returns appointment_id)
        const normalized = (apptsData || []).map(a => ({
          id: a.appointment_id,
          service_type: a.service_type,
          scheduled_at: a.scheduled_at,
          cost: a.cost,
          vehicle: a.vehicle,
        }));
        setAppointments(normalized);
        
        setRecommendations(recommendsData || []);

        // use recent appointments as service history fallback
        setServiceHistory((normalized || []).slice(0, 5).map(a => ({
          service: a.service_type,
          date: a.scheduled_at ? a.scheduled_at.split('T')[0] : '',
          cost: a.cost ? `$${a.cost}` : '-',
        })));
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load data');
      })
      .finally(() => setLoading(false));
  }, []);


  const navigate = useNavigate();
  const handleClickUpdateInfo = () => {
    navigate("/account-update");
  };


  // for testing: sample data overwrites API data
  /*
  useEffect(() => {
    setProfile(sampleCustomer[0]);
    setVehicles(sampleVehicle);
    setRecommendations(sampleRecommendations);
  }, []);
  */

  ///*
  // Helper to refresh vehicles after adding
  const fetchVehicles = () => {
    const token = sessionStorage.getItem("authToken");
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API_BASE_URL}/api/vehicles/`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setVehicles(data || []));
  };

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;
  //*/
  
  return (
    <div className="customerDashboard">
      <div className="content">
        <Row className="justify-content-center">
          <Col md="10" sm="2">
            <Form className="updateForm fs-3 p-4">
              <div className=" my-4">Account Info</div>
              {error && (
                <div className="form-error" role="alert">{error}</div>
              )}
              <Row className="customerDashboardRows">
                <Col md="6" sm="12">
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label for="name">Account Owner:</Label>
                      <div className="info-text">{profile ? `${profile.first_name} ${profile.last_name}` : "-"}</div>
                    </FormGroup>
                    <FormGroup>
                      <Label for="email">Email:</Label>
                      <div className="info-text">{profile ? profile.email : "-"}</div>
                    </FormGroup>
                    <FormGroup>
                      <Label for="phone">Phone Number:</Label>
                      <div className="info-text">{profile ? profile.phone || '-' : "-"}</div>
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
                            {appointments.length === 0 && (
                              <tr>
                                <td colSpan={3}>{loading ? 'Loading...' : 'No appointments found'}</td>
                              </tr>
                            )}
                            {appointments.map((a) => (
                              <tr key={`appt-${a.id}`}>
                                <td>{a.scheduled_at ? a.scheduled_at.split('T')[0] : '-'}</td>
                                <td>{a.scheduled_at ? a.scheduled_at.split('T')[1]?.slice(0,5) : '-'}</td>
                                <td>{a.service_type}</td>
                              </tr>
                            ))}
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
                            {vehicles.length === 0 && (
                              <tr>
                                <td colSpan={4}>{loading ? 'Loading...' : 'No vehicles found'}</td>
                              </tr>
                            )}
                            {vehicles.map((v) => (
                              <tr key={`v-${v.vehicle_id}`}>
                                <td>{v.make}</td>
                                <td>{v.model}</td>
                                <td>{v.year}</td>
                                <td>{v.license_plate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </FormGroup>
                  </div>
                  <div className="info text-start px-5 py-4 mb-5">
                    <FormGroup>
                      <Label for="vehicles">Recommended Services:</Label>
                      <div className="info-text">
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>Model</th>
                              <th>Plate</th>
                              <th>Service</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recommendations.length === 0 && (
                              <tr>
                                <td colSpan={4}>{loading ? 'Loading...' : 'No recommended services'}</td>
                              </tr>
                            )}
                            {recommendations.map((r) => {
                              const vehicle = (typeof r.vehicle_id === "object" && r.vehicle_id !== null)
                                ? r.vehicle_id
                                : vehicles.find((v) => v.vehicle_id === r.vehicle_id || v.id === r.vehicle_id);
                              const service = sampleService.find((s) => s.service_id === r.service_id);
                              return (
                                <tr key={`r-${r.recommendation_id}`}>
                                  <td>{vehicle?.model ?? "-"}</td>
                                  <td>{vehicle?.license_plate ?? "-"}</td>
                                  <td>{service?.name ?? r.service_id ?? "-"}</td>
                                </tr>
                              );
                            })}
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
                            {serviceHistory.length === 0 && (
                              <tr>
                                <td colSpan={3}>{loading ? 'Loading...' : 'No service history'}</td>
                              </tr>
                            )}
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
                    <Button type="button" className="btn btn-lg py-4" onClick={() => setShowVehiclePopup(true)}>
                      View Vehicle Info
                    </Button>
                  </Row>
                  <VehicleInfoPopUp
                    isOpen={showVehiclePopup}
                    onClose={() => setShowVehiclePopup(false)}
                    vehicles={vehicles}
                    appointments={appointments}
                  />
                  <Row className="mb-4">
                    <Button type="button" className="btn btn-lg py-4" onClick={() => setShowNewVehicleModal(true)}>
                      New Vehicle
                    </Button>
                  </Row>
                  <NewVehiclePopUp
                    isOpen={showNewVehicleModal}
                    onClose={() => setShowNewVehicleModal(false)}
                    onVehicleAdded={fetchVehicles}
                  />
                </Col>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default CustomerDashboard;
