
import { useEffect, useState } from "react";

import {
    Users,
    Store,
    ShoppingBag,
    IndianRupee,
    RefreshCw,
    Trash2,
    LayoutDashboard,
    ClipboardList,
    Utensils,
    ArrowLeft,
    Plus,
    X,
    UserCheck,
    Bike,
    Check,
    XCircle
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [applications, setApplications] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showRestaurantForm, setShowRestaurantForm] = useState(false);
    const [creatingRestaurant, setCreatingRestaurant] = useState(false);

    const [restaurantForm, setRestaurantForm] = useState({
        name: "",
        description: "",
        address: "",
        cuisine: "",
        ownerId: ""
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                dashboardRes,
                usersRes,
                ordersRes,
                restaurantsRes,
                applicationsRes,
                partnersRes
            ] = await Promise.all([
                api.get("/admin/dashboard"),
                api.get("/admin/users"),
                api.get("/admin/orders"),
                api.get("/restaurants"),
                api.get("/admin/applications"),
                api.get("/admin/delivery-partners")
            ]);

            setStatistics(dashboardRes.data.statistics);
            setUsers(usersRes.data.users || []);
            setOrders(ordersRes.data.orders || []);
            setRestaurants(restaurantsRes.data.restaurants || []);
            setApplications(applicationsRes.data.applications || []);
            setDeliveryPartners(partnersRes.data.deliveryPartners || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard. Check your backend routes."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            await api.delete(`/admin/users/${userId}`);

            setUsers((previous) =>
                previous.filter((user) => user._id !== userId)
            );

            setStatistics((previous) => ({
                ...previous,
                totalUsers: Math.max(0, previous.totalUsers - 1)
            }));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user.");
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        if (!window.confirm("Delete this restaurant? This action cannot be undone.")) {
            return;
        }

        try {
            await api.delete(`/admin/restaurants/${restaurantId}`);

            setRestaurants((previous) =>
                previous.filter((restaurant) => restaurant._id !== restaurantId)
            );

            setStatistics((previous) => ({
                ...previous,
                totalRestaurants: Math.max(0, previous.totalRestaurants - 1)
            }));

            if (selectedRestaurant?._id === restaurantId) {
                setSelectedRestaurant(null);
            }

            alert("Restaurant deleted successfully.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete restaurant.");
        }
    };

    const handleViewMenu = async (restaurantId) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}`);
            setSelectedRestaurant(response.data.restaurant);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to load restaurant menu.");
        }
    };

    const handleDeleteFoodItem = async (restaurantId, categoryId, itemId) => {
        if (!window.confirm("Are you sure you want to delete this food item?")) {
            return;
        }

        try {
            await api.delete(
                `/admin/restaurants/${restaurantId}/categories/${categoryId}/items/${itemId}`
            );

            setSelectedRestaurant((previous) => ({
                ...previous,
                menuCategories: previous.menuCategories.map((category) => {
                    if (category._id !== categoryId) {
                        return category;
                    }

                    return {
                        ...category,
                        items: category.items.filter((item) => item._id !== itemId)
                    };
                })
            }));

            alert("Food item deleted successfully.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete food item.");
        }
    };

    const handleRestaurantInputChange = (event) => {
        const { name, value } = event.target;

        setRestaurantForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleCreateRestaurant = async (event) => {
        event.preventDefault();

        if (
            !restaurantForm.name.trim() ||
            !restaurantForm.address.trim() ||
            !restaurantForm.ownerId
        ) {
            alert("Please enter the restaurant name, address and owner.");
            return;
        }

        try {
            setCreatingRestaurant(true);

            const response = await api.post("/admin/restaurants", {
                ...restaurantForm,
                name: restaurantForm.name.trim(),
                address: restaurantForm.address.trim()
            });

            setRestaurants((previous) => [
                response.data.restaurant,
                ...previous
            ]);

            setStatistics((previous) => ({
                ...previous,
                totalRestaurants: previous.totalRestaurants + 1
            }));

            setRestaurantForm({
                name: "",
                description: "",
                address: "",
                cuisine: "",
                ownerId: ""
            });

            setShowRestaurantForm(false);
            alert("Restaurant created successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create restaurant.");
        } finally {
            setCreatingRestaurant(false);
        }
    };

    const handleApproveApplication = async (userId) => {
        if (!window.confirm("Approve this application?")) return;

        try {
            await api.put(`/admin/applications/${userId}/approve`);
            alert("Application approved successfully.");
            await fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to approve application.");
        }
    };

    const handleRejectApplication = async (userId) => {
        if (!window.confirm("Reject this application?")) return;

        try {
            await api.put(`/admin/applications/${userId}/reject`);
            alert("Application rejected.");
            await fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to reject application.");
        }
    };

    const handleAvailabilityChange = async (partnerId, isAvailable) => {
        try {
            await api.put(`/admin/delivery-partners/${partnerId}/availability`, {
                isAvailable
            });

            setDeliveryPartners((previous) =>
                previous.map((partner) =>
                    partner._id === partnerId
                        ? { ...partner, isAvailable }
                        : partner
                )
            );

            alert("Delivery partner availability updated.");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update delivery partner availability."
            );
        }
    };

    const restaurantOwners = users.filter(
        (user) => user.role === "restaurant_owner"
    );

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="admin-loading">
                    Loading admin dashboard...
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="admin-container">
                <div className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Manage your food delivery platform</p>
                    </div>

                    <button
                        className="admin-refresh-btn"
                        onClick={fetchDashboardData}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {error && <div className="admin-error">{error}</div>}

                <div className="admin-tabs">
                    <button
                        className={activeTab === "overview" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("overview");
                            setSelectedRestaurant(null);
                        }}
                    >
                        <LayoutDashboard size={17} />
                        Overview
                    </button>

                    <button
                        className={activeTab === "users" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("users");
                            setSelectedRestaurant(null);
                        }}
                    >
                        <Users size={17} />
                        Users
                    </button>

                    <button
                        className={activeTab === "applications" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("applications");
                            setSelectedRestaurant(null);
                        }}
                    >
                        <UserCheck size={17} />
                        Applications ({applications.length})
                    </button>

                    <button
                        className={activeTab === "partners" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("partners");
                            setSelectedRestaurant(null);
                        }}
                    >
                        <Bike size={17} />
                        Delivery Partners
                    </button>

                    <button
                        className={activeTab === "orders" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("orders");
                            setSelectedRestaurant(null);
                        }}
                    >
                        <ClipboardList size={17} />
                        Orders
                    </button>

                    <button
                        className={activeTab === "restaurants" ? "active" : ""}
                        onClick={() => {
                            setActiveTab("restaurants");
                            setSelectedRestaurant(null);
                            setShowRestaurantForm(false);
                        }}
                    >
                        <Store size={17} />
                        Restaurants
                    </button>
                </div>

                {activeTab === "overview" && (
                    <section className="admin-overview">
                        <h2>Platform Statistics</h2>

                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon"><Users /></div>
                                <p>Total Users</p>
                                <h3>{statistics.totalUsers}</h3>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon"><Store /></div>
                                <p>Total Restaurants</p>
                                <h3>{statistics.totalRestaurants}</h3>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon"><ShoppingBag /></div>
                                <p>Total Orders</p>
                                <h3>{statistics.totalOrders}</h3>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon"><IndianRupee /></div>
                                <p>Total Revenue</p>
                                <h3>{formatCurrency(statistics.totalRevenue)}</h3>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === "users" && (
                    <section className="admin-section">
                        <h2>User Management</h2>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="admin-empty">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id}>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone || "N/A"}</td>
                                                <td>
                                                    <span className="admin-role">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="admin-delete-btn"
                                                        disabled={user.role === "admin"}
                                                        onClick={() => handleDeleteUser(user._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "applications" && (
                    <section className="admin-section">
                        <h2>Role Applications</h2>
                        <p>Review users who have applied to become restaurant owners or delivery partners.</p>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Requested Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {applications.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="admin-empty">
                                                No pending applications.
                                            </td>
                                        </tr>
                                    ) : (
                                        applications.map((application) => (
                                            <tr key={application._id}>
                                                <td>{application.name}</td>
                                                <td>{application.email}</td>
                                                <td>{application.phone || "N/A"}</td>
                                                <td>
                                                    <span className="admin-role">
                                                        {application.requestedRole?.replaceAll("_", " ")}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="admin-view-btn"
                                                        onClick={() => handleApproveApplication(application._id)}
                                                    >
                                                        <Check size={15} />
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="admin-delete-btn"
                                                        onClick={() => handleRejectApplication(application._id)}
                                                    >
                                                        <XCircle size={15} />
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "partners" && (
                    <section className="admin-section">
                        <h2>Delivery Partner Management</h2>
                        <p>View approved delivery partners and manage their availability.</p>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Availability</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {deliveryPartners.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="admin-empty">
                                                No approved delivery partners found.
                                            </td>
                                        </tr>
                                    ) : (
                                        deliveryPartners.map((partner) => (
                                            <tr key={partner._id}>
                                                <td>{partner.name}</td>
                                                <td>{partner.email}</td>
                                                <td>{partner.phone || "N/A"}</td>
                                                <td>
                                                    <span className="admin-status">
                                                        {partner.isAvailable ? "Available" : "Unavailable"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={partner.isAvailable ? "admin-delete-btn" : "admin-view-btn"}
                                                        onClick={() =>
                                                            handleAvailabilityChange(
                                                                partner._id,
                                                                !partner.isAvailable
                                                            )
                                                        }
                                                    >
                                                        {partner.isAvailable
                                                            ? "Mark Unavailable"
                                                            : "Mark Available"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "orders" && (
                    <section className="admin-section">
                        <h2>Order Management</h2>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Restaurant</th>
                                        <th>Delivery Partner</th>
                                        <th>Amount</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="admin-empty">
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order._id}>
                                                <td>{order._id.slice(-8).toUpperCase()}</td>
                                                <td>{order.userId?.name || "N/A"}</td>
                                                <td>{order.restaurantId?.name || "N/A"}</td>
                                                <td>{order.deliveryPartnerId?.name || "Not assigned"}</td>
                                                <td>{formatCurrency(order.totalAmount)}</td>
                                                <td>
                                                    <span className="admin-status">
                                                        {order.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="admin-status">
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "restaurants" && (
                    <section className="admin-section">
                        {selectedRestaurant ? (
                            <>
                                <button
                                    className="admin-back-btn"
                                    onClick={() => setSelectedRestaurant(null)}
                                >
                                    <ArrowLeft size={17} />
                                    Back to Restaurants
                                </button>

                                <h2>{selectedRestaurant.name} – Menu</h2>

                                {!selectedRestaurant.menuCategories?.length ? (
                                    <p className="admin-empty">
                                        No menu categories found.
                                    </p>
                                ) : (
                                    selectedRestaurant.menuCategories.map((category) => (
                                        <div className="admin-menu-category" key={category._id}>
                                            <h3>{category.categoryName}</h3>

                                            {!category.items?.length ? (
                                                <p>No food items in this category.</p>
                                            ) : (
                                                <div className="admin-table-wrapper">
                                                    <table className="admin-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Food Name</th>
                                                                <th>Description</th>
                                                                <th>Price</th>
                                                                <th>Availability</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {category.items.map((item) => (
                                                                <tr key={item._id}>
                                                                    <td>{item.name}</td>
                                                                    <td>{item.description || "N/A"}</td>
                                                                    <td>{formatCurrency(item.price)}</td>
                                                                    <td>{item.isAvailable ? "Available" : "Unavailable"}</td>
                                                                    <td>
                                                                        <button
                                                                            className="admin-delete-btn"
                                                                            onClick={() =>
                                                                                handleDeleteFoodItem(
                                                                                    selectedRestaurant._id,
                                                                                    category._id,
                                                                                    item._id
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 size={16} />
                                                                            Delete
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </>
                        ) : (
                            <>
                                <div className="admin-restaurant-heading">
                                    <div>
                                        <h2>Restaurant Management</h2>
                                        <p className="admin-section-description">
                                            View restaurants and moderate their menus.
                                        </p>
                                    </div>

                                    <button
                                        className="admin-add-btn"
                                        onClick={() => setShowRestaurantForm(true)}
                                    >
                                        <Plus size={18} />
                                        Add Restaurant
                                    </button>
                                </div>

                                {showRestaurantForm && (
                                    <form className="admin-restaurant-form" onSubmit={handleCreateRestaurant}>
                                        <div className="admin-form-heading">
                                            <h3>Create New Restaurant</h3>
                                            <button
                                                type="button"
                                                className="admin-close-btn"
                                                onClick={() => setShowRestaurantForm(false)}
                                                aria-label="Close form"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="admin-form-grid">
                                            <div className="admin-form-group">
                                                <label htmlFor="restaurantName">Restaurant Name *</label>
                                                <input
                                                    id="restaurantName"
                                                    name="name"
                                                    value={restaurantForm.name}
                                                    onChange={handleRestaurantInputChange}
                                                    placeholder="Enter restaurant name"
                                                    required
                                                />
                                            </div>

                                            <div className="admin-form-group">
                                                <label htmlFor="restaurantCuisine">Cuisine</label>
                                                <input
                                                    id="restaurantCuisine"
                                                    name="cuisine"
                                                    value={restaurantForm.cuisine}
                                                    onChange={handleRestaurantInputChange}
                                                    placeholder="e.g. Indian, Chinese"
                                                />
                                            </div>

                                            <div className="admin-form-group admin-form-full">
                                                <label htmlFor="restaurantDescription">Description</label>
                                                <textarea
                                                    id="restaurantDescription"
                                                    name="description"
                                                    value={restaurantForm.description}
                                                    onChange={handleRestaurantInputChange}
                                                    placeholder="Describe the restaurant"
                                                    rows="3"
                                                />
                                            </div>

                                            <div className="admin-form-group admin-form-full">
                                                <label htmlFor="restaurantAddress">Address *</label>
                                                <input
                                                    id="restaurantAddress"
                                                    name="address"
                                                    value={restaurantForm.address}
                                                    onChange={handleRestaurantInputChange}
                                                    placeholder="Enter restaurant address"
                                                    required
                                                />
                                            </div>

                                            <div className="admin-form-group admin-form-full">
                                                <label htmlFor="restaurantOwner">Assign Restaurant Owner *</label>
                                                <select
                                                    id="restaurantOwner"
                                                    name="ownerId"
                                                    value={restaurantForm.ownerId}
                                                    onChange={handleRestaurantInputChange}
                                                    required
                                                >
                                                    <option value="">Select a restaurant owner</option>

                                                    {restaurantOwners.map((owner) => (
                                                        <option key={owner._id} value={owner._id}>
                                                            {owner.name} ({owner.email})
                                                        </option>
                                                    ))}
                                                </select>

                                                {restaurantOwners.length === 0 && (
                                                    <small className="admin-form-hint">
                                                        No restaurant owner accounts found.
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <div className="admin-form-actions">
                                            <button
                                                type="button"
                                                className="admin-cancel-btn"
                                                onClick={() => setShowRestaurantForm(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="admin-add-btn"
                                                disabled={creatingRestaurant || restaurantOwners.length === 0}
                                            >
                                                {creatingRestaurant ? "Creating..." : "Create Restaurant"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="admin-restaurant-grid">
                                    {restaurants.length === 0 ? (
                                        <p className="admin-empty">No restaurants found.</p>
                                    ) : (
                                        restaurants.map((restaurant) => (
                                            <div className="admin-restaurant-card" key={restaurant._id}>
                                                <div className="admin-restaurant-icon">
                                                    <Utensils size={25} />
                                                </div>

                                                <h3>{restaurant.name}</h3>
                                                <p>{restaurant.cuisine || "Cuisine not specified"}</p>
                                                <p>{restaurant.address}</p>

                                                <span className="admin-status">
                                                    {restaurant.isOpen ? "Open" : "Closed"}
                                                </span>

                                                <div className="admin-restaurant-actions">
                                                    <button
                                                        className="admin-view-btn"
                                                        onClick={() => handleViewMenu(restaurant._id)}
                                                    >
                                                        View Menu
                                                    </button>

                                                    <button
                                                        className="admin-delete-btn"
                                                        onClick={() => handleDeleteRestaurant(restaurant._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                )}
            </div>
        </>
    );
}

export default AdminDashboard;
