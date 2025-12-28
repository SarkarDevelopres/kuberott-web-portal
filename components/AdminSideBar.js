"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdOutlineSupportAgent } from "react-icons/md";
import { BiCameraMovie } from "react-icons/bi";
import { RiAdvertisementLine } from "react-icons/ri";
// import { socket } from "@/utils/socket";
// import { useNotification } from "@/context/notificationContext";
import styles from "./adminsidebar.module.css";

function AdminSideBar({ page }) {
  const router = useRouter();
//   const { hasNotification, setHasNotification } = useNotification();

//   useEffect(() => {
//     socket.connect();
//     socket.emit("join_admin");

//     socket.on("new_user_message", () => {
//       setHasNotification(true);
//     });

//     return () => {
//       if (socket.connected) {
//         socket.disconnect();
//       }
//     };
//   }, []);

  const logOut = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      router.replace("/");
    }
  };

  const menuItems = [
    {
      key: "home",
      label: "Dashboard",
      href: "/admin/",
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: "emp",
      label: "Team",
      href: "/admin/employee",
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      key: "usr",
      label: "Users",
      href: "/admin/user",
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: "movie",
      label: "Movies",
      href: "/admin/movie",
      icon: <BiCameraMovie className={styles.icon} />,
    },
    {
      key: "ads",
      label: "Advert",
      href: "/admin/advert",
      icon: <RiAdvertisementLine className={styles.icon} />,
    },
    {
      key: "msg",
      label: "Support",
      href: "/admin/message",
      icon: <MdOutlineSupportAgent className={styles.icon} />,
    },
  ];

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.brandRow}>
          <div className={styles.brandIcon}>
            <span className={styles.brandIconText}>A</span>
          </div>
          <div>
            <h2 className={styles.brandTitle}>AdminPro</h2>
            <p className={styles.brandSubtitle}>Enterprise Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = page === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              {/* {item.key === "msg" && hasNotification && page !== "msg" && (
                <span className={styles.notification}></span>
              )} */}
              {item.icon}
              <span className={styles.label}>{item.label}</span>
              {isActive && <span className={styles.activeDot}></span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={styles.logout}>
        <button onClick={logOut} className={styles.logoutButton}>
          <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={styles.logoutLabel}>Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSideBar;
