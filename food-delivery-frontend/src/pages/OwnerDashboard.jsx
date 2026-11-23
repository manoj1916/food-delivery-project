
import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Pencil,
    Store,
    Utensils,
    ClipboardList,
    Truck,
    RefreshCw
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./OwnerDashboard.css";

function OwnerDashboard() {
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [restaurantForm, setRestaurantForm] = useState({
        name: "",
        description: "",
        address: "",
        cuisine: ""
    });

    const [categoryName, setCategoryName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [foodForm, setFoodForm] = useState({
        name: "",
        description: "",
        price: ""
    });

    const [showFoodForm, setShowFoodForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [availablePartners, setAvailablePartners] = useState([]);
    const [selectedPartners, setSelectedPartners] = useState({});
    const [partnersLoading, setPartnersLoading] = useState(false);
    const [orderActionLoading, setOrderActionLoading] = useState(null);

    // Fetch restaurant and menu
    const fetchRestaurant = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/restaurants");
            const restaurants = response.data.restaurants || [];

            const ownerRestaurant = restaurants.find((item) => {
                const ownerId = item.ownerId?._id || item.ownerId;
                return String(ownerId) === String(user.id);
            });

            if (ownerRestaurant) {
                setRestaurant(ownerRestaurant);

                setRestaurantForm({
                    name: ownerRestaurant.name || "",
                    description: ownerRestaurant.description || "",
                    address: ownerRestaurant.address || "",
                    cuisine: ownerRestaurant.cuisine || ""
                });

                await fetchMenu(ownerRestaurant._id);
                await fetchOrders();
                await fetchAvailablePartners();
            } else {
                setRestaurant(null);
                setCategories([]);
                setOrders([]);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load restaurant details."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch menu - corrected response handling
    const fetchMenu = async (restaurantId) => {
        try {
            const response = await api.get(
                `/restaurants/${restaurantId}/menu`
            );

            const data = response.data;

            // Backend returns:
            // { success: true, restaurant: { menuCategories: [] } }

            const menuCategories =
                data.restaurant?.menuCategories ||
                data.menuCategories ||
                data.data?.restaurant?.menuCategories ||
                data.data?.menuCategories ||
                data.menu ||
                [];

            setCategories(
                Array.isArray(menuCategories)
                    ? menuCategories
                    : []
            );

        } catch (err) {
            console.error("Menu loading error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load restaurant menu."
            );

            setCategories([]);
        }
    };

    // Fetch approved and available delivery partners
    const fetchAvailablePartners = async () => {
        try {
            setPartnersLoading(true);
            const response = await api.get("/delivery-partners/available");
            setAvailablePartners(response.data.partners || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load available delivery partners."
            );
            setAvailablePartners([]);
        } finally {
            setPartnersLoading(false);
        }
    };

    // Fetch restaurant orders
    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);

            const response = await api.get("/orders/restaurant");
            setOrders(response.data.orders || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load restaurant orders."
            );
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchRestaurant();
        }
    }, [user?.id]);

    // Restaurant form
    const handleRestaurantChange = (e) => {
        setRestaurantForm({
            ...restaurantForm,
            [e.target.name]: e.target.value
        });
    };

    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            if (restaurant) {
                const response = await api.put(
                    `/restaurants/${restaurant._id}`,
                    restaurantForm
                );

                setRestaurant(response.data.restaurant);
                setMessage("Restaurant details updated successfully.");
            } else {
                const response = await api.post(
                    "/restaurants",
                    restaurantForm
                );

                setRestaurant(response.data.restaurant);
                setMessage("Restaurant created successfully.");

                await fetchMenu(response.data.restaurant._id);
                await fetchOrders();
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save restaurant details."
            );
        } finally {
            setSaving(false);
        }
    };

    // Open or close restaurant
    const handleToggleRestaurant = async () => {
        try {
            setError("");
            setMessage("");

            const response = await api.put(
                `/restaurants/${restaurant._id}`,
                { isOpen: !restaurant.isOpen }
            );

            setRestaurant(response.data.restaurant);

            setMessage(
                response.data.restaurant.isOpen
                    ? "Restaurant is now open."
                    : "Restaurant is now closed."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update restaurant status."
            );
        }
    };

    // Add menu category
    const handleAddCategory = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) return;

        try {
            setError("");
            setMessage("");

            await api.post(
                `/restaurants/${restaurant._id}/menu/categories`,
                {
                    categoryName: categoryName.trim()
                }
            );

            setCategoryName("");
            setMessage("Menu category added successfully.");

            await fetchMenu(restaurant._id);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add category."
            );
        }
    };

    // Delete menu category
    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Delete this category and all its food items?")) {
            return;
        }

        try {
            await api.delete(
                `/restaurants/${restaurant._id}/menu/categories/${categoryId}`
            );

            setMessage("Category deleted successfully.");
            setError("");

            await fetchMenu(restaurant._id);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete category."
            );
        }
    };

    // Food form
    const handleFoodFormChange = (e) => {
        setFoodForm({
            ...foodForm,
            [e.target.name]: e.target.value
        });
    };

    // Add food item
    const handleAddFood = async (e) => {
        e.preventDefault();

        if (!selectedCategory) {
            setError("Please select a menu category.");
            return;
        }

        try {
            setError("");
            setMessage("");

            await api.post(
                `/restaurants/${restaurant._id}/menu/categories/${selectedCategory}/items`,
                {
                    ...foodForm,
                    price: Number(foodForm.price)
                }
            );

            setFoodForm({
                name: "",
                description: "",
                price: ""
            });

            setShowFoodForm(false);
            setMessage("Food item added successfully.");

            await fetchMenu(restaurant._id);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add food item."
            );
        }
    };

    // Edit food item
    const handleEditFood = async (categoryId, food) => {
        const name = window.prompt("Food name:", food.name);
        if (name === null) return;

        const description = window.prompt(
            "Food description:",
            food.description || ""
        );
        if (description === null) return;

        const price = window.prompt("Food price:", food.price);
        if (price === null) return;

        if (!name.trim() || !price.trim() || Number(price) <= 0) {
            setError("Enter a valid food name and positive price.");
            return;
        }

        try {
            await api.put(
                `/restaurants/${restaurant._id}/menu/categories/${categoryId}/items/${food._id}`,
                {
                    name: name.trim(),
                    description,
                    price: Number(price)
                }
            );

            setMessage("Food item updated successfully.");
            setError("");

            await fetchMenu(restaurant._id);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update food item."
            );
        }
    };

    // Enable or disable food
    const handleToggleFood = async (categoryId, food) => {
        try {
            await api.put(
                `/restaurants/${restaurant._id}/menu/categories/${categoryId}/items/${food._id}`,
                { isAvailable: !food.isAvailable }
            );

            setMessage("Food availability updated.");
            setError("");

            await fetchMenu(restaurant._id);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update food availability."
            );
        }
    };

    // Delete food item
    const handleDeleteFood = async (categoryId, foodId) => {
        if (!window.confirm("Delete this food item?")) return;

        try {
            await api.delete(
                `/restaurants/${restaurant._id}/menu/categories/${categoryId}/items/${foodId}`
            );

            setMessage("Food item deleted successfully.");
            setError("");

            await fetchMenu(restaurant._id);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete food item."
            );
        }
    };

    // Update order status
    const handleOrderStatus = async (orderId, orderStatus) => {
        try {
            setOrderActionLoading(orderId);
            setError("");
            setMessage("");

            await api.put(`/orders/${orderId}/status`, {
                orderStatus
            });

            setMessage("Order status updated successfully.");
            await fetchOrders();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setOrderActionLoading(null);
        }
    };

    // Assign delivery partner
    const handleAssignPartner = async (orderId) => {
        const deliveryPartnerId = selectedPartners[orderId];

        if (!deliveryPartnerId) {
            setError("Please select a delivery partner.");
            return;
        }

        try {
            setOrderActionLoading(orderId);
            setError("");
            setMessage("");

            await api.put(`/orders/${orderId}/assign`, {
                deliveryPartnerId
            });

            setMessage("Delivery partner assigned successfully.");

            setSelectedPartners((previous) => ({
                ...previous,
                [orderId]: ""
            }));

            await fetchOrders();
            await fetchAvailablePartners();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign delivery partner."
            );
        } finally {
            setOrderActionLoading(null);
        }
    };

    // Get next allowed order status
    const getNextStatus = (status) => {
        const nextStatuses = {
            pending: "confirmed",
            placed: "confirmed",
            confirmed: "preparing",
            preparing: "out_for_delivery",
            out_for_delivery: "delivered"
        };

        return nextStatuses[status];
    };

    const formatStatus = (status) => {
        return status?.replaceAll("_", " ") || "Unknown";
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="owner-loading">
                    Loading dashboard...
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="owner-dashboard">
                <div className="owner-header">
                    <div>
                        <p className="owner-subtitle">
                            RESTAURANT MANAGEMENT
                        </p>
                        <h1>Owner Dashboard</h1>
                        <p>Manage your restaurant, menu and orders.</p>
                    </div>

                    <Store size={42} />
                </div>

                {message && (
                    <div className="owner-success">{message}</div>
                )}

                {error && (
                    <div className="owner-error">{error}</div>
                )}

                {/* Restaurant Details */}
                <section className="owner-section">
                    <h2>
                        {restaurant
                            ? "Restaurant Details"
                            : "Create Your Restaurant"}
                    </h2>

                    <form
                        className="owner-form"
                        onSubmit={handleRestaurantSubmit}
                    >
                        <label>Restaurant Name</label>
                        <input
                            name="name"
                            value={restaurantForm.name}
                            onChange={handleRestaurantChange}
                            placeholder="Enter restaurant name"
                            required
                        />

                        <label>Description</label>
                        <textarea
                            name="description"
                            value={restaurantForm.description}
                            onChange={handleRestaurantChange}
                            placeholder="Describe your restaurant"
                        />

                        <label>Address</label>
                        <input
                            name="address"
                            value={restaurantForm.address}
                            onChange={handleRestaurantChange}
                            placeholder="Enter restaurant address"
                            required
                        />

                        <label>Cuisine</label>
                        <input
                            name="cuisine"
                            value={restaurantForm.cuisine}
                            onChange={handleRestaurantChange}
                            placeholder="Example: Indian, Chinese"
                        />

                        <button
                            className="owner-primary-btn"
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : restaurant
                                    ? "Update Restaurant"
                                    : "Create Restaurant"}
                        </button>
                    </form>

                    {restaurant && (
                        <div className="restaurant-status">
                            <div>
                                <strong>Restaurant Status</strong>
                                <p>
                                    {restaurant.isOpen
                                        ? "Your restaurant is currently open."
                                        : "Your restaurant is currently closed."}
                                </p>
                            </div>

                            <button
                                className={
                                    restaurant.isOpen
                                        ? "owner-close-btn"
                                        : "owner-open-btn"
                                }
                                onClick={handleToggleRestaurant}
                            >
                                {restaurant.isOpen
                                    ? "Close Restaurant"
                                    : "Open Restaurant"}
                            </button>
                        </div>
                    )}
                </section>

                {restaurant && (
                    <>
                        {/* Menu Management */}
                        <section className="owner-section">
                            <div className="owner-section-heading">
                                <div>
                                    <h2>Menu Categories</h2>
                                    <p>
                                        Add categories such as Biryani,
                                        Starters and Desserts.
                                    </p>
                                </div>

                                <Utensils size={30} />
                            </div>

                            <form
                                className="owner-inline-form"
                                onSubmit={handleAddCategory}
                            >
                                <input
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    placeholder="Enter category name"
                                    required
                                />

                                <button
                                    className="owner-primary-btn"
                                    type="submit"
                                >
                                    <Plus size={17} />
                                    Add Category
                                </button>
                            </form>

                            {categories.length === 0 ? (
                                <p className="owner-empty">
                                    No menu categories added yet.
                                </p>
                            ) : (
                                <div className="owner-categories">
                                    {categories.map((category) => (
                                        <div
                                            className="owner-category"
                                            key={category._id}
                                        >
                                            <div className="owner-category-heading">
                                                <h3>{category.categoryName}</h3>

                                                <button
                                                    className="owner-delete-btn"
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category._id
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                    Delete Category
                                                </button>
                                            </div>

                                            {category.items?.length > 0 ? (
                                                category.items.map((food) => (
                                                    <div
                                                        className="owner-food-item"
                                                        key={food._id}
                                                    >
                                                        <div>
                                                            <strong>
                                                                {food.name}
                                                            </strong>

                                                            <p>
                                                                {food.description}
                                                            </p>

                                                            <span>
                                                                ₹{food.price}
                                                            </span>

                                                            <small>
                                                                {food.isAvailable
                                                                    ? "Available"
                                                                    : "Unavailable"}
                                                            </small>
                                                        </div>

                                                        <div className="owner-food-actions">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditFood(
                                                                        category._id,
                                                                        food
                                                                    )
                                                                }
                                                                title="Edit food"
                                                            >
                                                                <Pencil size={17} />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleToggleFood(
                                                                        category._id,
                                                                        food
                                                                    )
                                                                }
                                                            >
                                                                {food.isAvailable
                                                                    ? "Disable"
                                                                    : "Enable"}
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteFood(
                                                                        category._id,
                                                                        food._id
                                                                    )
                                                                }
                                                                title="Delete food"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="owner-empty">
                                                    No food items in this category.
                                                </p>
                                            )}

                                            <button
                                                className="owner-add-food-btn"
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory(
                                                        category._id
                                                    );

                                                    setShowFoodForm(true);

                                                    setFoodForm({
                                                        name: "",
                                                        description: "",
                                                        price: ""
                                                    });
                                                }}
                                            >
                                                <Plus size={17} />
                                                Add Food Item
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Add Food Form */}
                        {showFoodForm && (
                            <section className="owner-section">
                                <h2>Add Food Item</h2>

                                <form
                                    className="owner-form"
                                    onSubmit={handleAddFood}
                                >
                                    <label>Food Name</label>
                                    <input
                                        name="name"
                                        value={foodForm.name}
                                        onChange={handleFoodFormChange}
                                        required
                                        placeholder="Example: Chicken Biryani"
                                    />

                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={foodForm.description}
                                        onChange={handleFoodFormChange}
                                        placeholder="Food description"
                                    />

                                    <label>Price (₹)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        min="1"
                                        value={foodForm.price}
                                        onChange={handleFoodFormChange}
                                        required
                                        placeholder="Enter price"
                                    />

                                    <div className="owner-form-actions">
                                        <button
                                            className="owner-primary-btn"
                                            type="submit"
                                        >
                                            Save Food Item
                                        </button>

                                        <button
                                            className="owner-cancel-btn"
                                            type="button"
                                            onClick={() =>
                                                setShowFoodForm(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}

                        {/* Restaurant Orders */}
                        <section className="owner-section">
                            <div className="owner-section-heading">
                                <div>
                                    <h2>
                                        <ClipboardList
                                            size={23}
                                            className="owner-heading-icon"
                                        />
                                        Incoming Orders
                                    </h2>
                                    <p>
                                        Manage orders placed at your restaurant.
                                    </p>
                                </div>

                                <button
                                    className="owner-refresh-btn"
                                    onClick={fetchOrders}
                                    disabled={ordersLoading}
                                >
                                    <RefreshCw size={16} />
                                    {ordersLoading ? "Loading..." : "Refresh"}
                                </button>
                            </div>

                            {ordersLoading ? (
                                <p className="owner-empty">
                                    Loading orders...
                                </p>
                            ) : orders.length === 0 ? (
                                <div className="owner-no-orders">
                                    <ClipboardList size={38} />
                                    <h3>No orders yet</h3>
                                    <p>
                                        New customer orders will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="owner-orders">
                                    {orders.map((order) => {
                                        const nextStatus = getNextStatus(
                                            order.orderStatus
                                        );

                                        const canAssign = [
                                            "pending",
                                            "placed",
                                            "confirmed",
                                            "preparing"
                                        ].includes(order.orderStatus);

                                        const isBusy =
                                            orderActionLoading === order._id;

                                        return (
                                            <article
                                                className="owner-order-card"
                                                key={order._id}
                                            >
                                                <div className="owner-order-top">
                                                    <div>
                                                        <h3>
                                                            Order #
                                                            {order._id.slice(-7)}
                                                        </h3>

                                                        <p>
                                                            {order.restaurantId?.name ||
                                                                restaurant.name}
                                                        </p>

                                                        {order.createdAt && (
                                                            <small>
                                                                {new Date(
                                                                    order.createdAt
                                                                ).toLocaleString()}
                                                            </small>
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`owner-order-status ${order.orderStatus}`}
                                                    >
                                                        {formatStatus(
                                                            order.orderStatus
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="owner-order-customer">
                                                    <h4>Customer Details</h4>
                                                    <p>
                                                        <strong>Name:</strong>{" "}
                                                        {order.userId?.name ||
                                                            "Customer"}
                                                    </p>
                                                    <p>
                                                        <strong>Phone:</strong>{" "}
                                                        {order.userId?.phone ||
                                                            "Not provided"}
                                                    </p>
                                                    <p>
                                                        <strong>Address:</strong>{" "}
                                                        {order.deliveryAddress}
                                                    </p>
                                                </div>

                                                <div className="owner-order-items">
                                                    <h4>Ordered Items</h4>

                                                    {order.items?.map(
                                                        (item, index) => (
                                                            <div
                                                                className="owner-order-item"
                                                                key={`${item.foodItemId || item.name}-${index}`}
                                                            >
                                                                <span>
                                                                    {item.name} ×{" "}
                                                                    {item.quantity}
                                                                </span>

                                                                <strong>
                                                                    ₹
                                                                    {item.price *
                                                                        item.quantity}
                                                                </strong>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div className="owner-order-payment">
                                                    <span>
                                                        Payment:{" "}
                                                        <strong>
                                                            {formatStatus(
                                                                order.paymentStatus
                                                            )}
                                                        </strong>
                                                    </span>

                                                    <strong>
                                                        Total: ₹
                                                        {order.totalAmount}
                                                    </strong>
                                                </div>

                                                <div className="owner-assigned-partner">
                                                    <Truck size={18} />

                                                    {order.deliveryPartnerId ? (
                                                        <span>
                                                            Delivery Partner:{" "}
                                                            <strong>
                                                                {order.deliveryPartnerId.name ||
                                                                    "Assigned"}
                                                            </strong>
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            No delivery partner assigned
                                                        </span>
                                                    )}
                                                </div>

                                                {canAssign && (
                                                    <div className="owner-assign-form">
                                                        <select
                                                            value={selectedPartners[order._id] || ""}
                                                            onChange={(e) =>
                                                                setSelectedPartners((previous) => ({
                                                                    ...previous,
                                                                    [order._id]: e.target.value
                                                                }))
                                                            }
                                                            disabled={partnersLoading || isBusy}
                                                        >
                                                            <option value="">
                                                                {partnersLoading
                                                                    ? "Loading delivery partners..."
                                                                    : "Select an available delivery partner"}
                                                            </option>
                                                            {availablePartners.map((partner) => (
                                                                <option key={partner._id} value={partner._id}>
                                                                    {partner.name} {partner.phone ? `- ${partner.phone}` : ""}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <button
                                                            className="owner-assign-btn"
                                                            disabled={isBusy || partnersLoading || !availablePartners.length || !selectedPartners[order._id]}
                                                            onClick={() => handleAssignPartner(order._id)}
                                                        >
                                                            {isBusy ? "Assigning..." : "Assign Partner"}
                                                        </button>
                                                        {!partnersLoading && availablePartners.length === 0 && (
                                                            <small>No approved and available delivery partners right now.</small>
                                                        )}
                                                    </div>
                                                )}

                                                {nextStatus && (
                                                    <div className="owner-order-actions">
                                                        <button
                                                            className="owner-status-btn"
                                                            disabled={
                                                                isBusy ||
                                                                (
                                                                    nextStatus ===
                                                                        "out_for_delivery" &&
                                                                    !order.deliveryPartnerId
                                                                )
                                                            }
                                                            onClick={() =>
                                                                handleOrderStatus(
                                                                    order._id,
                                                                    nextStatus
                                                                )
                                                            }
                                                        >
                                                            {isBusy
                                                                ? "Updating..."
                                                                : `Mark as ${formatStatus(
                                                                    nextStatus
                                                                )}`}
                                                        </button>

                                                        {nextStatus ===
                                                            "out_for_delivery" &&
                                                            !order.deliveryPartnerId && (
                                                                <small>
                                                                    Assign a delivery
                                                                    partner before
                                                                    dispatching.
                                                                </small>
                                                            )}
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </>
    );
}

export default OwnerDashboard;
