// app.js

// Load theme on page load
document.addEventListener("DOMContentLoaded", () => {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  // Listen for key press (D to toggle)
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "d") {
      document.body.classList.toggle("dark-theme");
      const newTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
    }
  });
});
