"use client"
import React, { useState } from 'react'
import { toast } from 'react-toastify';

function UnreadMessages({ id, username, phone, email, time, messageBody, isRead, isEmp, fetchMessages }) {
    const [isReply, setIsReply] = useState(false);
    const [msgTime, msgDate] = time.split('-');
    const [replyText, setReplyText] = useState("");

    const markAsRead = async () => {
         let authToken;
        if (isEmp) {
            let empToken = localStorage.getItem('empToken')
            if (!empToken || empToken == "" || empToken == null) {
                toast.error("Invaid Login");
                router.replace('/')
            }
            authToken = empToken;
        }
        else {
            let adminToken = localStorage.getItem('adminToken')
            if (!adminToken || adminToken == "" || adminToken == null) {
                toast.error("Invaid Login");
                router.replace('/')
            }
            authToken = adminToken;
        }

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/${isEmp?"employee":"admin"}/markAsRead`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify({ id }),
        });
        let res = await req.json();

        if (res.ok) {
            toast.success("Message marked read !");
            fetchMessages();
        }
        else { toast.error(`${res.message}`) }
    }

    const reply = async () => {

        let authToken;
        if (isEmp) {
            let empToken = localStorage.getItem('empToken')
            if (!empToken || empToken == "" || empToken == null) {
                toast.error("Invaid Login");
                router.replace('/')
            }
            authToken = empToken;
        }
        else {
            let adminToken = localStorage.getItem('adminToken')
            if (!adminToken || adminToken == "" || adminToken == null) {
                toast.error("Invaid Login");
                router.replace('/')
            }
            authToken = adminToken;
        }

        if (replyText == "" || !replyText) {
            toast.error("Reply missing !");
            return;
        }
        else if (replyText.length < 10) {
            toast.warn("Wrtie a proper reply!");
            return;
        }

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/${isEmp?"employee":"admin"}/replyMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify({ id: id, reply: replyText }),
        });
        let res = await req.json();
        console.log(res);

        if (res.ok) {
            toast.success("Message marked read !");
            fetchMessages();
        }
        else {
            toast.error(`${res.message}`)
        }
    }
    return (
        <div style={{ width: "100%", marginBottom: 15, padding: 10, borderRadius: 10, border: "none", backgroundColor: `${isRead ? "#ffa600ca" : "#129b00b9"}`, color: "#ffffffff", transition: "all 300ms ease-in-out" }}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline"
                }}
            >
                <div
                    style={{
                        width: "70%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div>
                        <span style={{ paddingRight: 15 }}>{username}</span>
                        <span>{phone}</span>
                    </div>
                    <span>{email}</span>
                </div>
                <div
                    style={{
                        width: "30%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "end"
                    }}
                >
                    <span>{msgTime}</span>
                    <span>{msgDate}</span>
                </div>
            </div>
            <div
                style={{
                    width: "100%",
                    paddingTop: 20,
                    paddingBottom: 20
                }}
            >
                <p>{messageBody}</p>
            </div>
            {!isReply && <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
                {!isRead && <button
                    style={{
                        padding: 10,
                        borderRadius: 10,
                        border: "none",
                        width: 120,
                        marginRight: 10,
                        backgroundColor: "#5900ffff",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#31008dff";
                        e.target.style.cursor = "pointer"
                    }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = "#5900ffff" }}
                    onClick={() => markAsRead()}
                >
                    Mark as Read
                </button>}
                <button
                    style={{
                        padding: 10,
                        borderRadius: 10,
                        border: "none",
                        width: 100,
                        backgroundColor: "#5900ffff",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#31008dff";
                        e.target.style.cursor = "pointer"
                    }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = "#5900ffff" }}
                    onClick={() => { setIsReply(true) }}
                >
                    Reply
                </button>
            </div>}

            {
                isReply && <div style={{ width: "100%", paddingTop: 20 }}>
                    <textarea
                        style={{ width: "100%", borderRadius: 10, border: "none", backgroundColor: "#fff", resize: "none", rowCount: 12, color: "#000", padding: 5, height: 100 }}
                        value={replyText}
                        onChange={(e) => { setReplyText(e.target.value) }} />
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "end",
                            paddingTop: 10
                        }}
                    >
                        <button
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                border: "none",
                                width: 100,
                                backgroundColor: "#0033ffff",
                                marginRight: 10
                            }}
                            onClick={() => { setIsReply(false) }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#31008dff";
                                e.target.style.cursor = "pointer"
                            }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#0033ffff" }}
                        >
                            Hide
                        </button>
                        <button
                            style={{
                                padding: 10,
                                borderRadius: 10,
                                border: "none",
                                width: 100, backgroundColor: "#5900ffff"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#31008dff";
                                e.target.style.cursor = "pointer"
                            }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#5900ffff" }}
                            onClick={reply}
                        >
                            Reply
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}

export default UnreadMessages