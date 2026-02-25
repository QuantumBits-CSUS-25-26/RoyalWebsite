import React from "react";
import '../App.css';
import { NavLink } from 'react-router-dom';
import customerIcon from '../images/customer_Icon.png';
import appointmentIcon from '../images/appointment_Icon.png';
import messageIcon from '../images/message_Icon.png';
import serviceIcon from '../images/services_Icon.png';
import adminIcon from "../images/sign_in_Icon.png"
import AdminSideBar from "../Components/AdminSideBar";

export default function AdminDashboard() {
    return (
        <section className="admin-dashboard">
            <AdminSideBar />
            <div className="admin-dashboard-content"> 
                <div className="admin-dashboard-header">
                   <span className="admin-dashboard-title">Admin Dashboard </span> 
                   <div className="admin-sign-out">
                        <img src={adminIcon} alt="Admin Avatar" className="admin-icon" aria-hidden="true"/>
                        <btn className="admin-signIn-btn">Sign-Out</btn>
                   </div>
                </div>
                <div className="admin-totals">
                    <div className="total-customers">
                        <div className="inner-total-customers">
                            <p>Total Customers</p>
                            <p>150</p>
                        </div>
                        <img src={customerIcon} alt="Customer Icon" className="customer-icon" /> 
                    </div>
                    <div className="total-appointments">
                        <div className="inner-total-appointments">
                            <p >Total Appointments</p>
                            <p >3</p>
                        </div>
                        <img src={appointmentIcon} alt="Appointment Icon" className="appointment-icon" /> 
                    </div>
                    <div className="total-messages">
                        <div className="inner-total-messages">
                            <p >Total Messages</p>
                            <p >12</p>
                        </div>
                        <img src={messageIcon} alt="Message Icon" className="message-icon" /> 
                    </div>
                    <div className="total-services">
                        <div className="inner-total-services">
                            <p >Total Services</p>
                            <p >8</p>
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
                                    <tr>
                                        <td className="rc-customer">
                                            <img src={customerIcon} alt="Customer Icon" className="rc-avatar" aria-hidden="true"/>
                                            <span className="rc-name">Ali Mohammady</span>
                                        </td>
                                        <td className="rc-joined">
                                            <span>02-10-2023 10:00 AM</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="rc-customer">
                                            <img src={customerIcon} alt="Customer Icon" className="rc-avatar" aria-hidden="true"/>
                                            <span className="rc-name">Suhali</span>
                                        </td>
                                        <td className="rc-joined">
                                            <span>02-10-2023 10:00 AM</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="rc-customer">
                                            <img src={customerIcon} alt="Customer Icon" className="rc-avatar" aria-hidden="true"/>
                                            <span className="rc-name">Sanal</span>
                                        </td>
                                        <td className="rc-joined">
                                            <span>02-10-2023 10:00 AM</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="rc-customer">
                                            <img src={customerIcon} alt="Customer Icon" className="rc-avatar" aria-hidden="true"/>
                                            <span className="rc-name">James</span>
                                        </td>
                                        <td className="rc-joined">
                                             <span>02-10-2023 10:00 AM</span>
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