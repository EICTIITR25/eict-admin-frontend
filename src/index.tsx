import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { store } from "./redux/store";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/assets/css/style.scss";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error("Query failed:", query.queryKey, error);

      toast.error("Something went wrong. Please try again later.", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.history.back();
      }, 2000);
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <App />
        {/* Toast container to render all toasts */}
        <ToastContainer />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
