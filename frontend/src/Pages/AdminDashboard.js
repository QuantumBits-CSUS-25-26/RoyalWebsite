import React, { useEffect, useState } from "react";
import "../App.css";
import customerIcon from "../images/customer_Icon.png";
import appointmentIcon from "../images/appointment_Icon.png";
import messageIcon from "../images/message_Icon.png";
import serviceIcon from "../images/services_Icon.png";
import AdminSideBar from "../Components/AdminSideBar";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_BASE_URL } from "../config";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import AuthErrorPage from "../Components/AuthErrorPage/AuthErrorPage";
import AdminUpdateBusiness from "../Components/AdminUpdateBusiness";

const DisplayCustomer = ({ customer }) => {
  const name =
    customer.name ||
    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
    "Unnamed Customer";

  const joinedDate = customer.created_at ? new Date(customer.created_at) : null;
  const joinedDisplay = joinedDate && !Number.isNaN(joinedDate.getTime())
    ? `${joinedDate.toLocaleDateString()} ${joinedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Unknown";

  return (
    <tr className="rc-table-row">
      <td className="rc-customer">
        <img
          src={customerIcon}
          alt="Customer Icon"
          className="rc-avatar"
          aria-hidden="true"
        />
        <span className="rc-name">{name}</span>
      </td>
      <td className="rc-joined">
        <span className="break-word">{joinedDisplay}</span>
      </td>
    </tr>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [businessInfo, setBusinessInfo] = useState(null);
  const [showEditBusiness, setShowEditBusiness] = useState(false);

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalServices, setTotalServices] = useState(0);

  const [recentCustomers, setRecentCustomers] = useState([]);

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
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

    if (!user && token) return true;
    if (!user) return false;
    if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser) return true;
    if (user.role && (user.role === "employee" || user.role === "admin")) return true;
    if (
      Array.isArray(user.roles) &&
      (user.roles.includes("employee") || user.roles.includes("admin"))
    ) {
      return true;
    }
    return false;
  };

  const isAdmin = (user) => {
    if (!user) return false;
    if (user.is_admin || user.is_superuser) return true;
    if (user.role === "admin") return true;
    if (Array.isArray(user.roles) && user.roles.includes("admin")) return true;
    return false;
  };

  const canEditBusiness = isAdmin(storedUser);

  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

    const headers = { Accept: "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/api/business-info/`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBusinessInfo(Array.isArray(data) ? data[0] : data))
      .catch((err) => console.error("Failed to fetch business info:", err));

    fetch(`${API_BASE_URL}/api/admin/dashboard-totals/`, { headers })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        setTotalCustomers(data.total_customers || 0);
        setTotalAppointments(data.total_appointments || 0);
        setTotalMessages(data.total_messages || 0);
        setTotalServices(data.total_services || 0);
      })
      .catch((err) => console.error("Failed to fetch dashboard totals:", err));

    fetch(`${API_BASE_URL}/api/admin/recent-customers/`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRecentCustomers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch recent customers:", err));
  }, []);

  const handleLogout = async () => {
    try {
      const token =
        sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

      if (token) {
        await fetch(`${API_BASE_URL}/api/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/admin/login");
  };

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <section className="admin-dashboard">
      <AdminSideBar />

      <div className="admin-dashboard-content ms-md-5">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Admin Dashboard</span>

          <div className="admin-sign-out">
            <button className="admin-signIn-btn" type="button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faUser} /> Sign-Out
            </button>
          </div>
        </div>

        <div className="admin-totals">
          <div className="total-customers">
            <div className="inner-total-customers">
              <p>Total Customers</p>
              <p>{totalCustomers}</p>
            </div>
            <img src={customerIcon} alt="Customer Icon" className="customer-icon" />
          </div>

          <div className="total-appointments">
            <div className="inner-total-appointments">
              <p>Total Appointments</p>
              <p>{totalAppointments}</p>
            </div>
            <img
              src={appointmentIcon}
              alt="Appointment Icon"
              className="appointment-icon"
            />
          </div>

          <div className="total-messages">
            <div className="inner-total-messages">
              <p>Total Messages</p>
              <p>{totalMessages}</p>
            </div>
            <img src={messageIcon} alt="Message Icon" className="message-icon" />
          </div>

          <div className="total-services">
            <div className="inner-total-services">
              <p>Total Services</p>
              <p>{totalServices}</p>
            </div>
            <img src={serviceIcon} alt="Service Icon" className="service-icon" />
          </div>
        </div>

        <div className="admin-content">
          <section className="admin-recent-customers">
            <div className="rc-header">
              <h2 id="rc-title">Recent Customers</h2>
            </div>

            <div className="rc-customer-table">
              <table className="rc-table">
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.length > 0 ? (
                    recentCustomers.map((customer) => (
                      <DisplayCustomer
                        key={customer.customer_id || customer.id}
                        customer={customer}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No recent customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-recent-customers business-table my-3 my-md-5">
            <div className="rc-header business-header">
              <h2 id="rc-title">Business Information</h2>

              {canEditBusiness && (
                <>
                  <Button
                    className="edit-business-btn btn btn-lg"
                    onClick={() => setShowEditBusiness(true)}
                  >
                    Edit
                  </Button>

                  <AdminUpdateBusiness
                    visible={showEditBusiness}
                    onClose={() => setShowEditBusiness(false)}
                    businessInfo={businessInfo}
                    setBusinessInfo={setBusinessInfo}
                  />
                </>
              )}
            </div>

            <div className="rc-customer-table">
              <table className="rc-table">
                <tbody>
                  <tr>
                    <td className="rc-customer">
                      <span className="business-headers">Name: </span>
                    </td>
                    <td className="business-info">
                      <span>{businessInfo?.name || "No Name Found"}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="rc-customer">
                      <span className="business-headers">Phone: </span>
                    </td>
                    <td className="business-info">
                      <span>{businessInfo?.phone || "No Phone Found"}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="rc-customer">
                      <span className="business-headers">Address: </span>
                    </td>
                    <td className="business-info">
                      <span>{businessInfo?.address || "No Address Found"}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="rc-customer">
                      <span className="business-headers">Hours: </span>
                    </td>
                    <td className="business-info">
                      <span>{businessInfo?.hours || "No Hours Found"}</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="rc-customer">
                      <span className="business-headers">Email: </span>
                    </td>
                    <td className="business-info">
                      <span>{businessInfo?.email || "No Email Found"}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}