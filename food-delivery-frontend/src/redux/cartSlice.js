
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    restaurantId: null,
    error: null
};

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        setCart: (state, action) => {
            state.items = action.payload.items || [];
            state.restaurantId = action.payload.restaurantId || null;
            state.error = null;
        },

        addToCart: (state, action) => {
            const newItem = action.payload;

            if (
                state.restaurantId &&
                state.restaurantId !== newItem.restaurantId
            ) {
                state.error = "You can order from only one restaurant at a time.";
                return;
            }

            state.error = null;
            state.restaurantId = newItem.restaurantId;

            const existingItem = state.items.find(
                (item) => item.id === newItem.id
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({
                    ...newItem,
                    quantity: 1
                });
            }
        },

        increaseQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload
            );

            if (item) {
                item.quantity += 1;
            }
        },

        decreaseQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload
            );

            if (item && item.quantity > 1) {
                item.quantity -= 1;
            }
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );

            if (state.items.length === 0) {
                state.restaurantId = null;
            }
        },

        clearCart: (state) => {
            state.items = [];
            state.restaurantId = null;
            state.error = null;
        },

        clearCartError: (state) => {
            state.error = null;
        }
    }
});

export const {
    setCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    clearCartError
} = cartSlice.actions;

export default cartSlice.reducer;
