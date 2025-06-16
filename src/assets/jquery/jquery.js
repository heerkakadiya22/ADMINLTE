$(document).ready(function () {
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
        pattern: /^[a-zA-Z]+$/,
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
        pattern: "Name must contain only letters.",
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
    errorPlacement: function (error, element) {
      if (element.closest(".input-group").length) {
        error.insertAfter(element.closest(".input-group"));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
  });
});

$(document).ready(function () {
  $("#loginForm").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },
    messages: {
      email: {
        required: "Email is required.",
        email: "Please enter a valid email id.",
      },
      password: {
        required: "Password is required.",
      },
    },
    errorPlacement: function (error, element) {
      if (element.closest(".input-group").length) {
        error.insertAfter(element.closest(".input-group"));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
  });
});

$(document).ready(function () {
  $("#forgotPasswordForm").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
    },
    messages: {
      email: {
        required: "Email is required.",
        email: "Please enter a valid email id.",
      },
    },
    errorPlacement: function (error, element) {
      if (element.closest(".input-group").length) {
        error.insertAfter(element.closest(".input-group"));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
  });
});

$(document).ready(function () {
  $("#resetPasswordForm").validate({
    rules: {
      newPassword: {
        required: true,
        minlength: 6,
        maxlength: 10,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      },
      confirmNewPassword: {
        required: true,
        equalTo: "#password",
      },
    },
    messages: {
      newPassword: {
        required: "Password is required.",
        minlength: "Password must be at least 6 char.",
        maxlength: "Password cannot exceed 10 char.",
        pattern: "Password must include upper, lower, num & special char",
      },
      confirmNewPassword: {
        required: "Please confirm your password.",
        equalTo: "Passwords do not match.",
      },
    },
    errorPlacement: function (error, element) {
      if (element.closest(".input-group").length) {
        error.insertAfter(element.closest(".input-group"));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
  });
});

$(document).ready(function () {
  $("#ChangePasswordForm").validate({
    rules: {
      currentPassword: {
        required: true,
      },
      newPassword: {
        required: true,
        minlength: 6,
        maxlength: 10,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      },
      confirmNewPassword: {
        required: true,
        equalTo: "#newPassword",
      },
    },
    messages: {
      currentPassword: {
        required: "Current password is required.",
      },
      newPassword: {
        required: "New password is required.",
        minlength: "New password must be at least 6 char.",
        maxlength: "New password cannot exceed 10 char.",
        pattern: "New password must include upper, lower, num & special char",
      },
      confirmNewPassword: {
        required: "Please confirm your new password.",
        equalTo: "Passwords do not match.",
      },
    },
    errorPlacement: function (error, element) {
      if (element.closest(".input-group").length) {
        error.insertAfter(element.closest(".input-group"));
      } else {
        error.insertAfter(element);
      }
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
  });
});
