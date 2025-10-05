import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Avatar,
  Button,
  Box,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import { Link, useNavigate } from "react-router-dom";
import assets from "../../assets";
import { logout } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState("");

  const handleLogout = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      dispatch(logout());
      localStorage.removeItem("access");
      navigate("/login");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = `${format(now, "hh:mm a")} ${format(
        now,
        "dd-MM-yyyy"
      )}`;
      setCurrentTime(formatted);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${sizeConfigs.sidebar.width})`,
        ml: sizeConfigs.sidebar.width,
        boxShadow: "unset",
        minHeight: "40px",
        backgroundColor: colorConfigs.topbar.bg,
        color: colorConfigs.topbar.color,
      }}
    >
      <Toolbar
        className="topbarHead"
        sx={{
          backgroundColor: colorConfigs.sidebar.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "40px",
        }}
      >
        <div className="userSuperAdmin">
          <p>
            <span></span> Super Admin
          </p>
        </div>
        <div className="right_tophead">
          <p style={{ marginRight: "20px" }}>{currentTime}</p>
          <div className="userHead">
            <p>Howdy, {localStorage.getItem("name") || "User"}</p>
            <img src={assets.images.Avatar} alt="" />
          </div>
          <Link to="/login" className="logoutBtn" onClick={handleLogout}>
            <span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1.33333 12C0.966667 12 0.652667 11.8696 0.391333 11.6087C0.130444 11.3473 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130444 0.652667 0.391333 0.391333C0.652667 0.130444 0.966667 0 1.33333 0H6V1.33333H1.33333V10.6667H6V12H1.33333ZM8.66667 9.33333L7.75 8.36667L9.45 6.66667H4V5.33333H9.45L7.75 3.63333L8.66667 2.66667L12 6L8.66667 9.33333Z"
                  fill="white"
                />
              </svg>
            </span>{" "}
            Log Out
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
