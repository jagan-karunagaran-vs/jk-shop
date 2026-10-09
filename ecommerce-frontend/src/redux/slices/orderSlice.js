import { createSlice } from '@reduxjs/toolkit';
import {
  placeOrder,
  fetchOrderById,
  fetchMyOrders,
  fetchAllOrders,
  payOrder,
  cancelOrderThunk,
  updateOrderStatusThunk,
} from '../thunks/orderThunks';

const initialState = {
  orders: [],
  myOrders: [],
  currentOrder: null,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.success = false;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload.order;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single order
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch my orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload.orders;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all orders (admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Pay order
      .addCase(payOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload.order;
      })

      // Cancel order
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.currentOrder = action.payload.order;
        state.myOrders = state.myOrders.map((o) =>
          o._id === action.payload.order._id ? action.payload.order : o
        );
      })

      // Update order status (admin)
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) =>
          o._id === action.payload.order._id ? action.payload.order : o
        );
      });
  },
});

export const { clearOrderError, clearOrderSuccess, clearCurrentOrder } =
  orderSlice.actions;
export default orderSlice.reducer;