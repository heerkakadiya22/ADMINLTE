function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

document.getElementById("imageUpload").addEventListener("change", function (e) {
  const img = document.getElementById("previewImg");
  if (e.target.files && e.target.files[0]) {
    img.src = URL.createObjectURL(e.target.files[0]);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const successDiv = document.getElementById("successMsg");
  if (successDiv) {
    setTimeout(() => {
      successDiv.style.transition = "opacity 0.5s ease";
      successDiv.style.opacity = "0";
      setTimeout(() => {
        successDiv.style.display = "none";
      }, 500);
    }, 3000);
  }

  const errorDiv = document.getElementById("errorMsg");
  if (errorDiv) {
    setTimeout(() => {
      errorDiv.style.transition = "opacity 0.5s ease";
      errorDiv.style.opacity = "0";
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 500);
    }, 5000);
  }
});
