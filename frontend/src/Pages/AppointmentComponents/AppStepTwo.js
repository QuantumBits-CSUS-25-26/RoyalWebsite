import React from "react";
import "./AppStepTwo.css";

const AppStepTwo = ({
  services = [],
  selectedServiceId,
  setSelectedServiceId = () => {},
  loading = false,
  error = ""
}) => {
  return (
    <div className="app-step-two">
      <h1>Service Selection</h1>

      <div className="service-card">
        {loading && <div className="service-message">Loading services...</div>}
        {error && <div className="service-message text-danger">{error}</div>}

        {!loading && !error && (
          <div className="service-grid">
            {services.length === 0 ? (
              <div className="service-message">No active services available.</div>
            ) : (
              services.map((service) => {
                const selected = selectedServiceId === service.service_id;

                return (
                  <button
                    key={service.service_id}
                    type="button"
                    className={`service-option ${selected ? "selected" : ""}`}
                    onClick={() => setSelectedServiceId(service.service_id)}
                  >
                    <div className="service-name">{service.name}</div>
                    <div className="service-cost">
                      ${Number(service.cost).toFixed(2)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppStepTwo;