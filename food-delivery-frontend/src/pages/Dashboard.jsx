
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, ClipboardList } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import RestaurantCard from "../components/RestaurantCard";
import { getRestaurants } from "../services/restaurantService";

import "./Dashboard.css";

function Dashboard() {
    const { user } = useAuth();

    const [restaurants, setRestaurants] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);

                const data = await getRestaurants();

                setRestaurants(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load restaurants. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const filteredRestaurants = restaurants.filter((restaurant) =>
        restaurant.name?.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(search.toLowerCase())
    );

    if (user?.role !== "customer") {
        return (
            <>
                <Navbar />
                <div className="dashboard-container">
                    <h1>
                        {user?.role
                            ? `${user.role.replace("_", " ")} Dashboard`
                            : "Dashboard"}
                    </h1>
                    <p>Welcome to your FoodExpress account!</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="customer-dashboard">

                <section className="dashboard-hero">
                    <div className="hero-content">
                        <p className="hero-tag">FOODEXPRESS</p>

                        <h1>
                            Hungry, {user?.name || "Food Lover"}?
                        </h1>

                        <p>
                            Discover delicious food from restaurants near you.
                        </p>

                        <div className="dashboard-search">
                            <Search size={21} />

                            <input
                                type="text"
                                placeholder="Search restaurants or cuisines..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="dashboard-shortcuts">

                    <Link to="/cart" className="shortcut-card">
                        <ShoppingCart size={25} />
                        <div>
                            <h3>Your Cart</h3>
                            <p>View your selected food</p>
                        </div>
                    </Link>

                    <Link to="/my-orders" className="shortcut-card">
                        <ClipboardList size={25} />
                        <div>
                            <h3>My Orders</h3>
                            <p>Track your food orders</p>
                        </div>
                    </Link>

                </section>

                <section className="restaurant-section">

                    <div className="section-heading">
                        <div>
                            <h2>Popular Restaurants</h2>
                            <p>Explore restaurants and order your favourite food.</p>
                        </div>
                    </div>

                    {loading && (
                        <p className="dashboard-message">
                            Loading restaurants...
                        </p>
                    )}

                    {error && (
                        <p className="dashboard-error">{error}</p>
                    )}

                    {!loading && !error && filteredRestaurants.length === 0 && (
                        <p className="dashboard-message">
                            No restaurants found.
                        </p>
                    )}

                    {!loading && !error && filteredRestaurants.length > 0 && (
                        <div className="dashboard-restaurant-grid">
                            {filteredRestaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant._id}
                                    restaurant={restaurant}
                                />
                            ))}
                        </div>
                    )}

                </section>

            </div>
        </>
    );
}

export default Dashboard;
