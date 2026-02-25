import React from "react";
import "./AppointmentSteps.css";

const AppStepOne = ({ onNext }) => {
  return (
    <div className="appStep">
      <h1 className="appStepTitle">Book an Appointment</h1>
      <p className="appStepSubtitle">Step 1 — choose your service and pick a date and time.</p>

      <p style={{ marginBottom: 24 }}>
        Select a service in the next step, then choose an available date and time for your visit.
      </p>

      <div className="stepActions" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="stepBtn primary" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AppStepOne;
