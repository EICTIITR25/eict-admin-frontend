import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { AuthState, User } from "../../types/index";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return {
        access: res.data.access,
        user: { email, first_name: res.data.first_name } as User,
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState: AuthState = {
  user: null,
  access: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.access = null;
      localStorage.removeItem("access");
      localStorage.removeItem("name");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.access = action.payload.access;
        state.user = action.payload.user;
        localStorage.setItem("access", action.payload.access);
        localStorage.setItem("name", action.payload.user.first_name);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
