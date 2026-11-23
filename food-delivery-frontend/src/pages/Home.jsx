
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import RestaurantCard from "../components/RestaurantCard";

import { getRestaurants } from "../services/restaurantService";
import "./Home.css";

const categories = [
    "All",
    "Biryani",
    "Pizza",
    "Burgers",
    "South Indian"
];

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getRestaurants();
                setRestaurants(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load restaurants."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const filteredRestaurants = restaurants.filter((restaurant) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            restaurant.name?.toLowerCase().includes(searchText) ||
            restaurant.cuisine?.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            restaurant.cuisine?.toLowerCase().includes(
                selectedCategory.toLowerCase()
            );

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Navbar />

            <Hero
                search={search}
                setSearch={setSearch}
            />

            <main className="home-container">
                <section className="category-section">
                    <h2>Explore Categories</h2>

                    <div className="category-list">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={
                                    selectedCategory === category
                                        ? "category-btn active"
                                        : "category-btn"
                                }
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </section>

                <section id="restaurants">
                    <div className="section-heading">
                        <h2>Popular Restaurants</h2>
                        <p>Explore the best food around you</p>
                    </div>

                    {loading && <p>Loading restaurants...</p>}

                    {error && (
                        <p className="no-results">{error}</p>
                    )}

                    {!loading && !error && (
                        <div className="restaurant-grid">
                            {filteredRestaurants.length > 0 ? (
                                filteredRestaurants.map((restaurant) => (
                                    <RestaurantCard
                                        key={restaurant._id}
                                        restaurant={restaurant}
                                    />
                                ))
                            ) : (
                                <p className="no-results">
                                    No restaurants found.
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

export default Home;
