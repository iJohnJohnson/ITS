// app.js

function setThemeMode(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
  localStorage.setItem("theme", mode);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", () => {
  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setThemeMode("dark");
  }

  // Keyboard shortcut (Ctrl+D)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault(); // Prevent browser bookmark or other default
      toggleTheme();
    }
  });

  // Sidebar click toggle
  const sidebarToggle = document.getElementById("theme-toggle-sidebar");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleTheme);
  }
});
