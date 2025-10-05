import React, { useState } from "react";
import { Button, Modal, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import assets from "../../assets";
import { useDynamicForm } from "../../hooks/useDynamicForm";
import { defaultForm, requiredFieldsMap } from "./formConfig";
import { validateFields } from "../../utils/validateFields";
import { useCrud } from "../../hooks/useCrud";
import { getErrorMessage } from "../../utils/helper";
import { buildFormData } from "../../utils/buildFormData";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const { useCreate } = useCrud();
  const { form, handleChange, errors, setErrors, isFieldsEmpty } =
    useDynamicForm(defaultForm);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [isOtpVerify, setIsOtpVerify] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { mutate: forgetPassword } = useCreate(
    "/auth/forgot-password/reset-password/",
    ["{}"],
    {
      onSuccess: () => {
        setOpenModal(true);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: sendOtp } = useCreate(
    "/auth/forgot-password/send-otp/",
    ["{}"],
    {
      onSuccess: (data) => {
        setIsOtpSend(true);
        toast.success(data.message);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );
  const { mutate: verifyOtp } = useCreate(
    "/auth/forgot-password/verify-otp/",
    ["{}"],
    {
      onSuccess: (data) => {
        setIsOtpVerify(true);
        toast.success(data.message);
      },
      onError: (error) => {
        getErrorMessage(error);
      },
    }
  );

  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requiredFields = requiredFieldsMap[1];
    const { isValid, errors } = validateFields(form, requiredFields);

    if (!isValid) {
      setErrors(errors);
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setErrors((prev) => ({
        ...prev,
        confirm_password: "Password do not match",
      }));
      return;
    }
    setErrors({});
    forgetPassword(form);
  };

  const closeModal = () => setOpenModal(false);

  return (
    <div className="ForgotPasswordSection">
      <div className="left_bx">
        <div className="head_login">
          <img className="logo" src={assets.images.logo} alt="Logo" />
        </div>
      </div>
      <div className="right_bx">
        <Link to="/login">
          <span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M27 15H5C4.44772 15 4 15.4477 4 16C4 16.5523 4.44772 17 5 17H27C27.5523 17 28 16.5523 28 16C28 15.4477 27.5523 15 27 15Z"
                fill="white"
              />
              <path
                d="M14.7067 7.70748L14.7071 7.70711C14.8946 7.51957 15 7.26522 15 7C15 6.73478 14.8946 6.48043 14.7071 6.29289L14.7065 6.29232L14.6985 6.28436L14.6979 6.2838C14.5112 6.10184 14.2607 6 14 6C13.7348 6 13.4804 6.10536 13.2929 6.29289L13.2925 6.29327L4.29289 15.2929C4.10536 15.4804 4 15.7348 4 16C4 16.2652 4.10536 16.5196 4.29289 16.7071L13.2929 25.7071C13.4804 25.8946 13.7348 26 14 26C14.2652 26 14.5196 25.8946 14.7071 25.7071C14.8946 25.5196 15 25.2652 15 25C15 24.7348 14.8946 24.4804 14.7071 24.2929L6.41421 16L14.7067 7.70748Z"
                fill="white"
              />
            </svg>
          </span>{" "}
          Forgot Password
        </Link>

        <form onSubmit={handleConfirm}>
          <div className="form-group">
            <label>Your Registered Email ID</label>
            <input
              type="email"
              placeholder=""
              className="form-control"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
            <span
              className={`Verify ${!form.email.trim() ? "disabled" : ""}`}
              style={{
                pointerEvents: !form.email.trim() ? "none" : "auto",
                opacity: !form.email.trim() ? 0.5 : 1,
              }}
              onClick={() => {
                if (form.email.trim()) {
                  const formData = buildFormData(
                    { email: form.email },
                    { email: "email" }
                  );
                  sendOtp(formData);
                }
              }}
            >
              Send Otp
            </span>
          </div>

          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              className="form-control"
              placeholder="******"
              value={form.otp}
              onChange={(e) => handleChange("otp", e.target.value)}
            />
            {errors.otp && <p className="error-text">{errors.otp}</p>}
            <span
              className={`Verify ${!form.otp.trim() ? "disabled" : ""}`}
              style={{
                pointerEvents: !form.otp.trim() ? "none" : "auto",
                opacity: !form.otp.trim() ? 0.5 : 1,
              }}
              onClick={() => {
                if (isOtpSend && form.otp.trim()) {
                  const formData = buildFormData(
                    { email: form.email, otp: form.otp },
                    { email: "email", otp: "otp" }
                  );
                  verifyOtp(formData);
                }
              }}
            >
              Verify OTP
            </span>
          </div>

          <div className="form-group">
            <label>Enter New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="******"
              value={form.new_password}
              disabled={!isOtpVerify}
              onChange={(e) => handleChange("new_password", e.target.value)}
            />
            {errors.new_password && (
              <p className="error-text">{errors.new_password}</p>
            )}
          </div>

          <div className="form-group">
            <label>Enter Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="******"
              disabled={!isOtpVerify}
              value={form.confirm_password}
              onChange={(e) => handleChange("confirm_password", e.target.value)}
            />
            {errors.confirm_password && (
              <p className="error-text">{errors.confirm_password}</p>
            )}
          </div>

          <div className="notied">
            <img src={assets.images.info} alt="info" />
            <span>Your Password will be sent to your registered email ID.</span>
          </div>

          <div className="btn_grp">
            <Button
              type="submit"
              className="btn"
              disabled={
                !isFieldsEmpty([
                  "email",
                  "otp",
                  "confirm_password",
                  "new_password",
                ])
              }
            >
              Confirm
            </Button>
            <Link to="/login" className="btn">
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      <Modal open={openModal} onClose={closeModal}>
        <div className="modal_box">
          <div className="icon">
            {" "}
            <img src={assets.images.sucess} alt="info" />
          </div>
          <h3> Your password has been updated sussfully!</h3>
          <h6> Please try to login now</h6>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
