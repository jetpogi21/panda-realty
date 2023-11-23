import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_\-+=]).{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character. It should be at least 6 characters long."
    ),
  passwordConfirmation: Yup.string()
    .required("Password confirmation is required")
    .oneOf(
      [Yup.ref("password")],
      "The confirmation didn't match the password you provided"
    ),
});

export default validationSchema;
