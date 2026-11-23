
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    setCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart
} from "../redux/cartSlice";

import api from "../services/api";
import { Plus, Minus, Trash2 } from "lucide-react";
import "./Cart.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";

function Cart() {
    const dispatch = useDispatch();

    const items = useSelector((state) => state.cart.items);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingItem, setUpdatingItem] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/cart");
                const cart = response.data.cart;

                if (!cart) {
                    dispatch(setCart({
                        items: [],
                        restaurantId: null
                    }));
                    return;
                }

                const restaurantId =
                    cart.restaurantId?._id || cart.restaurantId;

                const normalizedItems = cart.items.map((item) => ({
                    id: item.foodItemId?._id || item.foodItemId,
                    restaurantId,
                    restaurantName: "Your Restaurant",
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || FALLBACK_IMAGE
                }));

                dispatch(setCart({
                    items: normalizedItems,
                    restaurantId
                }));

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your cart."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [dispatch]);

    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            setError("");
            setUpdatingItem(item.id);

            await api.put(`/cart/items/${item.id}`, {
                quantity: newQuantity
            });

            if (newQuantity > item.quantity) {
                dispatch(increaseQuantity(item.id));
            } else {
                dispatch(decreaseQuantity(item.id));
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update item quantity."
            );
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setError("");
            setUpdatingItem(itemId);

            await api.delete(`/cart/items/${itemId}`);

            dispatch(removeFromCart(itemId));

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to remove item."
            );
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleClearCart = async () => {
        try {
            setError("");
            setLoading(true);

            await api.delete("/cart");

            dispatch(clearCart());

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to clear your cart."
            );
        } finally {
            setLoading(false);
        }
    };

    const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const deliveryFee = items.length > 0 ? 30 : 0;
    const grandTotal = subtotal + deliveryFee;

    if (loading) {
        return (
            <div className="empty-cart">
                <h2>Loading your cart...</h2>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="empty-cart">
                <h1>Your cart is empty!</h1>
                <p>Add delicious food from your favourite restaurant.</p>

                {error && <p className="checkout-error">{error}</p>}

                <Link to="/">Explore Restaurants</Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart</h1>

            {error && <p className="checkout-error">{error}</p>}

            <div className="cart-layout">
                <div className="cart-items">
                    {items.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <img
                                src={item.image || FALLBACK_IMAGE}
                                alt={item.name}
                            />

                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p>{item.restaurantName}</p>
                                <strong>₹{item.price}</strong>

                                <div className="quantity-controls">
                                    <button
                                        disabled={
                                            updatingItem === item.id ||
                                            item.quantity <= 1
                                        }
                                        onClick={() =>
                                            handleQuantityChange(
                                                item,
                                                item.quantity - 1
                                            )
                                        }
                                    >
                                        <Minus size={15} />
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        disabled={updatingItem === item.id}
                                        onClick={() =>
                                            handleQuantityChange(
                                                item,
                                                item.quantity + 1
                                            )
                                        }
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>
                            </div>

                            <button
                                className="remove-btn"
                                disabled={updatingItem === item.id}
                                onClick={() => handleRemoveItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                            >
                                <Trash2 size={19} />
                            </button>
                        </div>
                    ))}

                    <button
                        className="clear-cart-btn"
                        onClick={handleClearCart}
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="bill-card">
                    <h2>Bill Details</h2>

                    <div className="bill-row">
                        <span>Item Total</span>
                        <span>₹{subtotal}</span>
                    </div>

                    <div className="bill-row">
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee}</span>
                    </div>

                    <hr />

                    <div className="bill-row bill-total">
                        <strong>Grand Total</strong>
                        <strong>₹{grandTotal}</strong>
                    </div>

                    <Link to="/checkout" className="checkout-btn">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Cart;
