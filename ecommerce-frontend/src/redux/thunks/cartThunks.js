import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

/**
 * NOTE: Cart state itself (add/remove/update quantity) is handled entirely
 * client-side in cartSlice.js reducers, persisted to localStorage — no
 * server round-trip is needed for those actions. This thunk file covers
 * the one cart-related operation that DOES need the server: validating
 * that cart items still have sufficient stock and correct pricing right
 * before checkout, since prices/stock may have changed since items were
 * added to the cart.
 */

// Validate cart items against current server-side product data before checkout
export const validateCartStock = createAsyncThunk(
  'cart/validateCartStock',
  async (cartItems, { rejectWithValue }) => {
    try {
      const validationResults = await Promise.all(
        cartItems.map(async (item) => {
          const response = await axiosInstance.get(`/products/${item.product}`);
          const product = response.data.product;

          return {
            product: item.product,
            name: product.name,
            requestedQuantity: item.quantity,
            availableStock: product.stock,
            currentPrice: product.price,
            priceChanged: product.price !== item.price,
            isAvailable: product.stock >= item.quantity && product.isActive,
          };
        })
      );

      const hasIssues = validationResults.some((r) => !r.isAvailable || r.priceChanged);

      return { validationResults, hasIssues };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to validate cart items'
      );
    }
  }
);