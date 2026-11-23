
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Utensils } from "lucide-react";
import api from "../services/api";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        requestedRole: "customer"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (formData.name.trim().length < 3) {
            setError("Name must contain at least 3 characters.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (!/\d/.test(formData.password)) {
            setError("Password must contain at least one number.");
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            setError("Password must contain at least one special character.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.trim(),
                requestedRole:
                    formData.requestedRole === "customer"
                        ? undefined
                        : formData.requestedRole
            });

            if (formData.requestedRole === "customer") {
                setSuccess("Registration successful! You can now log in.");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                setSuccess(
                    response.data.message ||
                    "Your application has been submitted. Please wait for admin approval."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 2500);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-heading">
                    <div className="auth-logo">
                        <Utensils size={28} />
                    </div>

                    <h1>Create Account</h1>
                    <p>Join FoodExpress today</p>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">Password</label>

                        <div className="auth-password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                            />

                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() =>
                                    setShowPassword((previous) => !previous)
                                }
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}
                            </button>
                        </div>

                        <small>
                            Minimum 8 characters, one number and one special character.
                        </small>
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="requestedRole">
                            Register As
                        </label>

                        <select
                            id="requestedRole"
                            name="requestedRole"
                            value={formData.requestedRole}
                            onChange={handleChange}
                            required
                        >
                            <option value="customer">
                                Customer
                            </option>

                            <option value="restaurant_owner">
                                Restaurant Owner
                            </option>

                            <option value="delivery_partner">
                                Delivery Partner
                            </option>
                        </select>

                        {formData.requestedRole !== "customer" && (
                            <small>
                                Your application will be reviewed by an admin.
                                You can use the requested role after approval.
                            </small>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
