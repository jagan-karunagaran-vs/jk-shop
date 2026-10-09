import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDashboardStats,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  archiveAdminProduct,
  fetchAdminOrders,
  updateAdminOrderStatus,
  fetchAdminCustomers,
  fetchAdminMessages,
  markAdminMessageRead,
} from '../thunks/adminThunks';

const initialState = {
  stats: null,
  products: [],
  productsTotal: 0,
  productsPage: 1,
  productsPages: 1,
  orders: [],
  ordersTotal: 0,
  ordersPage: 1,
  ordersPages: 1,
  customers: [],
  customersTotal: 0,
  messages: [],
  messagesUnreadCount: 0,
  messagesTotal: 0,
  loading: false,
  error: null,
  actionSuccess: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminActionSuccess: (state) => {
      state.actionSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.productsTotal = action.payload.total;
        state.productsPage = action.payload.page;
        state.productsPages = action.payload.pages;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(createAdminProduct.fulfilled, (state) => {
        state.loading = false;
        state.actionSuccess = true;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAdminProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(updateAdminProduct.fulfilled, (state) => {
        state.loading = false;
        state.actionSuccess = true;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(archiveAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload.productId);
      })

      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.ordersTotal = action.payload.total;
        state.ordersPage = action.payload.page;
        state.ordersPages = action.payload.pages;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) =>
          o._id === action.payload.order._id ? action.payload.order : o
        );
      })

      .addCase(fetchAdminCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.users;
        state.customersTotal = action.payload.total;
      })
      .addCase(fetchAdminCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdminMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.messagesTotal = action.payload.total;
        state.messagesUnreadCount = action.payload.unreadCount;
      })
      .addCase(fetchAdminMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markAdminMessageRead.fulfilled, (state, action) => {
        state.messages = state.messages.map((m) =>
          m._id === action.payload.messageId ? { ...m, isRead: true } : m
        );
        state.messagesUnreadCount = Math.max(0, state.messagesUnreadCount - 1);
      });
  },
});

export const { clearAdminError, clearAdminActionSuccess } = adminSlice.actions;
export default adminSlice.reducer;