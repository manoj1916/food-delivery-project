
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import api from "../services/api";
import "./Checkout.css";

function Checkout() {
    const dispatch = useDispatch();

    const items = useSelector((state) => state.cart.items);

    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const deliveryFee = items.length > 0 ? 30 : 0;
    const grandTotal = subtotal + deliveryFee;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!address.trim()) {
            setError("Please enter your delivery address.");
            return;
        }

        if (items.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        try {
            setLoading(true);

            // Items are already saved in the backend cart.
            // Place the order directly from that cart.
            const response = await api.post("/orders", {
                deliveryAddress: address.trim()
            });

            const order =
                response.data.order ||
                response.data.data ||
                null;

            setSuccess(
                `Your order has been placed successfully! ${
                    order?._id ? `Order ID: ${order._id}` : ""
                }`
            );

            dispatch(clearCart());

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to place your order. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !success) {
        return (
            <div className="checkout-empty">
                <h2>Your cart is empty</h2>
                <Link to="/">Explore Restaurants</Link>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            {success ? (
                <div className="checkout-success">
                    <h2>Order Confirmed!</h2>
                    <p>{success}</p>

                    <Link to="/my-orders">
                        View My Orders
                    </Link>

                    <br />

                    <Link to="/">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="checkout-layout">
                    <form
                        className="address-card"
                        onSubmit={handlePlaceOrder}
                    >
                        <h2>Delivery Address</h2>

                        <label htmlFor="deliveryAddress">
                            Full delivery address
                        </label>

                        <textarea
                            id="deliveryAddress"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter house number, street, area, city and PIN code"
                            rows={5}
                            required
                        />

                        {error && (
                            <p className="checkout-error">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={loading}
                        >
                            {loading ? "Placing Order..." : "Place Order"}
                        </button>
                    </form>

                    <div className="checkout-summary">
                        <h2>Order Summary</h2>

                        {items.map((item) => (
                            <div className="checkout-item" key={item.id}>
                                <div>
                                    <h4>{item.name}</h4>
                                    <p>Quantity: {item.quantity}</p>
                                </div>

                                <strong>
                                    ₹{item.price * item.quantity}
                                </strong>
                            </div>
                        ))}

                        <hr />

                        <div className="checkout-row">
                            <span>Item Total</span>
                            <span>₹{subtotal}</span>
                        </div>

                        <div className="checkout-row">
                            <span>Delivery Fee</span>
                            <span>₹{deliveryFee}</span>
                        </div>

                        <hr />

                        <div className="checkout-row checkout-grand-total">
                            <strong>Grand Total</strong>
                            <strong>₹{grandTotal}</strong>
                        </div>

                        <p className="payment-note">
                            Payment will be handled after order placement.
                        </p>

                        <Link to="/cart" className="back-to-cart">
                            Back to Cart
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Checkout;
