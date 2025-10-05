import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./components/Login/LoginPage";
import ForgotPassword from "./components/Login/ForgotPassword";
import AuthGuard from "./components/Login/AuthGuard";
import PublicRoute from "./components/Login/PublicRoute";
import { routes } from "./routes";
import TestProfileEvaluationPage from "./pages/TestManagement/TestProfileEvaluationPassedpage";
import FundamentalsquestionsPage from "./pages/TestManagement/FundamentalsquestionsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { ToastContainer } from "react-toastify";
import GlobalLoader from "./components/loader/globalLoader";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <GlobalLoader />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
        </Route>

        <Route element={<AuthGuard />}>
          <Route path="/" element={<MainLayout />}>
            {routes}
          </Route>
        </Route>
        <Route path="/evaluation" element={<TestProfileEvaluationPage />} />
        <Route
          path="/test-management/fundamentals-questions"
          element={<FundamentalsquestionsPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
