import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/products', {
        params: { ...params, includeInactive: 'true' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createAdminProduct = createAsyncThunk(
  'admin/createAdminProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/products', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  'admin/updateAdminProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const archiveAdminProduct = createAsyncThunk(
  'admin/archiveAdminProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${productId}`);
      return { productId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive product');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  'admin/updateAdminOrderStatus',
  async ({ orderId, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/status`, { orderStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const fetchAdminCustomers = createAsyncThunk(
  'admin/fetchAdminCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchAdminMessages = createAsyncThunk(
  'admin/fetchAdminMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/contact', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const markAdminMessageRead = createAsyncThunk(
  'admin/markAdminMessageRead',
  async (messageId, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/contact/${messageId}/read`);
      return { messageId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read');
    }
  }
);