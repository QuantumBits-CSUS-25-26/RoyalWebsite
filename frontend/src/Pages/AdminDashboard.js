import React from "react";
import '../App.css';
import { NavLink } from 'react-router-dom';
import customerIcon from '../images/customer_Icon.png';
import appointmentIcon from '../images/appointment_Icon.png';
import messageIcon from '../images/message_Icon.png';
import serviceIcon from '../images/services_Icon.png';
import adminIcon from "../images/sign_in_Icon.png"
import AdminSideBar from "../Components/AdminSideBar";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from 'react';
import { API_BASE_URL } from "../config";
import { Button } from "reactstrap";
import AdminUpdateBusiness from "../Components/AdminUpdateBusiness";

const DisplayCustomer = ({ customer }) => {
    const name = customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`;
    const joinedDate = new Date(customer.created_at);
    const joinedTime = joinedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <tr className="rc-table-row">
            <td className="rc-customer">
                <img src={customerIcon} alt="Customer Icon" className="rc-avatar" aria-hidden="true" />
                    <span className="rc-name">{name}</span>
            </td>
            <td className="rc-joined">
                <span className="break-word">{joinedDate.toLocaleDateString()} {joinedTime}</span>
            </td>
        </tr>
    );
};

export default function AdminDashboard() {
    //business info states
    const [businessInfo, setBusinessInfo] = useState(null);
    const [showEditBusiness, setShowEditBusiness] = useState(false);
    //dashboard totals states
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [totalMessages, setTotalMessages] = useState(0);
    const [totalServices, setTotalServices] = useState(0);
    //recent customers states
    const [recentCustomers, setRecentCustomers] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/business-info/`)
            .then(res => res.json())
            .then(data => setBusinessInfo(data[0]));
        // Fetch totals for dashboard
        fetch(`${API_BASE_URL}/api/admin/dashboard-totals/`)
            .then(res => res.json())
            .then(data => {
                setTotalCustomers(data.total_customers);
                setTotalAppointments(data.total_appointments);
                setTotalMessages(data.total_messages);
                setTotalServices(data.total_services);
            })
            .catch(err => console.error('Failed to fetch dashboard totals:', err));
        // Fetch recent customers
        fetch(`${API_BASE_URL}/api/admin/recent-customers/`)
            .then(res => res.json())
            .then(data => setRecentCustomers(data))
            .catch(err => console.error('Failed to fetch recent customers:', err));
    }, []);
    

    return (
        <section className="admin-dashboard">
            <AdminSideBar />
            <div className="admin-dashboard-content ms-md-5">
                <div className="admin-dashboard-header">
                    <span className="admin-dashboard-title">Admin Dashboard </span>
                    <div className="admin-sign-out">
                        <button className="admin-signIn-btn"><FontAwesomeIcon icon={faUser} /> Sign-Out</button>
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
                            <p >Total Appointments</p>
                            <p >{totalAppointments}</p>
                        </div>
                        <img src={appointmentIcon} alt="Appointment Icon" className="appointment-icon" />
                    </div>
                    <div className="total-messages">
                        <div className="inner-total-messages">
                            <p >Total Messages</p>
                            <p >{totalMessages}</p>
                        </div>
                        <img src={messageIcon} alt="Message Icon" className="message-icon" />
                    </div>
                    <div className="total-services">
                        <div className="inner-total-services">
                            <p >Total Services</p>
                            <p >{totalServices}</p>
                        </div>
                        <img src={serviceIcon} alt="Service Icon" className="service-icon" />
                    </div>
                </div>
                <div className="admin-content" >
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
                                        recentCustomers.map(customer => (
                                            <DisplayCustomer key={customer.id} customer={customer} />
                                        ))
                                    ): (
                                        <tr>
                                            <td colSpan="2">No recent customers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section className="admin-recent-customers business-table">
                        <div className="rc-header business-header">
                            <h2 id="rc-title">Business Information</h2>
                           <Button className="edit-business-btn btn btn-lg" onClick={() => setShowEditBusiness(true)}>
                                Edit
                            </Button>
                            <AdminUpdateBusiness
                                visible={showEditBusiness} 
                                onClose={() => setShowEditBusiness(false)} 
                                businessInfo={businessInfo}
                                setBusinessInfo={setBusinessInfo}
                            />
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