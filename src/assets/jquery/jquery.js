$.validator.addMethod(
  "pattern",
  function (value, element, param) {
    return this.optional(element) || param.test(value);
  },
  "Invalid format."
);

$("#registerForm").validate({
  rules: {
    name: {
      required: true,
      pattern: /^[a-zA-Z\s]+$/,
    },
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
      minlength: 6,
      maxlength: 10,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
    },
    confirmPassword: {
      required: true,
      equalTo: "#password",
    },
  },
  messages: {
    name: {
      required: "Name is required.",
      pattern: "Name must contain only letters and spaces.",
    },
    email: {
      required: "Email is required.",
      email: "Please enter a valid email address.",
    },
    password: {
      required: "Password is required.",
      minlength: "Password must be at least 6 char.",
      maxlength: "Password cannot exceed 10 char.",
      pattern: "Password must include upper, lower, num & special char",
    },
    confirmPassword: {
      required: "Please confirm your password.",
      equalTo: "Passwords do not match.",
    },
  },
});

$("#loginForm").validate({
  rules: {
    email,
    password: {
      required: true,
    },
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
    },
  },
  messages: {
    email,
    password: {
      required: "Email and Password are required.",
    },
    email: {
      required: "Email is required.",
      email: "Please enter a valid email address.",
    },
    password: {
      required: "Password is required.",
    },
  },
});
