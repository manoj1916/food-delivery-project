
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Circle, Package } from "lucide-react";

import api from "../services/api";
import Navbar from "../components/Navbar";

import "./OrderTracking.css";

const orderSteps = [
    {
        status: "placed",
        label: "Order Placed",
        description: "Your order has been received."
    },
    {
        status: "confirmed",
        label: "Order Confirmed",
        description: "The restaurant confirmed your order."
    },
    {
        status: "preparing",
        label: "Preparing Food",
        description: "Your food is being prepared."
    },
    {
        status: "out_for_delivery",
        label: "Out for Delivery",
        description: "Your order is on its way."
    },
    {
        status: "delivered",
        label: "Delivered",
        description: "Your order has been delivered."
    }
];

function OrderTracking() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/orders/${id}`);

                setOrder(response.data.order);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load order details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="tracking-message">
                    Loading order details...
                </div>
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Navbar />

                <div className="tracking-message">
                    <h2>{error || "Order not found"}</h2>

                    <Link to="/my-orders">
                        Back to My Orders
                    </Link>
                </div>
            </>
        );
    }

    const currentStep = orderSteps.findIndex(
        (step) => step.status === order.orderStatus
    );

    const isCancelled = order.orderStatus === "cancelled";

    return (
        <>
            <Navbar />

            <div className="tracking-page">

                <div className="tracking-header">
                    <div>
                        <p className="tracking-label">FOODEXPRESS</p>

                        <h1>Track Your Order</h1>

                        <p>Order ID: {order._id}</p>
                    </div>

                    <Link to="/my-orders">
                        Back to My Orders
                    </Link>
                </div>

                <div className="tracking-layout">

                    <section className="tracking-card">
                        <h2>Order Progress</h2>

                        {isCancelled ? (
                            <div className="cancelled-status">
                                <Package size={35} />

                                <h3>Order Cancelled</h3>

                                <p>
                                    This order has been cancelled.
                                </p>
                            </div>
                        ) : (
                            <div className="tracking-timeline">

                                {orderSteps.map((step, index) => {
                                    const completed = currentStep >= index;

                                    return (
                                        <div
                                            className={`tracking-step ${
                                                completed ? "completed" : ""
                                            }`}
                                            key={step.status}
                                        >
                                            <div className="tracking-step-icon">
                                                {completed ? (
                                                    <CheckCircle size={24} />
                                                ) : (
                                                    <Circle size={24} />
                                                )}
                                            </div>

                                            <div>
                                                <h3>{step.label}</h3>

                                                <p>{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        )}
                    </section>

                    <section className="tracking-card order-summary-card">

                        <h2>Order Summary</h2>

                        <h3>
                            {order.restaurantId?.name || "Restaurant"}
                        </h3>

                        {order.items?.map((item, index) => (
                            <div
                                className="tracking-food-item"
                                key={`${item.foodItemId}-${index}`}
                            >
                                <span>
                                    {item.name} × {item.quantity}
                                </span>

                                <strong>
                                    ₹{item.price * item.quantity}
                                </strong>
                            </div>
                        ))}

                        <hr />

                        <div className="tracking-total">
                            <span>Total Amount</span>

                            <strong>₹{order.totalAmount}</strong>
                        </div>

                        <div className="tracking-address">
                            <strong>Delivery Address</strong>

                            <p>{order.deliveryAddress}</p>
                        </div>

                        <div className="tracking-payment">
                            <span>Payment Status</span>

                            <strong>{order.paymentStatus}</strong>
                        </div>

                        <div className="tracking-payment">
                            <span>Order Status</span>

                            <strong>
                                {order.orderStatus?.replaceAll("_", " ")}
                            </strong>
                        </div>

                        {order.createdAt && (
                            <p className="tracking-date">
                                Ordered on:{" "}
                                {new Date(
                                    order.createdAt
                                ).toLocaleString()}
                            </p>
                        )}

                    </section>

                </div>
            </div>
        </>
    );
}

export default OrderTracking;
