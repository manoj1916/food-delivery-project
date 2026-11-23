
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./DeliveryDashboard.css";

function DeliveryDashboard() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/my-deliveries");

            setDeliveries(response.data.deliveries || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load deliveries."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const updateStatus = async (orderId, status) => {
        try {
            setUpdatingId(orderId);
            setError("");
            setMessage("");

            await api.put(`/deliveries/${orderId}/status`, {
                orderStatus: status
            });

            setMessage("Delivery status updated successfully.");

            await fetchDeliveries();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update delivery status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <>
            <Navbar />

            <div className="delivery-dashboard">
                <div className="delivery-header">
                    <h1>Delivery Partner Dashboard</h1>
                    <p>Manage your assigned food deliveries.</p>
                </div>

                {message && (
                    <p className="delivery-success">{message}</p>
                )}

                {error && (
                    <p className="delivery-error">{error}</p>
                )}

                {loading ? (
                    <p>Loading deliveries...</p>
                ) : deliveries.length === 0 ? (
                    <div className="no-deliveries">
                        <h2>No deliveries assigned</h2>
                        <p>New assigned orders will appear here.</p>
                    </div>
                ) : (
                    <div className="delivery-list">
                        {deliveries.map((order) => (
                            <div className="delivery-card" key={order._id}>
                                <h3>
                                    Order #{order._id.slice(-6)}
                                </h3>

                                <p>
                                    Restaurant:{" "}
                                    {order.restaurantId?.name || "Restaurant"}
                                </p>

                                <p>
                                    Customer: {order.userId?.name || "Customer"}
                                </p>

                                <p>
                                    Address: {order.deliveryAddress}
                                </p>

                                <p>
                                    Amount: ₹{order.totalAmount}
                                </p>

                                <p>
                                    Status: {order.orderStatus}
                                </p>

                                {order.orderStatus === "confirmed" && (
                                    <button
                                        disabled={updatingId === order._id}
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "out_for_delivery"
                                            )
                                        }
                                    >
                                        Pick Up Order
                                    </button>
                                )}

                                {order.orderStatus === "out_for_delivery" && (
                                    <button
                                        disabled={updatingId === order._id}
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "delivered"
                                            )
                                        }
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default DeliveryDashboard;
