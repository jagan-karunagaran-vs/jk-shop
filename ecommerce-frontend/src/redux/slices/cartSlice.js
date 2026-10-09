import { createSlice } from '@reduxjs/toolkit';

const storedCart = localStorage.getItem('cartItems');

const initialState = {
  cartItems: storedCart ? JSON.parse(storedCart) : [],
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')) || {},
  paymentMethod: localStorage.getItem('paymentMethod') || 'CashOnDelivery',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // { product, name, price, image, stock, quantity }
      const existingItem = state.cartItems.find(
        (x) => x.product === item.product
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + item.quantity,
          existingItem.stock
        );
      } else {
        state.cartItems.push(item);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    updateCartQuantity: (state, action) => {
      const { product, quantity } = action.payload;
      const item = state.cartItems.find((x) => x.product === product);

      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.product !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    },
  },
});

export const {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
} = cartSlice.actions;

export default cartSlice.reducer;