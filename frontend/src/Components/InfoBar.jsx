import React from "react";
import "./InfoBar.css"; // we'll add this next

function InfoBar() {
  return (
    <div className="info-bar">
      <div className="info-section">
        <div className="info-item">
          <span className="info-icon">📞</span>
          <span className="info-text">(916) 562-9441</span>
        </div>

        <div className="info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">2546 Tower Ave, Sacramento, CA 95825</span>
        </div>

        <div className="info-item">
          <span className="info-icon">⏰</span>
          <span className="info-text">
            Monday – Friday: 8AM – 5PM | Saturday: 9AM – 4PM
          </span>
        </div>
      </div>
    </div>
  );
}

export default InfoBar;
