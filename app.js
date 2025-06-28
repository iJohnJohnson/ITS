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

const machines = [];
let selectedMachineIndex = null;
let selectedPartIndex = null;

function renderMachineList() {
  machineList.innerHTML = "";

  machines.forEach((machine, index) => {
    const div = document.createElement("div");
    div.classList.add("machine-card");
    div.textContent = machine.name;
    div.setAttribute("draggable", true);
    div.dataset.index = index;

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
    });

    // Drag events
    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("type", "machine");
      e.dataTransfer.setData("fromIndex", index);
    });

    div.addEventListener("dragover", (e) => {
      e.preventDefault();
      div.classList.add("drag-over");
    });

    div.addEventListener("dragleave", () => {
      div.classList.remove("drag-over");
    });

    div.addEventListener("drop", (e) => {
      e.preventDefault();
      const from = parseInt(e.dataTransfer.getData("fromIndex"));
      const to = index;

      if (from !== to) {
        const moved = machines.splice(from, 1)[0];
        machines.splice(to, 0, moved);
        selectedMachineIndex = to;
        renderMachineList();
      }
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
    partDiv.setAttribute("draggable", true);
    partDiv.dataset.index = index;

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
    });

    // Drag events
    partDiv.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("type", "part");
      e.dataTransfer.setData("fromIndex", index);
    });

    partDiv.addEventListener("dragover", (e) => {
      e.preventDefault();
      partDiv.classList.add("drag-over");
    });

    partDiv.addEventListener("dragleave", () => {
      partDiv.classList.remove("drag-over");
    });

    partDiv.addEventListener("drop", (e) => {
      e.preventDefault();
      const from = parseInt(e.dataTransfer.getData("fromIndex"));
      const to = index;

      if (from !== to && selectedMachineIndex !== null) {
        const partList = machines[selectedMachineIndex].parts;
        const moved = partList.splice(from, 1)[0];
        partList.splice(to, 0, moved);
        selectedPartIndex = to;
        renderPartList(partList);
      }
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

// Delete
deleteBtn.addEventListener("click", () => {
  if (selectedPartIndex !== null && selectedMachineIndex !== null) {
    const confirmPart = confirm("Delete this machine detail?");
    if (!confirmPart) return;

    machines[selectedMachineIndex].parts.splice(selectedPartIndex, 1);
    selectedPartIndex = null;
    renderPartList(machines[selectedMachineIndex].parts);
    deleteBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
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
  }
});

// Edit
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

// Background click = deselect
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

    partList.innerHTML = "<p>No machine selected.</p>";
  }
});
