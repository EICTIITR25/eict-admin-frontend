import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import assets from "../assets";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="login_wrapp">
      <div className="login_inner" style={{ textAlign: "center" }}>
        <div className="head_login">
          <img className="logo" src={assets.images.logo} alt="Logo" />
        </div>

        <h1 style={{ fontSize: "72px", margin: "20px 0", color: "#333" }}>
          404
        </h1>
        <h2 style={{ marginBottom: "10px" }}>Page Not Found</h2>
        <p style={{ color: "#777", marginBottom: "30px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button
          variant="contained"
          color="primary"
          onClick={goHome}
          className="btn-login"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
