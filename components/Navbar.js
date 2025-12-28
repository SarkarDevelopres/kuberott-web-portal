"use client";

import React from "react";
import Link from "next/link";
import styles from "./navbar.module.css";
import { BiCameraMovie } from "react-icons/bi";

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.row}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoBox}>
              <span className={styles.logoText}>
                <BiCameraMovie size={20}/>
              </span>
              <div className={styles.logoOverlay}></div>
            </div>
            <span className={styles.brandName}>KuberOTT-Portal</span>
          </Link>

          {/* Navigation Links */}
          <div className={styles.links}>
            {/* Admin */}
            <Link href="/admin/login" className={styles.navLink}>
              <span className={styles.linkContent}>
                <svg
                  className={styles.linkIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Admin Portal</span>
              </span>
              <div
                className={`${styles.linkHover} ${styles.adminHover}`}
              ></div>
            </Link>

            {/* Employee */}
            <Link href="/employee/login" className={styles.navLink}>
              <span className={styles.linkContent}>
                <svg
                  className={styles.linkIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Employee Portal</span>
              </span>
              <div
                className={`${styles.linkHover} ${styles.employeeHover}`}
              ></div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
