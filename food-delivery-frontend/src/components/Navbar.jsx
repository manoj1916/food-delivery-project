
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    ShoppingCart,
    MapPin,
    UserRound,
    LogOut,
    Bell
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";
import api from "../services/api";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [unreadCount, setUnreadCount] = useState(0);

    const items = useSelector((state) => state.cart.items);

    const cartCount = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const getDashboardLink = () => {
        if (user?.role === "admin") {
            return "/admin-dashboard";
        }

        if (user?.role === "restaurant_owner") {
            return "/owner-dashboard";
        }

        if (user?.role === "delivery_partner") {
            return "/delivery-dashboard";
        }

        return "/dashboard";
    };

    // Logo destination depends on login role
    const getHomeLink = () => {
        if (user?.role === "restaurant_owner") {
            return "/owner-dashboard";
        }

        if (user?.role === "admin") {
            return "/admin-dashboard";
        }

        if (user?.role === "delivery_partner") {
            return "/delivery-dashboard";
        }

        return "/";
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get("/notifications");
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error(
                "Failed to fetch notification count:",
                error
            );
        }
    };

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();

        const handleNotificationUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener(
            "notifications-updated",
            handleNotificationUpdate
        );

        return () => {
            window.removeEventListener(
                "notifications-updated",
                handleNotificationUpdate
            );
        };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const isCustomer = !user || user.role === "customer";

    return (
        <nav className="navbar">
            <Link to={getHomeLink()} className="logo">
                <span>Food</span>Express
            </Link>

            {isCustomer && (
                <div className="location">
                    <MapPin size={18} />
                    <span>Bengaluru, India</span>
                </div>
            )}

            <div className="nav-links">

                {/* Public and customer navigation */}
                {isCustomer && (
                    <>
                        <Link to="/">Home</Link>

                        <Link to="/#restaurants">
                            Restaurants
                        </Link>
                    </>
                )}

                {/* Customer cart */}
                {user?.role === "customer" && (
                    <Link to="/cart" className="cart-link">
                        <ShoppingCart size={19} />
                        Cart ({cartCount})
                    </Link>
                )}

                {/* Customer orders */}
                {user?.role === "customer" && (
                    <Link to="/my-orders">
                        My Orders
                    </Link>
                )}

                {/* Notifications for logged-in users */}
                {user && (
                    <Link
                        to="/notifications"
                        className="cart-link notification-nav-link"
                    >
                        <Bell size={19} />

                        Notifications

                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}
                            </span>
                        )}
                    </Link>
                )}

                {/* Dashboard and logout */}
                {user ? (
                    <>
                        <Link
                            to={getDashboardLink()}
                            className="cart-link"
                        >
                            <UserRound size={17} />
                            Dashboard
                        </Link>

                        <button
                            className="login-btn"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="login-btn">
                        <UserRound size={17} />
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
