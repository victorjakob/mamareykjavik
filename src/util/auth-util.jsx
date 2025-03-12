export const defaultFormValues = {
  email: "",
  password: "",
  name: "",
  termsAccepted: false,
  emailSubscription: false,
};

export const formValidation = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
  name: {
    required: "Name is required",
  },
  termsAccepted: {
    required: "You must accept the terms and conditions",
  },
};
