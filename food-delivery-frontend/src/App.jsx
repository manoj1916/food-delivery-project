
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import OrderTracking from "./pages/OrderTracking";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

// Redirect authenticated users to their role-specific dashboard
function HomeRoute() {
    const { user } = useAuth();

    if (user?.role === "restaurant_owner") {
        return <Navigate to="/owner-dashboard" replace />;
    }

    if (user?.role === "delivery_partner") {
        return <Navigate to="/delivery-dashboard" replace />;
    }

    if (user?.role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return <Home />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomeRoute />} />

                    <Route
                        path="/restaurant/:id"
                        element={<RestaurantDetails />}
                    />

                    <Route path="/login" element={<Login />} />

                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/owner-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["restaurant_owner"]}>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/delivery-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["delivery_partner"]}>
                                <DeliveryDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-orders"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <MyOrders />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <OrderTracking />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
