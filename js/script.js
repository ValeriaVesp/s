document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openAdminLogin");
  const closeBtn = document.getElementById("closeAdminLogin");
  const form = document.getElementById("adminLoginForm");
  const modal = document.getElementById("admin-login-modal");

  if (openBtn) openBtn.addEventListener("click", () => modal.style.display = "flex");
  if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("admin_username").value.trim();
      const password = document.getElementById("admin_password").value.trim();
      const error = document.getElementById("adminError");

      const validUsername = "admin_p@gmail.com";
      const validPassword = "918273645";

      if (username === validUsername && password === validPassword) {
        window.location.href = "admin.html";
      } else {
        error.textContent = "Невірний логін або пароль";
      }
    });
  }
});