import React from "react";
import "../App.css";

const AppSumm = ({ appointments = [], onClose }) => (
  <div className="appointment-page">
    <header>
      <h2 className="AppSummTtl">Appointment Summary</h2>
    </header>
      
    <div className="table-wrapper" role="region" aria-label="Appointment list">
      <table className="appointments-table">

        <thead>
            <tr>
                <th scope="col">Service</th>
                <th scope="col">Service Description</th>
                <th scope="col">Payment Status</th>
            </tr>
        </thead>
      <tbody>
        {appointments.map(a => (
          <tr key={a.id}>
            <td data-label="Service">{a.name}</td>
            <td data-label="Description">{a.description}</td>
            <td data-label="Payment Status">{a.paymentStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>
);
export default AppSumm;
