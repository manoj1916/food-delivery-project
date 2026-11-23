
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Utensils } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Redirect according to user role
    const getDashboardPath = (role) => {
        switch (role) {
            case "customer":
                return "/";

            case "restaurant_owner":
                return "/owner-dashboard";

            case "delivery_partner":
                return "/delivery-dashboard";

            case "admin":
                return "/admin-dashboard";

            default:
                return "/login";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                formData
            );

            const token = response.data.token;
            const user = response.data.user;

            if (!token || !user || !user.role) {
                setError("Invalid login response from server.");
                return;
            }

            login(token, user);

            const dashboardPath = getDashboardPath(user.role);

            if (dashboardPath === "/login") {
                setError("Your account has an invalid user role.");
                return;
            }

            navigate(dashboardPath, { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your details."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <Link to="/" className="auth-logo">
                    <Utensils size={28} />
                    FoodExpress
                </Link>

                <h1>Welcome Back!</h1>

                <p className="auth-subtitle">
                    Login to continue ordering delicious food.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <div className="password-field">

                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword
                                ? <EyeOff size={19} />
                                : <Eye size={19} />
                            }
                        </button>

                    </div>

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create account</Link>
                </p>

            </div>
        </div>
    );
}

export default Login;
