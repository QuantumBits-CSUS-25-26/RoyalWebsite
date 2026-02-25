import React from "react";
import "./AppointmentSteps.css";

const SERVICES = [
  { id: "brakes", label: "Brake Work" },
  { id: "body", label: "Body Work" },
  { id: "engine-transmission", label: "Engine / Transmission" },
  { id: "hybrid", label: "Hybrid Services" },
  { id: "oil-change", label: "Oil Change" },
  { id: "suspension-tune-up", label: "Suspension Work / Tune Up" },
];

const AppStepTwo = ({ selectedServiceId, setSelectedServiceId, onBack, onNext }) => {
  return (
    <div className="appStep">
      <h1 className="appStepTitle">Service Selection</h1>
      <p className="appStepSubtitle">Step 2 — choose one service for your appointment.</p>

      <div className="serviceGrid">
        {SERVICES.map((s) => {
          const selected = selectedServiceId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`serviceCard ${selected ? "selected" : ""}`}
              onClick={() => setSelectedServiceId(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="stepActions">
        <button type="button" className="stepBtn secondary" onClick={onBack}>
          Back
        </button>

        <button
          type="button"
          className="stepBtn primary"
          onClick={onNext}
          disabled={!selectedServiceId}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AppStepTwo;
