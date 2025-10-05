import { configureStore } from "@reduxjs/toolkit";
import appStateSlice from "./features/appStateSlice";
import authReducer from "./slices/authSlice";
import coursesReducer from "./slices/coursesSlice";

export const store = configureStore({
  reducer: {
    appState: appStateSlice,
    auth: authReducer,
    courses: coursesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
