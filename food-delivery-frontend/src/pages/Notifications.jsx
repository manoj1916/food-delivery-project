
import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    Package,
    RefreshCw
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../services/api";

import "./Notifications.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/notifications");

            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            setUnreadCount((previous) => Math.max(0, previous - 1));

            window.dispatchEvent(
                new Event("notifications-updated")
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update notification."
            );
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <>
            <Navbar />

            <div className="notifications-container">
                <div className="notifications-header">
                    <div>
                        <h1>
                            <Bell size={27} />
                            Notifications
                        </h1>

                        <p>
                            Stay updated with your latest notifications.
                        </p>
                    </div>

                    <button
                        className="notification-refresh"
                        onClick={fetchNotifications}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                <div className="notification-summary">
                    <div>
                        <span>Total Notifications</span>
                        <h3>{notifications.length}</h3>
                    </div>

                    <div>
                        <span>Unread Notifications</span>
                        <h3>{unreadCount}</h3>
                    </div>
                </div>

                {loading ? (
                    <div className="notification-message">
                        Loading notifications...
                    </div>
                ) : error ? (
                    <div className="notification-error">
                        {error}
                        <button onClick={fetchNotifications}>
                            Try Again
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                        <Bell size={45} />
                        <h3>No notifications yet</h3>
                        <p>
                            We'll notify you when there are updates.
                        </p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`notification-card ${
                                    notification.isRead ? "read" : "unread"
                                }`}
                            >
                                <div className="notification-icon">
                                    <Package size={23} />
                                </div>

                                <div className="notification-content">
                                    <p className="notification-text">
                                        {notification.message}
                                    </p>

                                    {notification.orderId && (
                                        <p className="notification-order">
                                            Order ID:{" "}
                                            {notification.orderId}
                                        </p>
                                    )}

                                    <span className="notification-date">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>

                                <div className="notification-action">
                                    {notification.isRead ? (
                                        <span className="read-label">
                                            <CheckCheck size={16} />
                                            Read
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleMarkAsRead(
                                                    notification._id
                                                )
                                            }
                                        >
                                            <Check size={16} />
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Notifications;
