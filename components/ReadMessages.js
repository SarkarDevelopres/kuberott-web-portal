import React, { useState } from 'react'

function ReadMessages({ username, phone, email, time, reply, messageBody, replyBy, replyTime }) {
    const [msgTime, msgDate] = time.split('-');
    return (
        <div style={{ width: "100%", marginBottom: 15, padding: 10, borderRadius: 10, border: "none", backgroundColor: "#007f9bb9", color: "#ffffffff", transition: "all 300ms ease-in-out" }}>
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

            <h3
                style={{
                    paddingTop: 15,
                    margin: 0,
                    fontSize: 20,
                    color: "#00b50fff",
                    fontWeight: 600
                }}
            >
                {`Replied On: ${replyTime} by ${replyBy}`}
            </h3>
            <div
                style={{
                    width: "100%",
                    paddingTop: 10,
                    paddingBottom: 10
                }}
            >
                <p>{reply}</p>
            </div>


        </div>
    )
}

export default ReadMessages