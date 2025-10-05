import { FieldErrorMap } from "../../utils/validateFields";

export const requiredFieldsMap: Record<number, FieldErrorMap> = {
  1: {
    email: "Email is required",
    otp: "OTP is required",
    new_password: "New password is required",
    confirm_password: "Please confirm your new password",
  },
};

export const keyMap: Record<string, string> = {
  email: "email",
  otp: "otp",
  new_password: "new_password",
};

export const defaultForm = {
  email: "",
  otp: "",
  new_password: "",
  confirm_password: "",
};
