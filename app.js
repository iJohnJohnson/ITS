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
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setThemeMode("dark");
  }

  // Ctrl+D for dark mode
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

// =======================
// Machine + Inventory Logic
// =======================

const machineList = document.getElementById("machine-list");
const partList = document.getElementById("part-list");
const deleteBtn = document.getElementById("delete-machine-btn");
const addDetailBtn = document.getElementById("add-detail-btn");

const machines = [];
let selectedMachineIndex = null;
let selectedPartIndex = null;

// Render machine list in middle container
function renderMachineList() {
  machineList.innerHTML = "";

  machines.forEach((machine, index) => {
    const div = document.createElement("div");
    div.classList.add("machine-card");
    div.textContent = machine.name;

    div.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent global click
      selectedMachineIndex = index;
      selectedPartIndex = null;
      renderPartList(machine.parts);

      deleteBtn.classList.remove("disabled");
      addDetailBtn.classList.remove("disabled");
    });

    machineList.appendChild(div);
  });
}

// Render parts in right container
function renderPartList(parts) {
  partList.innerHTML = "";

  if (parts.length === 0) {
    partList.innerHTML = "<p>No inventory details available.</p>";
    return;
  }

  parts.forEach((part, index) => {
    const partDiv = document.createElement("div");
    partDiv.classList.add("machine-card");
    partDiv.innerHTML = `
      <strong>Part:</strong> ${part.partNumber}<br>
      <strong>Qty:</strong> ${part.quantity}<br>
      <strong>Loc:</strong> ${part.location}
    `;

    partDiv.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent deselection
      selectedPartIndex = index;
      deleteBtn.classList.remove("disabled");
    });

    partList.appendChild(partDiv);
  });
}

// Add a new machine
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

// Add detail to selected machine
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

// Delete either machine or part depending on selection
deleteBtn.addEventListener("click", () => {
  if (selectedPartIndex !== null && selectedMachineIndex !== null) {
    const confirmPart = confirm("Delete this machine detail?");
    if (!confirmPart) return;

    machines[selectedMachineIndex].parts.splice(selectedPartIndex, 1);
    selectedPartIndex = null;
    renderPartList(machines[selectedMachineIndex].parts);
    deleteBtn.classList.add("disabled");
    return;
  }

  if (selectedMachineIndex !== null) {
    const confirmMachine = confirm("Delete this entire machine?");
    if (!confirmMachine) return;

    machines.splice(selectedMachineIndex, 1);
    selectedMachineIndex = null;
    selectedPartIndex = null;
    renderMachineList();
    partList.innerHTML = "<p>No machine selected.</p>";
    deleteBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
  }
});

// Click outside: deselect all
document.addEventListener("click", (e) => {
  const isClickInsideMachineList = machineList.contains(e.target);
  const isClickInsidePartList = partList.contains(e.target);

  if (!isClickInsideMachineList && !isClickInsidePartList) {
    selectedMachineIndex = null;
    selectedPartIndex = null;
    deleteBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
    partList.innerHTML = "<p>No machine selected.</p>";
  }
});
