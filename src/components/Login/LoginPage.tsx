import React, { useEffect, useState } from "react";
import { Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import assets from "../../assets";
import { loginUser } from "../../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const LoginPage = () => {
  const dispatch = useDispatch<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success("Login successful!");
      // if (rememberMe) {
      //   localStorage.setItem("rememberedEmail", email);
      //   localStorage.setItem("rememberedPassword", password);
      // } else {
      //   localStorage.removeItem("rememberedEmail");
      //   localStorage.removeItem("rememberedPassword");
      // }
      navigate("/");
    } catch (error) {
      toast.error("Invalid email or password");
    }
  };
  // useEffect(() => {
  //   const savedEmail = localStorage.getItem("rememberedEmail");
  //   const savedPassword = localStorage.getItem("rememberedPassword");
  //   if (savedEmail && savedPassword) {
  //     setEmail(savedEmail);
  //     setPassword(savedPassword);
  //     setRememberMe(true);
  //   }
  // }, []);
  return (
    <div className="login_wrapp">
      <div className="login_inner">
        <div className="head_login">
          <img className="logo" src={assets.images.logo} />
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username or Email Address</label>
            <input
              type="text"
              placeholder="Email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group position-relative">
            <label>Password</label>
            <input
              type={visible ? "text" : "password"}
              placeholder="Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="btneye"
              onClick={() => setVisible(!visible)}
              style={{
                position: "absolute",
                right: "10px",
                top: "40px",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} />
            </div>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="btnGrp">
            <div className="btn_rem">
              {/* <label htmlFor="Remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label> */}
            </div>

            <Button className="btn-login" type="submit">
              {loading ? "Log In..." : "Log In"}
            </Button>
          </div>
        </form>

        <div className="Forgot_txt">
          <Link to="/ForgotPassword">Forgot your password</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
