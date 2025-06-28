// app.js

// =======================
// Dark Mode Toggle Logic
// =======================
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
      e.preventDefault();
      toggleTheme();
    }
  });

  // Sidebar click toggle
  const sidebarToggle = document.getElementById("theme-toggle-sidebar");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleTheme);
  }
});

// =======================
// Machine + Inventory Logic
// =======================

// DOM Elements
const machineList = document.getElementById("machine-list");
const partList = document.getElementById("part-list");
const deleteBtn = document.getElementById("delete-machine-btn");

// In-memory store
const machines = [];

let selectedMachineIndex = null;

// Create Machine List Item
function renderMachineList() {
  machineList.innerHTML = "";
  machines.forEach((machine, index) => {
    const div = document.createElement("div");
    div.classList.add("machine-card");
    div.textContent = machine.name;

    div.addEventListener("click", () => {
      selectedMachineIndex = index;
      renderPartList(machine.parts);
      deleteBtn.classList.remove("disabled");
    });

    machineList.appendChild(div);
  });
}

// Create Inventory Detail List (Right Container)
function renderPartList(parts) {
  partList.innerHTML = "";

  if (parts.length === 0) {
    partList.innerHTML = "<p>No inventory details available.</p>";
    return;
  }

  parts.forEach((part) => {
    const partDiv = document.createElement("div");
    partDiv.classList.add("machine-card");
    partDiv.innerHTML = `
      <strong>Part:</strong> ${part.partNumber}<br>
      <strong>Qty:</strong> ${part.quantity}<br>
      <strong>Loc:</strong> ${part.location}
    `;
    partList.appendChild(partDiv);
  });
}

// Add Machine
document.getElementById("add-machine-btn").addEventListener("click", () => {
  const name = prompt("Enter Machine Name:");
  if (!name) return;

  // Single initial part for now
  const partNumber = prompt("Enter Part Number:");
  if (!partNumber) return;

  const quantity = prompt("Enter Quantity:");
  if (!quantity) return;

  const location = prompt("Enter Location:");
  if (!location) return;

  const newMachine = {
    name,
    parts: [
      {
        partNumber,
        quantity,
        location
      }
    ]
  };

  machines.push(newMachine);
  renderMachineList();
});

// Delete Machine
deleteBtn.addEventListener("click", () => {
  if (selectedMachineIndex === null) return;

  const confirmed = confirm("Are you sure you want to delete this machine?");
  if (!confirmed) return;

  machines.splice(selectedMachineIndex, 1);
  selectedMachineIndex = null;
  renderMachineList();
  partList.innerHTML = "";
  deleteBtn.classList.add("disabled");
});
