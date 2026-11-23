
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

function RestaurantCard({ restaurant }) {
    const image =
        restaurant.image ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";

    return (
        <Link
            to={`/restaurant/${restaurant._id}`}
            className="restaurant-card-link"
        >
            <div className="restaurant-card">
                <div className="restaurant-image">
                    <img
                        src={image}
                        alt={restaurant.name}
                    />

                    {restaurant.offer && (
                        <span className="offer">
                            {restaurant.offer}
                        </span>
                    )}
                </div>

                <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>

                    <div className="rating">
                        <Star size={16} fill="currentColor" />
                        <span>{restaurant.rating || "New"}</span>
                        <span>• {restaurant.deliveryTime || "30-40 min"}</span>
                    </div>

                    <p>{restaurant.cuisine || "Various cuisines"}</p>
                    <p>{restaurant.address}</p>
                </div>
            </div>
        </Link>
    );
}

export default RestaurantCard;
