
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function getUserFromToken(token) {
    try {
        if (!token) return null;

        const payloadPart = token.split(".")[1];

        // Convert Base64URL to Base64
        const base64 = payloadPart
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedBase64 = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        );

        const payload = JSON.parse(atob(paddedBase64));

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            return null;
        }

        return {
            id: payload.id,
            role: payload.role
        };

    } catch (error) {
        localStorage.removeItem("token");
        return null;
    }
}

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        return getUserFromToken(token);
    });

    const login = (token, userData) => {
        localStorage.setItem("token", token);

        setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
