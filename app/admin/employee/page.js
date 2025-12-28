"use client";

import React, { useEffect, useState } from "react";
import AdminSideBar from "@/components/AdminSideBar";
import SpinnerComp from "@/components/Spinner";
import { MdSearch, MdAdd } from "react-icons/md";
import { IoMdCloseCircle, IoMdTrash } from "react-icons/io";
import { FiEdit, FiUser } from "react-icons/fi";
import { FaRegSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import styles from "./employee.module.css";

function formatDateOnly(isoDate) {
    return new Date(isoDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

export function EmpModal({ empData, closeWindow, fetchEmployees }) {
    const [data, setData] = useState({ ...empData });
    const [edit, setEdit] = useState(false);

    const save = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/editEmployee`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        ).then((r) => r.json());

        if (res.ok) {
            toast.success("Employee updated");
            fetchEmployees();
            closeWindow();
        }
    };

    const del = async () => {
        if (!confirm("Delete employee?")) return;

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/deleteEmployee`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ empId: empData._id }),
            }
        ).then((r) => r.json());

        if (res.ok) {
            toast.success("Employee deleted");
            fetchEmployees();
            closeWindow();
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <IoMdCloseCircle className={styles.closeBtn} onClick={closeWindow} />

                <h3 style={{ color: "white", marginBottom: 16 }}>Employee Details</h3>

                {["name", "phone", "email", "department", "post", "salary", "dob", "address"].map((k) => (
                    <div key={k} className={styles.modalRow}>
                        <span className={styles.label}>{k}:</span>

                        {edit ? (
                            <input
                                value={data[k] ?? ""}
                                onChange={(e) =>
                                    setData({ ...data, [k]: e.target.value })
                                }
                            />
                        ) : (
                            <span className={styles.value}>
                                {k === "dob" && data[k]
                                    ? formatDateOnly(data[k])
                                    : data[k]}
                            </span>
                        )}
                    </div>
                ))}

                <div className={styles.btnRow}>
                    {edit ? (
                        <button className={styles.primary} onClick={save}>
                            <FaRegSave /> Save
                        </button>
                    ) : (
                        <button className={styles.primary} onClick={() => setEdit(true)}>
                            <FiEdit /> Edit
                        </button>
                    )}

                    {edit ? (
                        <button className={styles.danger} onClick={() => setEdit(false)}>
                            Cancel
                        </button>
                    ) : (
                        <button className={styles.danger} onClick={del}>
                            <IoMdTrash /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmpPage() {
    const router = useRouter();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(null);
    const [search, setSearch] = useState("");
    const [empData, setEmpData] = useState({
        name: "",
        phone: "",
        password: "",
        email: "",
        department: "",
        post: "",
        salary: 0,
        dob: "",
        address: "",
        aadhar: "",
        pan: "",
    });

    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support', 'Executive'];
    const positions = [
        // Executive & Board
        "Chief Executive Officer",
        "Managing Director",
        "Executive Director",
        "Chief Operating Officer",
        "Chief Financial Officer",
        "Chief Technology Officer",
        "Chief Information Officer",
        "Chief Data Officer",
        "Chief Security Officer",
        "Chief Marketing Officer",
        "Chief Growth Officer",
        "Chief Revenue Officer",
        "Chief Product Officer",
        "Chief Human Resources Officer",
        "Chief Legal Officer",
        "Chief Compliance Officer",
        "Chief Strategy Officer",
        "Chief Innovation Officer",
        "Chief Risk Officer",
        "Board Member",
        "Chairman",
        "Vice Chairman",

        // Senior Leadership & Directors
        "Director",
        "Technical Director",
        "Operations Director",
        "Finance Director",
        "Marketing Director",
        "Sales Director",
        "Product Director",
        "Engineering Director",
        "HR Director",
        "Legal Director",
        "Strategy Director",
        "Regional Director",
        "Country Director",

        // Management
        "Senior Manager",
        "Manager",
        "Assistant Manager",
        "Associate Manager",
        "Team Lead",
        "Project Manager",
        "Program Manager",
        "Delivery Manager",
        "Operations Manager",
        "Business Manager",

        // Technology & Engineering
        "Principal Engineer",
        "Senior Software Engineer",
        "Software Engineer",
        "Junior Software Engineer",
        "Trainee Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Mobile App Developer",
        "Web Developer",
        "Game Developer",
        "DevOps Engineer",
        "Cloud Engineer",
        "Infrastructure Engineer",
        "Site Reliability Engineer",
        "QA Engineer",
        "Test Engineer",
        "Automation Engineer",
        "Security Engineer",
        "Data Engineer",
        "Machine Learning Engineer",
        "AI Engineer",
        "Blockchain Developer",
        "Embedded Systems Engineer",
        "Systems Architect",
        "Solutions Architect",
        "Technical Lead",
        "Engineering Manager",

        // Product & Design
        "Product Manager",
        "Associate Product Manager",
        "Product Owner",
        "Business Analyst",
        "Technical Analyst",
        "UX Designer",
        "UI Designer",
        "Product Designer",
        "Interaction Designer",
        "Visual Designer",
        "Design Lead",
        "Creative Director",

        // Marketing
        "Marketing Manager",
        "Senior Marketing Manager",
        "Marketing Executive",
        "Marketing Coordinator",
        "Marketing Associate",
        "Digital Marketing Manager",
        "Digital Marketing Executive",
        "Performance Marketing Manager",
        "Growth Marketing Manager",
        "Brand Manager",
        "Content Manager",
        "Content Strategist",
        "Copywriter",
        "SEO Specialist",
        "SEM Specialist",
        "Social Media Manager",
        "Community Manager",
        "Influencer Marketing Manager",
        "PR Manager",
        "Communications Manager",

        // Sales & Business Development
        "Sales Manager",
        "Senior Sales Manager",
        "Business Development Manager",
        "Business Development Executive",
        "Sales Executive",
        "Sales Associate",
        "Account Manager",
        "Key Account Manager",
        "Client Relationship Manager",
        "Customer Success Manager",
        "Customer Success Executive",
        "Pre-Sales Engineer",
        "Inside Sales Executive",
        "Field Sales Executive",

        // Finance & Accounts
        "Finance Manager",
        "Senior Accountant",
        "Accountant",
        "Junior Accountant",
        "Accounts Executive",
        "Accounts Assistant",
        "Financial Analyst",
        "Cost Accountant",
        "Tax Consultant",
        "Auditor",
        "Internal Auditor",
        "Payroll Executive",
        "Billing Executive",

        // Human Resources & Administration
        "HR Manager",
        "HR Business Partner",
        "HR Executive",
        "HR Generalist",
        "Talent Acquisition Manager",
        "Recruiter",
        "Training Manager",
        "Learning & Development Executive",
        "People Operations Manager",
        "Admin Manager",
        "Office Manager",
        "Office Administrator",
        "Office Staff",

        // Legal, Compliance & Risk
        "Legal Counsel",
        "Corporate Lawyer",
        "Compliance Officer",
        "Risk Manager",
        "Company Secretary",
        "Contracts Manager",
        "IP Manager",

        // Operations & Support
        "Operations Executive",
        "Operations Coordinator",
        "Supply Chain Manager",
        "Procurement Manager",
        "Procurement Executive",
        "Logistics Manager",
        "Warehouse Manager",
        "Inventory Manager",
        "Facility Manager",

        // Customer Support
        "Customer Support Manager",
        "Customer Support Lead",
        "Customer Support Executive",
        "Technical Support Engineer",
        "Helpdesk Executive",
        "Call Center Executive",

        // Research & Strategy
        "Research Analyst",
        "Market Research Analyst",
        "Strategy Analyst",
        "Strategy Manager",
        "Policy Analyst",

        // Interns & Trainees
        "Tech Intern",
        "Software Intern",
        "Data Intern",
        "Sales Intern",
        "Marketing Intern",
        "HR Intern",
        "Finance Intern",
        "Operations Intern",
        "Management Intern",
        "Graduate Trainee",
        "Management Trainee",

        // On-Ground & Maintenance
        "Security Officer",
        "Watchman",
        "Janitor",
        "Housekeeping Staff",
        "Maintenance Technician",
    ];

    const fetchEmployees = async () => {
        const token = localStorage.getItem("adminToken");
        if (!token) return router.replace("/");

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}admin/fetchEmployees`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        ).then((r) => r.json());

        if (res.ok) setList(res.data);
        setLoading(false);
    };

    const addEmployee = async () => {
        if (!empData.name || !empData.phone || !empData.password || !empData.email || !empData.department || !empData.post || !empData.address || empData.salary < 0 || !empData.dob) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true)
            const adminToken = localStorage.getItem('adminToken');
            const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/addEmployee`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,   // send token in header
                },
                body: JSON.stringify({
                    name: empData.name,
                    email: empData.email,
                    phone: empData.phone,
                    department: empData.department,
                    post: empData.post,
                    salary: empData.salary,
                    dob: empData.dob,
                    address: empData.address,
                    password: empData.password,
                    aadharNo: empData.aadhar,
                    panNo: empData.pan,
                }),
            });
            const res = await req.json();
            
            if (res.ok) {
                setList(prev => [res.data, ...prev]);
                setEmpData({
                    name: "",
                    phone: "",
                    password: "",
                    email: "",
                    department: "",
                    post: "",
                    salary: 0,
                    dob: "",
                    address: ""
                });
                toast.success("Employee added successfully!");
            }
            else {
                if (res?.code == "TOKEN_EXPIRED") {
                    toast.error("Token Expired !");
                    localStorage.clear();
                    router.replace('/admin/login');
                }
                else {
                    toast.error("Failed to add employee");
                }
            }
            setLoading(false)
        } catch (error) {
            console.error('Error adding employee:', error);
            toast.error('Failed to add employee');
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filtered = list.filter((e) =>
        Object.values(e).join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <AdminSideBar page="emp" />
            {loading && <SpinnerComp />}

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Employee Management</h1>
                    <p>Manage all employees</p>
                </div>

                <div className={styles.searchBox}>
                    <div className={styles.searchWrapper}>
                        <MdSearch className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>All Employees</div>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                {["ID", "Name", "Dept", "Post", "Email", "Status"].map((h) => (
                                    <th key={h} className={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((e) => (
                                <tr
                                    key={e.empId}
                                    className={styles.tr}
                                    onClick={() => setCurrent(e)}
                                >
                                    <td className={styles.td}>{e.empId}</td>
                                    <td className={styles.td}>{e.name}</td>
                                    <td className={styles.td}>{e.department}</td>
                                    <td className={styles.td}>{e.post}</td>
                                    <td className={styles.td}>{e.email}</td>
                                    <td className={styles.td}>
                                        <span
                                            className={
                                                e.status === "active"
                                                    ? styles.active
                                                    : styles.inactive
                                            }
                                        >
                                            {e.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {current && (
                    <EmpModal
                        empData={current}
                        closeWindow={() => setCurrent(null)}
                        fetchEmployees={fetchEmployees}
                    />
                )}

                <div className={styles.addCard}>
                    <h3 className={styles.addTitle}>Add New Employee</h3>

                    <div className={styles.addGrid}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={empData.name}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, name: e.target.value }))}
                            className={styles.field}
                        />

                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={empData.phone}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, phone: e.target.value }))}
                            className={styles.field}
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={empData.email}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, email: e.target.value }))}
                            className={styles.field}
                        />

                        <select
                            value={empData.department}
                            onChange={(e) =>
                                setEmpData((prev) => ({ ...prev, department: e.target.value }))
                            }
                            className={styles.selectField}
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>

                        <select
                            value={empData.post}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, post: e.target.value }))}
                            className={styles.selectField}
                        >
                            <option value="">Select Position</option>
                            {positions.map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>


                        <input
                            type="number"
                            placeholder="Salary"
                            value={empData.salary}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, salary: e.target.value }))}
                            className={styles.field}
                        />

                        <input
                            type="text"
                            placeholder="D.O.B."
                            value={empData.dob}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, dob: e.target.value }))}
                            className={styles.field}
                        />

                        <input
                            type="text"
                            placeholder="Address"
                            value={empData.address}
                            onChange={(e) => setEmpData((prev) => ({ ...prev, address: e.target.value }))}
                            className={styles.field}
                        />

                        <input
                            type="text"
                            placeholder="Aadhar No."
                            value={empData.aadhar}
                            onChange={(e) =>
                                setEmpData((prev) => ({ ...prev, aadhar: e.target.value }))
                            }
                            className={styles.field}
                        />
                        <input
                            type="text"
                            placeholder="PAN No."
                            value={empData.pan}
                            onChange={(e) =>
                                setEmpData((prev) => ({ ...prev, pan: e.target.value }))
                            }
                            className={styles.field}
                        />
                        <input
                            type="text"
                            placeholder="Password"
                            value={empData.password}
                            onChange={(e) =>
                                setEmpData((prev) => ({ ...prev, password: e.target.value }))
                            }
                            className={styles.field}
                        />
                    </div>



                    <button onClick={addEmployee} className={styles.addBtn}>
                        <MdAdd size={20} />
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EmpPage;
