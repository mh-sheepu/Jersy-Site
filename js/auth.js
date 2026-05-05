(function () {
  const AUTH_KEY = "voidAdminAuthenticated";
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "Void@2026";

  const page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
  const isAuthenticated = () => sessionStorage.getItem(AUTH_KEY) === "true";

  if (page === "admin" && !isAuthenticated()) {
    window.location.replace("login.html");
    return;
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.replace("login.html");
  };

  window.VoidAdminAuth = { logout };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const status = document.getElementById("loginStatus");
    const logoutButton = document.getElementById("adminLogout");

    if (page === "login" && isAuthenticated()) {
      window.location.replace("admin.html");
      return;
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("usernameInput").value.trim();
        const password = document.getElementById("passwordInput").value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          sessionStorage.setItem(AUTH_KEY, "true");
          window.location.replace("admin.html");
          return;
        }

        if (status) status.textContent = "Wrong username or password.";
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    }
  });
})();
