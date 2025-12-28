"use client";

import React, { useEffect, useState } from "react";
import AdminSideBar from "@/components/AdminSideBar";
import SpinnerComp from "@/components/Spinner";
import { toast } from "react-toastify";
import { FaUsers, FaHandHoldingUsd, FaChartLine } from "react-icons/fa";
import { RiAdvertisementLine } from "react-icons/ri";
import { BsEnvelopeCheck, BsGraphUp } from "react-icons/bs";
import { BiCameraMovie } from "react-icons/bi";
import { useRouter } from "next/navigation";
// import { useNotification } from "@/context/notificationContext";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

import { Line, Bar, Pie } from "react-chartjs-2";
import styles from "./admin.module.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function LatestWatchedComponent({
  index,
  movieName,
  userName,
  adsWatched,
  duration,
  date
}) {
  const [normalDate, setNormalDate] = useState("");

  useEffect(() => {
    setNormalDate(new Date(date).toLocaleDateString());
  }, [date]);

  return (
    <tr className={styles.tableRow}>
      <td>{index + 1}</td>
      <td>{movieName}</td>
      <td>{userName}</td>
      <td>{adsWatched}</td>
      <td>{normalDate || "..."}</td>
    </tr>
  );
}



function Admin() {
  const [movieCount, setMovieCount] = useState(0);
  const [totalUser, setTotalUser] = useState(0);
  const [appliedLoan, setAppliedLoan] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [latestWatched, setLatestWatched] = useState([]);
  const [userGraphData, setUserGraphData] = useState([]);
  const [appliedLoanGraphData, setAppliedLoanGraphData] = useState([]);


  const generateDummyData = () => {
    // Stats
    // setTotalUser(1247);
    // setMovieCount(89);
    // setAppliedLoan(543);
    // setEmployeeCount(387);

    // Latest loans
    const loans = [
      { userId: "user_001", loanType: "Pro", amount: 21, createdAt: new Date().toISOString() },
      { userId: "user_042", loanType: "Premium", amount: 34, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { userId: "user_156", loanType: "Free", amount: 5, createdAt: new Date(Date.now() - 172800000).toISOString() },
      { userId: "user_289", loanType: "Pro", amount: 10, createdAt: new Date(Date.now() - 259200000).toISOString() },
      { userId: "user_332", loanType: "Pro", amount: 12, createdAt: new Date(Date.now() - 345600000).toISOString() },
    ];
    setLatestWatched(loans);

    // Graph data
    const userData = [
      { month: 8, totalUsers: 980 },
      { month: 9, totalUsers: 1045 },
      { month: 10, totalUsers: 1120 },
      { month: 11, totalUsers: 1190 },
      { month: 12, totalUsers: 1247 },
    ];
    setUserGraphData(userData);

    const loanData = [
      { month: 8, totalApplied: 420 },
      { month: 9, totalApplied: 465 },
      { month: 10, totalApplied: 498 },
      { month: 11, totalApplied: 512 },
      { month: 12, totalApplied: 543 },
    ];
    setAppliedLoanGraphData(loanData);

    setIsLoading(false);
  };

  const router = useRouter();
  //   const { setHasNotification } = useNotification();

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [
      {
        label: "Users Growth",
        data: [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  });

  const [barData, setBarData] = useState({
    labels: [],
    datasets: [
      {
        label: "Ads Watched",
        data: [],
        backgroundColor: [
          "rgba(99,102,241,0.8)",
          "rgba(139,92,246,0.8)",
          "rgba(59,130,246,0.8)",
          "rgba(14,165,233,0.8)",
          "rgba(6,182,212,0.8)",
        ],
        borderWidth: 0,
        borderRadius: 0,
      },
    ],
  });
  const [pieData, setPieData] = useState({
    labels: ["Data Used", "Data Un-Used"],
    datasets: [
      {
        label: [],
        data: [],
        backgroundColor: [
          "rgba(99,102,241,0.8)",
          "rgba(138, 92, 246, 0.97)",
        ],
        borderWidth: 0,
        borderRadius: 0,
      },
    ],
  });


  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0, // removes outer padding
    },
    plugins: {
      legend: {
        position: "right", // <-- move labels next to chart
        align: "right",
        labels: {
          boxWidth: 20,
          boxHeight: 20,
          padding: 5,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };


  const startUpData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Invalid Login");
        router.replace("/");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}admin/fetchStartUpData`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json.ok) {
        console.log(json);

        setTotalUser(json.userCount);
        setMovieCount(json.movieCount);
        setEmployeeCount(json.employeeCount);
        setUserGraphData(json.userPerMonth);
        setLatestWatched(json.latestWatched);

        const unusedData = Math.max(json.totalData - json.usedData, 0);

        setPieData((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: [json.usedData, unusedData],
            },
          ],
        }));

        // if (json.data.notification) {
        //   //   setHasNotification(true);
        // }
        setIsLoading(false);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    startUpData();
    // generateDummyData();
  }, []);

  useEffect(() => {
    if (!userGraphData.length) return;

    const currentMonth = new Date().getMonth() + 1;
    const months = Array.from({ length: 5 }, (_, i) => {
      let m = currentMonth - (4 - i);
      return m <= 0 ? m + 12 : m;
    });

    setLineData({
      labels: months.map(m => monthNames[m - 1]),
      datasets: [
        {
          ...lineData.datasets[0],
          data: months.map(m => {
            const found = userGraphData.find(d => d.month === m);
            return found ? found.totalUsers : 0;
          }),
        },
      ],
    });
  }, [userGraphData]);

  useEffect(() => {
    if (!appliedLoanGraphData.length) return;

    const currentMonth = new Date().getMonth() + 1;
    const months = Array.from({ length: 5 }, (_, i) => {
      let m = currentMonth - (4 - i);
      return m <= 0 ? m + 12 : m;
    });

    setBarData({
      ...barData,
      labels: months.map(m => monthNames[m - 1]),
      datasets: [
        {
          ...barData.datasets[0],
          data: months.map(m => {
            const found = appliedLoanGraphData.find(d => d.month === m);
            return found ? found.totalApplied : 0;
          }),
        },
      ],
    });
  }, [appliedLoanGraphData]);

  const statsCards = [
    { icon: <FaUsers />, label: "Total Users", value: totalUser, change: "+12.3%" },
    { icon: <BiCameraMovie />, label: "Movies", value: movieCount, change: "+5.7%" },
    { icon: <RiAdvertisementLine />, label: "Ads", value: appliedLoan, change: "+8.1%" },
    { icon: <BsEnvelopeCheck />, label: "Employees", value: employeeCount, change: "+15.2%" },
  ];

  return (
    <div className={styles.page}>
      <AdminSideBar page="home" />
      {isLoading && <SpinnerComp />}
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <div className={styles.statsGrid}>
          {statsCards.map((card, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIcon}>{card.icon}</div>
                <span className={styles.statChange}>{card.change}</span>
              </div>
              <h3 className={styles.statValue}>
                {card.value.toLocaleString()}
              </h3>
              <p className={styles.statLabel}>{card.label}</p>
            </div>
          ))}
        </div>

        <div className={styles.chartGrid}>
          <div className={styles.chartCard} style={{ width: "68%" }}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <FaChartLine /> Users Growth
              </h3>
              <span className={styles.chartStat}>+12.3%</span>
            </div>
            <div className={styles.chartBody}>
              <Line data={lineData} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", width: "30%" }}>
            <div className={styles.chartCard} style={{ height: 250, width: "100%" }}>
              <div className={styles.chartHeader} style={{ marginBottom: 5 }}>
                <h3 className={styles.chartTitle}>
                  <BsGraphUp /> Ads Watched
                </h3>
                <span className={styles.chartStat}>+8.1%</span>
              </div>
              <div className={styles.chartBody}>
                <Bar data={barData} />
              </div>
            </div>
            <div className={styles.chartCard} style={{ height: 250, width: "100%", padding: 10, }}>
              <div className={styles.chartHeader} style={{ marginBottom: 5 }}>
                <h3 className={styles.chartTitle}>
                  <BsGraphUp />
                  Data Used
                </h3>
                <span className={styles.chartStat}>+8.1%</span>

              </div>
              <div style={{ height: 200 }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.chartTitle}>
              <FaHandHoldingUsd /> Latest Watch Data
            </h3>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Movie Name</th>
                  <th>User Name</th>
                  <th>Ads Watched</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {latestWatched.map((watched, i) => (
                  <LatestWatchedComponent key={i} index={i} {...watched} date={watched.time} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
