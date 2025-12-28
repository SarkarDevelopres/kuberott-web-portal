"use client";

import React from "react";
import { FaUserShield, FaUserTie } from "react-icons/fa";
import styles from "./page.module.css";
import { BiCameraMovie } from "react-icons/bi";

function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.center}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logoBox}>
            <span className={styles.logoText}>
              <BiCameraMovie size={30}/>
            </span>
          </div>

          <h1 className={styles.title}>Kuber OTT</h1>

          <p className={styles.subtitle}>
            Choose your portal to continue
          </p>
        </div>

        {/* Buttons */}
        <div className={styles.buttonGrid}>
          {/* Admin */}
          <button
            onClick={() => (window.location.href = "/admin/login")}
            className={`${styles.portalButton} ${styles.admin}`}
          >
            <div className={styles.buttonContent}>
              <FaUserShield className={styles.icon} />
              <h2 className={styles.buttonTitle}>Admin</h2>
              <p className={`${styles.buttonText} ${styles.adminText}`}>
                System Administration Portal
              </p>
            </div>
            <div
              className={`${styles.hoverOverlay} ${styles.adminOverlay}`}
            ></div>
          </button>

          {/* Employee */}
          <button
            onClick={() => (window.location.href = "/employee/login")}
            className={`${styles.portalButton} ${styles.employee}`}
          >
            <div className={styles.buttonContent}>
              <FaUserTie className={styles.icon} />
              <h2 className={styles.buttonTitle}>Employee</h2>
              <p className={`${styles.buttonText} ${styles.employeeText}`}>
                Employee Access Portal
              </p>
            </div>
            <div
              className={`${styles.hoverOverlay} ${styles.employeeOverlay}`}
            ></div>
          </button>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Secure Access Portal • Kuber Load
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
