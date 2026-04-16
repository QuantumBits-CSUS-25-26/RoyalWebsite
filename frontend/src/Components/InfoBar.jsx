import React from "react";
import "./InfoBar.css"; // we'll add this next
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

function InfoBar() {
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/business-info/`)
      .then(res => res.json())
      .then(data => setBusinessInfo(data[0]));
  }, []);

  return (
    <div className="info-bar">
      <div className="info-section">
        <div className="info-item">
          <span className="info-icon">📞</span>
          <span className="info-text">{businessInfo?.phone}</span>
        </div>

        <div className="info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">{businessInfo?.address}</span>
        </div>

        <div className="info-item">
          <span className="info-icon">⏰</span>
          <span className="info-text">
            {businessInfo?.hours}
          </span>
        </div>
      </div>
    </div>
  );
}

export default InfoBar;
