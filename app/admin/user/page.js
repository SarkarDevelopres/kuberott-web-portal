"use client";

import React, { useEffect, useState } from "react";
import AdminSideBar from "@/components/AdminSideBar";
import { MdSearch } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { toast } from "react-toastify";
import SpinnerComp from "@/components/Spinner";
import { useRouter } from "next/navigation";
import styles from "./user.module.css";

function formatDateOnly(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}


export function EmpModal({ userData, closeWindow, fetchUsers }) {
  const deleteUser = async () => {
    if (!confirm("Permanently ban user?")) return;

    try {

      let token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}admin/deleteUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userData.id }),
        }
      ).then((r) => r.json());

      if (res.ok) {
        toast.success("User deleted successfully!");
        fetchUsers();
        closeWindow();
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <IoMdCloseCircle
          size={24}
          className={styles.closeBtn}
          onClick={closeWindow}
        />

        <h3 className={styles.modalTitle}>User Details</h3>

        {[
          ["Name", userData.name],
          ["Phone", userData.phone],
          ["Email", userData.email],
          ["Movies Watched", userData.moviesWatched],
          ["Ads Watched", userData.adsWatched],

        ].map(([k, v], i) => (
          <div key={i} className={styles.row}>
            <span className={styles.label}>{k}:</span>
            <span className={styles.value}>{v}</span>
          </div>
        ))}

        <button className={styles.deleteBtn} onClick={deleteUser}>
          Delete User
        </button>
      </div>
    </div>
  );
}

function UserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [searchData, setSearchData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const fetchTotalUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      // if (!token) {
      //   toast.error("Invalid Login");
      //   router.replace("/");
      //   return;
      // }
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/fetchUsers`);

      const req = await res.json();
      // const res = await fetch(
      //   `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/fetchUser`,
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // ).then((r) => r.json());

      if (req.ok) setUserList(req.userList);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUser = userList.filter((user) => {
    const name = !searchData.name || user.name?.toLowerCase().includes(searchData.name.toLowerCase());

    const email = !searchData.email || user.email?.email?.includes(searchData.email)

    const phone = !searchData.phone || user.phone?.number?.includes(searchData.phone);

    return name && email && phone
  })

  const fetchSingleUser = async () => {
    if (!searchData.name && !searchData.phone && !searchData.email) {
      toast.error("Enter at least one search field");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/findSingleUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(searchData),
        }
      ).then((r) => r.json());

      if (res.ok) {
        setUserList([res.data]);
        toast.success("User found");
      } else {
        toast.error("User not found");
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalUsers();
  }, []);

  return (
    <div className={styles.page}>
      {isLoading && <SpinnerComp />}
      <AdminSideBar page="usr" />

      <div className={styles.content}>
        {showUserModal && (
          <EmpModal
            userData={currentUser}
            closeWindow={() => setShowUserModal(false)}
            fetchUsers={fetchTotalUsers}
          />
        )}

        <div className={styles.header}>
          <h2 className={styles.title}>User Management</h2>
          <p className={styles.subtitle}>
            Manage and monitor all system users
          </p>
        </div>

        <div className={styles.searchBox}>
          <div className={styles.searchGrid}>
            {["email", "name", "phone"].map((k) => (
              <input
                key={k}
                className={styles.input}
                placeholder={`Enter ${k}`}
                value={searchData[k]}
                onChange={(e) =>
                  setSearchData({ ...searchData, [k]: e.target.value })
                }
              />
            ))}
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.searchBtn} onClick={fetchSingleUser}>
              <MdSearch size={20} /> Search User
            </button>
            <button
              className={styles.resetBtn}
              onClick={fetchTotalUsers}
            >
              Show All
            </button>
          </div>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {["Sl", "Name", "Email", "Phone", "Active Since"].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUser.map((u, i) => (
                <tr
                  key={u._id}
                  className={styles.tr}
                  onClick={() => {
                    setCurrentUser({
                      id: u._id,
                      name: u.name,
                      phone: u.phone?.number || "",
                      email: u.email.email,
                      moviesWatched: u.moviesWatched ? u.moviesWatched : 0,
                      adsWatched: u.adsWatched ? u.adsWatched : 0,
                    });
                    setShowUserModal(true);
                  }}
                >
                  <td className={styles.td}>{i + 1}</td>
                  <td className={`${styles.td} ${styles.blue}`}>
                    {u.name}
                  </td>
                  <td className={styles.td}>{u.email?.email}</td>
                  <td className={styles.td}>{u.phone?.number}</td>
                  <td className={styles.td}>{formatDateOnly(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!userList.length && !isLoading && (
            <div className={styles.empty}>No users found</div>
          )}
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Users</p>
            <p className={styles.statValue}>{userList.length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Today</p>
            <p className={`${styles.statValue} ${styles.green}`}>
              {Math.floor(userList.length * 0.3)}
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>New This Week</p>
            <p className={`${styles.statValue} ${styles.blueStat}`}>
              {Math.floor(userList.length * 0.1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
