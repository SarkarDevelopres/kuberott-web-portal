"use client"
import React, { useState, useEffect } from 'react'
import AdminSideBar from '@/components/AdminSideBar'
import { MdSearch, MdPhone, MdEmail, MdPerson } from "react-icons/md";
import { FaUser, FaBuilding } from "react-icons/fa";
import { toast } from 'react-toastify';
import SpinnerComp from '@/components/Spinner';
import { useRouter } from 'next/navigation';
import { IoMailUnreadOutline } from "react-icons/io5";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import UnreadMessages from '@/components/UnreadMessages';
import ReadMessages from '@/components/ReadMessages';
import styles from "./style.module.css"
// import { socket } from "@/utils/socket";
// import { useNotification } from "@/context/notificationContext";

function MessagePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // const { hasNotification, setHasNotification } = useNotification();
    const [readMessages, setReadMessages] = useState([
        {
            username: "sagniksarkar",
            phone: 7001809047,
            email: "sarkarindustries77@gmail.com",
            createdAt: "2025-11-04T14:02:11.000Z",
            message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere dictum sagittis. Nam tempus feugiat mauris, quis mollis diam malesuada vitae. In in faucibus elit.",
            replyTime: "2025-11-04T20:08:21.000Z",
            replyBy: "Admin",
            reply: "Nam tempus feugiat mauris, consectetur adipiscing elit. Fusce posuere dictum sagittis quis mollis diam malesuada vitae. In in faucibus elit.",
        },

    ]);
    const [unReadMessages, setUnReadMessages] = useState([
        {
            username: "sagniksarkar",
            phone: 7001809047,
            email: "sarkarindustries77@gmail.com",
            createdAt: "2025-11-04T14:02:11.000Z",
            message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere dictum sagittis. Nam tempus feugiat mauris, quis mollis diam malesuada vitae. In in faucibus elit.",
        },
        {
            username: "samratsarkar",
            phone: 7001809047,
            email: "sarkarindustries77@gmail.com",
            createdAt: "2025-11-04T14:02:11.000Z",
            message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere dictum sagittis. Nam tempus feugiat mauris, quis mollis diam malesuada vitae. In in faucibus elit.",
        },
        {
            username: "sagniksarkar",
            phone: 7001809047,
            email: "sarkarindustries77@gmail.com",
            createdAt: "2025-11-04T14:02:11.000Z",
            message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere dictum sagittis. Nam tempus feugiat mauris, quis mollis diam malesuada vitae. In in faucibus elit.",
        },
    ]);
    const [repliedMessages, setRepliedMessages] = useState([])
    function formatISOToCustom(isoString) {
        const date = new Date(isoString);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2); // YY format

        return `${hours}:${minutes}:${seconds}-${day}/${month}/${year}`;
    }

    const fetchMessages = async () => {
        let adminToken = localStorage.getItem('adminToken')
        if (!adminToken || adminToken == "" || adminToken == null) {
            toast.error("Invaid Login");
            router.replace('/')
        }

        let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}admin/fetchMessages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,
            },
        });
        let res = await req.json();
        console.log(res);


        if (res.ok) {
            // setHasNotification(false);
            let readMessages = res.messages.filter(m => m.isRead != false && m.isAnswered == false);
            let unreadMessages = res.messages.filter(m => m.isRead == false);
            let repliedMessages = res.messages.filter(m => m.isAnswered == true);

            setReadMessages([...readMessages]);
            setUnReadMessages([...unreadMessages]);
            setRepliedMessages([...repliedMessages]);
        }

    }

    // useEffect(() => {
    //     socket.connect();

    //     socket.emit("join_admin");

    //     socket.on("get_message", (data) => {
    //         setUnReadMessages((prev) => [...prev, data]);
    //     });

    //     socket.emit("join_room", "admin-room");

    //     return () => {
    //         socket.off("get_message");
    //         socket.disconnect();
    //     };
    // }, [])


    useEffect(() => {
        // fetchMessages();
    }, [])


    return (
        <div className={styles.page}>
            <AdminSideBar page={"msg"} />
            {isLoading && <SpinnerComp />}

            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Support & Help</h1>
                    <p className={styles.subtitle}>Handle all customer queries</p>
                </div>

                {/* Unread */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <IoMailUnreadOutline className={styles.icon} />
                        <span>Unread Messages</span>
                    </h3>

                    <div className={styles.messageBox}>
                        {unReadMessages.map((e, i) => (
                            <UnreadMessages
                                key={i}
                                id={e._id}
                                username={e.username}
                                phone={e.phone}
                                email={e.email}
                                isRead={e.isRead}
                                time={formatISOToCustom(e.createdAt)}
                                messageBody={e.message}
                                fetchMessages={fetchMessages}
                            />
                        ))}
                    </div>
                </div>

                {/* Read */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <MdOutlineMarkEmailRead className={styles.icon} />
                        <span>Read Messages</span>
                    </h3>

                    <div className={styles.messageBox}>
                        {readMessages.map((e, i) => (
                            <UnreadMessages
                                key={i}
                                id={e._id}
                                username={e.username}
                                phone={e.phone}
                                email={e.email}
                                isRead={e.isRead}
                                time={formatISOToCustom(e.createdAt)}
                                messageBody={e.message}
                            />
                        ))}
                    </div>
                </div>

                {/* Replied */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <MdOutlineMarkEmailRead className={styles.icon} />
                        <span>Replied Messages</span>
                    </h3>

                    <div className={styles.messageBox}>
                        {repliedMessages.map((e, i) => (
                            <ReadMessages
                                key={i}
                                id={e._id}
                                username={e.username}
                                phone={e.phone}
                                email={e.email}
                                time={formatISOToCustom(e.createdAt)}
                                messageBody={e.message}
                                reply={e.replyText}
                                replyBy={e.replyBy}
                                replyTime={formatISOToCustom(e.replyTime)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

}

export default MessagePage