
import api from "./api";

// Get all restaurants
export const getRestaurants = async () => {
    const response = await api.get("/restaurants");

    return (
        response.data.restaurants ||
        response.data.data ||
        []
    );
};

// Get single restaurant
export const getRestaurantById = async (id) => {
    const response = await api.get(`/restaurants/${id}`);

    return (
        response.data.restaurant ||
        response.data.data ||
        null
    );
};

// Get restaurant menu
export const getRestaurantMenu = async (id) => {
    const response = await api.get(`/restaurants/${id}/menu`);

    // Your backend returns menuCategories inside restaurant
    const menuData =
        response.data.restaurant?.menuCategories ||
        response.data.menuCategories ||
        response.data.data?.menuCategories ||
        response.data.menu ||
        response.data.data ||
        [];

    return Array.isArray(menuData)
        ? menuData
        : [];
};
