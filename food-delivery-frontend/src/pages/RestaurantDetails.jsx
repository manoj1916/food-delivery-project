
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    Star,
    Clock,
    MapPin,
    Plus
} from "lucide-react";

import {
    getRestaurantById,
    getRestaurantMenu
} from "../services/restaurantService";

import { addToCart, clearCartError } from "../redux/cartSlice";
import api from "../services/api";

import "./RestaurantDetails.css";

function RestaurantDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const [restaurant, setRestaurant] = useState(null);
    const [menuCategories, setMenuCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingFoodId, setAddingFoodId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const cartError = useSelector((state) => state.cart.error);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const [restaurantData, menuData] = await Promise.all([
                    getRestaurantById(id),
                    getRestaurantMenu(id)
                ]);

                setRestaurant(restaurantData);
                setMenuCategories(menuData);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load restaurant details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantDetails();
    }, [id]);

    const handleAddToCart = async (food) => {
        dispatch(clearCartError());
        setSuccessMessage("");
        setAddingFoodId(food._id);

        try {
            await api.post("/cart/items", {
                restaurantId: restaurant._id,
                foodItemId: food._id,
                quantity: 1
            });

            dispatch(
                addToCart({
                    id: food._id,
                    restaurantId: restaurant._id,
                    restaurantName: restaurant.name,
                    name: food.name,
                    price: food.price,
                    image: food.image || restaurant.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
                })
            );

            setSuccessMessage(`${food.name} added to your cart!`);

        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Unable to add food to cart. Please try again.";

            dispatch({
                type: "cart/clearCartError"
            });

            setSuccessMessage("");
            setError(message);
        } finally {
            setAddingFoodId(null);
        }
    };

    if (loading) {
        return <div className="orders-message">Loading restaurant...</div>;
    }

    if (error && !restaurant) {
        return (
            <div className="not-found">
                <h2>{error}</h2>
                <Link to="/">Back to Home</Link>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="not-found">
                <h2>Restaurant not found</h2>
                <Link to="/">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="details-page">
            <Link to="/" className="back-link">
                <ArrowLeft size={18} />
                Back to restaurants
            </Link>

            <div className="details-card">
                <img
                    src={
                        restaurant.image ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
                    }
                    alt={restaurant.name}
                    className="details-image"
                />

                <div className="details-content">
                    <h1>{restaurant.name}</h1>

                    <p>{restaurant.cuisine}</p>

                    <div className="details-info">
                        <span>
                            <Star size={17} fill="currentColor" />
                            {restaurant.rating || "New"}
                        </span>

                        <span>
                            <Clock size={17} />
                            {restaurant.deliveryTime || "30-40 min"}
                        </span>

                        <span>
                            <MapPin size={17} />
                            {restaurant.address}
                        </span>
                    </div>

                    <h3>
                        {restaurant.isOpen ? "Open Now" : "Currently Closed"}
                    </h3>
                </div>
            </div>

            <section className="menu-section">
                <h2>Restaurant Menu</h2>

                {cartError && (
                    <p className="cart-error">{cartError}</p>
                )}

                {error && restaurant && (
                    <p className="cart-error">{error}</p>
                )}

                {successMessage && (
                    <p className="cart-success">{successMessage}</p>
                )}

                {menuCategories.length === 0 ? (
                    <p>No menu items are available.</p>
                ) : (
                    menuCategories.map((category) => (
                        <div key={category._id} className="menu-category">
                            <h3>
                                {category.categoryName || category.name}
                            </h3>

                            <div className="menu-grid">
                                {category.items?.map((food) => (
                                    <div className="menu-item" key={food._id}>
                                        <div>
                                            <h3>{food.name}</h3>

                                            <p>{food.description}</p>

                                            <strong>₹{food.price}</strong>

                                            {!food.isAvailable && (
                                                <p className="unavailable">
                                                    Currently unavailable
                                                </p>
                                            )}
                                        </div>

                                        <div className="menu-item-image">
                                            <img
                                                src={
                                                    food.image ||
                                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
                                                }
                                                alt={food.name}
                                            />

                                            <button
                                                disabled={
                                                    !food.isAvailable ||
                                                    !restaurant.isOpen ||
                                                    addingFoodId === food._id
                                                }
                                                onClick={() =>
                                                    handleAddToCart(food)
                                                }
                                            >
                                                <Plus size={17} />
                                                {addingFoodId === food._id
                                                    ? "Adding..."
                                                    : "Add"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

export default RestaurantDetails;
