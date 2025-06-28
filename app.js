// Dark Mode Toggle Logic (unchanged)
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
  if (savedTheme === "dark") setThemeMode("dark");

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

// Inventory Logic
const machineList = document.getElementById("machine-list");
const partList = document.getElementById("part-list");
const deleteBtn = document.getElementById("delete-machine-btn");
const addDetailBtn = document.getElementById("add-detail-btn");
const editBtn = document.getElementById("edit-btn");
const moveBtn = document.getElementById("move-btn");

const machines = [];
let selectedMachineIndex = null;
let selectedPartIndex = null;

function renderMachineList() {
  machineList.innerHTML = "";

  machines.forEach((machine, index) => {
    const div = document.createElement("div");
    div.classList.add("machine-card");
    div.textContent = machine.name;

    if (index === selectedMachineIndex) {
      div.classList.add("selected");
    }

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedMachineIndex = index;
      selectedPartIndex = null;

      document.querySelectorAll("#machine-list .machine-card").forEach(card => {
        card.classList.remove("selected");
      });
      div.classList.add("selected");

      renderPartList(machine.parts);
      deleteBtn.classList.remove("disabled");
      addDetailBtn.classList.remove("disabled");
      editBtn.classList.remove("disabled");
      moveBtn.classList.remove("disabled");
    });

    machineList.appendChild(div);
  });
}

function renderPartList(parts) {
  partList.innerHTML = "";

  if (!parts || parts.length === 0) {
    partList.innerHTML = "<p>No inventory details available.</p>";
    return;
  }

  parts.forEach((part, index) => {
    const partDiv = document.createElement("div");
    partDiv.classList.add("machine-card");

    if (index === selectedPartIndex) {
      partDiv.classList.add("selected");
    }

    partDiv.innerHTML = `
      <strong>Part:</strong> ${part.partNumber}<br>
      <strong>Qty:</strong> ${part.quantity}<br>
      <strong>Loc:</strong> ${part.location}
    `;

    partDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedPartIndex = index;

      partList.querySelectorAll(".machine-card").forEach(card => {
        card.classList.remove("selected");
      });
      partDiv.classList.add("selected");

      deleteBtn.classList.remove("disabled");
      editBtn.classList.remove("disabled");
      moveBtn.classList.remove("disabled");
    });

    partList.appendChild(partDiv);
  });
}

// Add New Machine
document.getElementById("add-machine-btn").addEventListener("click", () => {
  const name = prompt("Enter Machine Name:");
  if (!name) return;

  machines.push({ name, parts: [] });
  renderMachineList();
});

// Add Detail
addDetailBtn.addEventListener("click", () => {
  if (selectedMachineIndex === null) return;

  const partNumber = prompt("Enter Part Number:");
  if (!partNumber) return;

  const quantity = prompt("Enter Quantity:");
  if (!quantity) return;

  const location = prompt("Enter Location:");
  if (!location) return;

  machines[selectedMachineIndex].parts.push({ partNumber, quantity, location });
  renderPartList(machines[selectedMachineIndex].parts);
});

// Delete Logic
deleteBtn.addEventListener("click", () => {
  if (selectedPartIndex !== null && selectedMachineIndex !== null) {
    const confirmPart = confirm("Delete this machine detail?");
    if (!confirmPart) return;

    machines[selectedMachineIndex].parts.splice(selectedPartIndex, 1);
    selectedPartIndex = null;
    renderPartList(machines[selectedMachineIndex].parts);
    deleteBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
    moveBtn.classList.add("disabled");
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
    editBtn.classList.add("disabled");
    moveBtn.classList.add("disabled");
  }
});

// Edit Logic
editBtn.addEventListener("click", () => {
  if (selectedPartIndex !== null && selectedMachineIndex !== null) {
    const part = machines[selectedMachineIndex].parts[selectedPartIndex];

    const newPartNumber = prompt("Edit Part Number:", part.partNumber);
    if (!newPartNumber) return;

    const newQty = prompt("Edit Quantity:", part.quantity);
    if (!newQty) return;

    const newLoc = prompt("Edit Location:", part.location);
    if (!newLoc) return;

    Object.assign(part, { partNumber: newPartNumber, quantity: newQty, location: newLoc });
    renderPartList(machines[selectedMachineIndex].parts);
    return;
  }

  if (selectedMachineIndex !== null) {
    const machine = machines[selectedMachineIndex];
    const newName = prompt("Edit Machine Name:", machine.name);
    if (!newName) return;

    machine.name = newName;
    renderMachineList();
  }
});

// ✅ Move Logic
moveBtn.addEventListener("click", () => {
  if (selectedMachineIndex !== null && selectedPartIndex === null) {
    const direction = prompt("Move machine 'up' or 'down'?").toLowerCase();
    if (direction !== "up" && direction !== "down") return;

    const newIndex = direction === "up" ? selectedMachineIndex - 1 : selectedMachineIndex + 1;
    if (newIndex < 0 || newIndex >= machines.length) return;

    const temp = machines[selectedMachineIndex];
    machines[selectedMachineIndex] = machines[newIndex];
    machines[newIndex] = temp;
    selectedMachineIndex = newIndex;

    renderMachineList();
  }

  if (selectedMachineIndex !== null && selectedPartIndex !== null) {
    const parts = machines[selectedMachineIndex].parts;
    const direction = prompt("Move detail 'up' or 'down'?").toLowerCase();
    if (direction !== "up" && direction !== "down") return;

    const newIndex = direction === "up" ? selectedPartIndex - 1 : selectedPartIndex + 1;
    if (newIndex < 0 || newIndex >= parts.length) return;

    const temp = parts[selectedPartIndex];
    parts[selectedPartIndex] = parts[newIndex];
    parts[newIndex] = temp;
    selectedPartIndex = newIndex;

    renderPartList(parts);
  }
});

// Deselect on background click
document.addEventListener("click", (e) => {
  const isInsideMachine = machineList.contains(e.target);
  const isInsidePart = partList.contains(e.target);

  if (!isInsideMachine && !isInsidePart) {
    selectedMachineIndex = null;
    selectedPartIndex = null;

    document.querySelectorAll(".machine-card").forEach(card => {
      card.classList.remove("selected");
    });

    deleteBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
    moveBtn.classList.add("disabled");

    partList.innerHTML = "<p>No machine selected.</p>";
  }
});
