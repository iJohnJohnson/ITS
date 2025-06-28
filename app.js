// Dark Theme Toggle
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
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setThemeMode("dark");
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      toggleTheme();
    }
  });

  const sidebarToggle = document.getElementById("theme-toggle-sidebar");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleTheme);
  }
});

// Machine System
const machineList = document.getElementById("machine-list");
const partList = document.getElementById("part-list");
const deleteBtn = document.getElementById("delete-machine-btn");
const addDetailBtn = document.getElementById("add-detail-btn");

const machines = [];
let selectedMachineIndex = null;

function renderMachineList() {
  machineList.innerHTML = "";
  machines.forEach((machine, index) => {
    const div = document.createElement("div");
    div.classList.add("machine-card");
    div.textContent = machine.name;

    div.addEventListener("click", () => {
      selectedMachineIndex = index;
      renderPartList(machine.parts);

      // Enable buttons
      deleteBtn.classList.remove("disabled");
      addDetailBtn.classList.remove("disabled");
    });

    machineList.appendChild(div);
  });
}

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

document.getElementById("add-machine-btn").addEventListener("click", () => {
  const name = prompt("Enter Machine Name:");
  if (!name) return;

  const newMachine = {
    name,
    parts: []
  };

  machines.push(newMachine);
  renderMachineList();
});

addDetailBtn.addEventListener("click", () => {
  if (selectedMachineIndex === null) return;

  const partNumber = prompt("Enter Part Number:");
  if (!partNumber) return;

  const quantity = prompt("Enter Quantity:");
  if (!quantity) return;

  const location = prompt("Enter Location:");
  if (!location) return;

  const part = {
    partNumber,
    quantity,
    location
  };

  machines[selectedMachineIndex].parts.push(part);
  renderPartList(machines[selectedMachineIndex].parts);
});

deleteBtn.addEventListener("click", () => {
  if (selectedMachineIndex === null) return;

  const confirmed = confirm("Are you sure you want to delete this machine?");
  if (!confirmed) return;

  machines.splice(selectedMachineIndex, 1);
  selectedMachineIndex = null;
  renderMachineList();
  partList.innerHTML = "";
  deleteBtn.classList.add("disabled");
  addDetailBtn.classList.add("disabled");
});
