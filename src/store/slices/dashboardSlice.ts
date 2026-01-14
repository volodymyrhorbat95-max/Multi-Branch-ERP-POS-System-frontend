import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import reportService from '../../services/api/report.service';
import type { OwnerDashboardData } from '../../types';

interface DashboardState {
  data: OwnerDashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null
};

export const fetchOwnerDashboard = createAsyncThunk(
  'dashboard/fetchOwnerDashboard',
  async (params: { start_date: string; end_date: string }) => {
    const response = await reportService.getOwnerDashboard(params);
    if (!response.success) {
      throw new Error(response.error || 'Error al cargar el dashboard');
    }
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerDashboard.fulfilled, (state, action: PayloadAction<OwnerDashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOwnerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar el dashboard';
      });
  }
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
