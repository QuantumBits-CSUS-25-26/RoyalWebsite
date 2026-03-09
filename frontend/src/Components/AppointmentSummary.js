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
            <th scope="col">Vehicle</th>
            <th scope="col">Scheduled</th>
            <th scope="col">Cost</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 && (
            <tr>
              <td colSpan={4}>No appointments</td>
            </tr>
          )}
          {appointments.map((a) => (
            <tr key={a.id || a.appointment_id}>
              <td>{a.service_type || a.name}</td>
              <td>{a.vehicle ? `${a.vehicle.make || ''} ${a.vehicle.model || ''}`.trim() : '-'}</td>
              <td>{a.scheduled_at ? a.scheduled_at.replace('T', ' ').split(':00')[0] : '-'}</td>
              <td>{a.cost != null ? `$${a.cost}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export default AppSumm;
