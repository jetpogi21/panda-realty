import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string().required("Please provide your email address"),
  password: Yup.string().required("Please provide your password"),
});

export default validationSchema;
