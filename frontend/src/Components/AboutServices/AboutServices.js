import React from "react";
import styles from "./AboutServices.module.css";
import mechanicImg from "./AboutServicesAssets/stockMechanicImage.jpeg"; 

export default function AboutServices() {
  return (
    <section className={styles.aboutServices}>
      <img
        className={styles.image}
        src={mechanicImg}
        alt="Mechanic working on engine"
      />
      <div className={styles.rightSide}>
        <div className={styles.grayBar}>
          <div className={styles.title}>Services</div>
        </div>
        <div className={styles.description}>
          Royal Auto and Body Repair is a Sacramento-based auto repair shop
          located at 2546 Tower Ave, Sacramento, CA 95825. The business
          provides a variety of automotive services including oil changes,
          brake repairs, suspension work, and vehicle inspections for Uber and
          Lyft drivers, among other repair and maintenance services.
        </div>
        <button
          className={styles.viewServicesButton}
          aria-label="View all available auto repair services"
        >
          View all services
        </button>
      </div>
    </section>
  );
}
