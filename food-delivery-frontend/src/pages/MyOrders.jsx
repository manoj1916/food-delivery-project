
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./MyOrders.css";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/my-orders");

            setOrders(response.data.orders || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) return;

        try {
            setMessage("");
            setError("");
            setActionLoading(orderId);

            await api.delete(`/orders/${orderId}`);

            setMessage("Order cancelled successfully.");

            await fetchOrders();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to cancel this order."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handlePayment = async (orderId) => {
        try {
            setMessage("");
            setError("");
            setActionLoading(orderId);

            await api.post(`/payments/${orderId}/simulate`, {
                paymentResult: "success"
            });

            setMessage("Payment successful!");

            await fetchOrders();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Payment could not be processed."
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="orders-message">
                Loading your orders...
            </div>
        );
    }

    return (
        <div className="orders-page">

            <div className="orders-header">
                <div>
                    <h1>My Orders</h1>
                    <p>View and track your food orders.</p>
                </div>

                <Link to="/">Order More Food</Link>
            </div>

            {message && (
                <p className="orders-success">{message}</p>
            )}

            {error && (
                <p className="orders-error">{error}</p>
            )}

            {orders.length === 0 ? (
                <div className="no-orders">
                    <h2>No orders yet!</h2>

                    <p>
                        Your placed orders will appear here.
                    </p>

                    <Link to="/">Explore Restaurants</Link>
                </div>
            ) : (
                <div className="orders-list">

                    {orders.map((order) => (
                        <div className="order-card" key={order._id}>

                            <div className="order-card-header">
                                <div>
                                    <h3>
                                        {order.restaurantId?.name ||
                                            "Restaurant"}
                                    </h3>

                                    <p className="order-id">
                                        Order ID: {order._id}
                                    </p>

                                    {order.createdAt && (
                                        <p>
                                            Ordered on:{" "}
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className={`status-badge ${order.orderStatus}`}
                                >
                                    {order.orderStatus?.replaceAll("_", " ")}
                                </span>
                            </div>

                            <div className="order-food-items">
                                <h4>Ordered Items</h4>

                                {order.items?.map((item, index) => (
                                    <p key={`${item.foodItemId}-${index}`}>
                                        {item.name} × {item.quantity}
                                        {" — ₹"}
                                        {item.price * item.quantity}
                                    </p>
                                ))}
                            </div>

                            <div className="order-address">
                                <strong>Delivery Address</strong>
                                <p>{order.deliveryAddress}</p>
                            </div>

                            <div className="order-details-row">
                                <span>
                                    Payment: {order.paymentStatus}
                                </span>

                                <strong>
                                    ₹{order.totalAmount}
                                </strong>
                            </div>

                            <div className="order-actions">

                                <Link
                                    to={`/orders/${order._id}`}
                                    className="track-order-btn"
                                >
                                    Track Order
                                </Link>

                                {order.paymentStatus === "pending" &&
                                    order.orderStatus !== "cancelled" && (
                                        <button
                                            className="pay-btn"
                                            disabled={actionLoading === order._id}
                                            onClick={() =>
                                                handlePayment(order._id)
                                            }
                                        >
                                            {actionLoading === order._id
                                                ? "Processing..."
                                                : "Simulate Payment"}
                                        </button>
                                    )}

                                {["placed", "confirmed"].includes(
                                    order.orderStatus
                                ) && (
                                    <button
                                        className="cancel-btn"
                                        disabled={actionLoading === order._id}
                                        onClick={() =>
                                            handleCancelOrder(order._id)
                                        }
                                    >
                                        {actionLoading === order._id
                                            ? "Processing..."
                                            : "Cancel Order"}
                                    </button>
                                )}

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default MyOrders;
