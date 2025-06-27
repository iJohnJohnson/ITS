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



// Add Machines
const machineList = document.getElementById("machine-list");
const machineDetails = {
  name: document.getElementById("detail-name"),
  part: document.getElementById("detail-part"),
  qty: document.getElementById("detail-qty"),
  loc: document.getElementById("detail-loc")
};

const machines = []; // temp in-memory store

function createMachineCard(machine, index) {
  const div = document.createElement("div");
  div.classList.add("machine-card");
  div.textContent = machine.name;
  div.addEventListener("click", () => {
    machineDetails.name.textContent = machine.name;
    machineDetails.part.textContent = machine.part;
    machineDetails.qty.textContent = machine.quantity;
    machineDetails.loc.textContent = machine.location;
  });
  machineList.appendChild(div);
}

document.getElementById("add-machine-btn").addEventListener("click", () => {
  const name = prompt("Enter Machine Name:");
  if (!name) return;
  const part = prompt("Enter Part Number:");
  if (!part) return;
  const quantity = prompt("Enter Quantity:");
  if (!quantity) return;
  const location = prompt("Enter Location:");
  if (!location) return;

  const newMachine = {
    name,
    part,
    quantity,
    location
  };

  machines.push(newMachine);
  createMachineCard(newMachine, machines.length - 1);
});




let selectedMachineIndex = null;

const deleteBtn = document.getElementById("delete-machine-btn");

function createMachineCard(machine, index) {
  const div = document.createElement("div");
  div.classList.add("machine-card");
  div.textContent = machine.name;
  div.dataset.index = index;

  div.addEventListener("click", () => {
    selectedMachineIndex = index;

    // Show details
    machineDetails.name.textContent = machine.name;
    machineDetails.part.textContent = machine.part;
    machineDetails.qty.textContent = machine.quantity;
    machineDetails.loc.textContent = machine.location;

    // Enable delete
    deleteBtn.classList.remove("disabled");
  });

  machineList.appendChild(div);
}

deleteBtn.addEventListener("click", () => {
  if (selectedMachineIndex === null) return;

  // Remove from array
  machines.splice(selectedMachineIndex, 1);

  // Clear list and rebuild
  machineList.innerHTML = "";
  machines.forEach((m, i) => createMachineCard(m, i));

  // Reset details and button
  selectedMachineIndex = null;
  deleteBtn.classList.add("disabled");
  machineDetails.name.textContent = "-";
  machineDetails.part.textContent = "-";
  machineDetails.qty.textContent = "-";
  machineDetails.loc.textContent = "-";
});
