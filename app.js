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
  if (savedTheme === "dark") setThemeMode("dark");

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      toggleTheme();
    }
  });

  const sidebarToggle = document.getElementById("theme-toggle-sidebar");
  if (sidebarToggle) sidebarToggle.addEventListener("click", toggleTheme);
});

// =======================
// Inventory Hierarchy Logic
// =======================

const machineList = document.getElementById("machine-list");
const partList = document.getElementById("part-list");
const deleteBtn = document.getElementById("delete-machine-btn");
const addMachineBtn = document.getElementById("add-machine-btn");
const addMachineLayerBtn = document.getElementById("add-machine-layer-btn");
const addDetailBtn = document.getElementById("add-detail-btn");
const editBtn = document.getElementById("edit-btn");
const moveBtn = document.getElementById("move-btn");

const machines = [];

let selectedParentIndex = null;
let selectedChildIndex = null;
let lastSelectedParentIndex = null;
let lastSelectedChildIndex = null;

let selectedPartIndex = null;
let lastSelectedPartIndex = null;

let moveModeActive = false;

function updateButtonsState() {
  if (selectedParentIndex === null) {
    deleteBtn.classList.add("disabled");
    addMachineLayerBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
  } else if (selectedChildIndex === null) {
    const parent = machines[selectedParentIndex];
    deleteBtn.classList.remove("disabled");
    addMachineLayerBtn.classList.remove("disabled");
    const isParent = parent.children && parent.children.length > 0;
    addDetailBtn.classList.toggle("disabled", isParent);
    editBtn.classList.remove("disabled");
  } else {
    deleteBtn.classList.remove("disabled");
    addMachineLayerBtn.classList.add("disabled");
    addDetailBtn.classList.remove("disabled");
    editBtn.classList.remove("disabled");
  }

  if (!moveModeActive) {
    moveBtn.classList.remove("disabled");
  }
}

function renderMachineList() {
  machineList.innerHTML = "";

  machines.forEach((parent, pIndex) => {
    const parentDiv = document.createElement("div");
    parentDiv.classList.add("machine-card");
    parentDiv.textContent = parent.name;

    if (pIndex === selectedParentIndex && selectedChildIndex === null) {
      parentDiv.classList.add("selected");
    } else if (pIndex === lastSelectedParentIndex && selectedChildIndex === null) {
      parentDiv.classList.add("last-selected");
    }

    parentDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      lastSelectedParentIndex = selectedParentIndex;
      lastSelectedChildIndex = selectedChildIndex;
      lastSelectedPartIndex = selectedPartIndex;

      selectedParentIndex = pIndex;
      selectedChildIndex = null;
      selectedPartIndex = null;

      document.querySelectorAll("#machine-list .machine-card").forEach(card => card.classList.remove("selected", "last-selected"));
      parentDiv.classList.add("selected");

      const childParts = (parent.children || []).flatMap(child => child.parts || []);
      const partsToRender = parent.children?.length ? childParts : parent.parts || [];

      renderPartList(partsToRender);
      updateButtonsState();
    });

    if (moveModeActive) {
      parentDiv.setAttribute("draggable", true);
      parentDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("type", "parent");
        e.dataTransfer.setData("fromIndex", pIndex);
      });
      parentDiv.addEventListener("dragover", (e) => { e.preventDefault(); parentDiv.classList.add("drag-over"); });
      parentDiv.addEventListener("dragleave", () => parentDiv.classList.remove("drag-over"));
      parentDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        parentDiv.classList.remove("drag-over");
        const from = parseInt(e.dataTransfer.getData("fromIndex"));
        const to = pIndex;
        if (from !== to) {
          const moved = machines.splice(from, 1)[0];
          machines.splice(to, 0, moved);
          selectedParentIndex = to;
          selectedChildIndex = null;
          renderMachineList();
          renderPartList(machines[to].parts || []);
          updateButtonsState();
        }
      });
    } else {
      parentDiv.removeAttribute("draggable");
    }

    machineList.appendChild(parentDiv);

    if (parent.children?.length) {
      parent.children.forEach((child, cIndex) => {
        const childDiv = document.createElement("div");
        childDiv.classList.add("machine-card");
        childDiv.style.marginLeft = "20px";
        childDiv.textContent = child.name;

        if (pIndex === selectedParentIndex && cIndex === selectedChildIndex) {
          childDiv.classList.add("selected");
        } else if (pIndex === lastSelectedParentIndex && cIndex === lastSelectedChildIndex) {
          childDiv.classList.add("last-selected");
        }

        childDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          lastSelectedParentIndex = selectedParentIndex;
          lastSelectedChildIndex = selectedChildIndex;
          lastSelectedPartIndex = selectedPartIndex;

          selectedParentIndex = pIndex;
          selectedChildIndex = cIndex;
          selectedPartIndex = null;

          document.querySelectorAll("#machine-list .machine-card").forEach(card => card.classList.remove("selected", "last-selected"));
          childDiv.classList.add("selected");

          renderPartList(child.parts || []);
          updateButtonsState();
        });

        machineList.appendChild(childDiv);
      });
    }
  });
  updateButtonsState();
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
    if (index === selectedPartIndex) partDiv.classList.add("selected");
    else if (index === lastSelectedPartIndex) partDiv.classList.add("last-selected");

    partDiv.innerHTML = `
      <strong>Part:</strong> ${part.partNumber}<br>
      <strong>Qty:</strong> ${part.quantity}<br>
      <strong>Loc:</strong> ${part.location}
    `;

    partDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      lastSelectedPartIndex = selectedPartIndex;
      selectedPartIndex = index;

      partList.querySelectorAll(".machine-card").forEach(card => card.classList.remove("selected"));
      partDiv.classList.add("selected");

      deleteBtn.classList.remove("disabled");
      editBtn.classList.remove("disabled");
      moveBtn.classList.remove("disabled");
    });

    partList.appendChild(partDiv);
  });
}

// Buttons logic (Add, Edit, Delete, Move, etc.) remains unchanged (I can add if you want)

// =======================
// Move Button Toggle
// =======================
moveBtn.addEventListener("click", () => {
  moveModeActive = !moveModeActive;
  moveBtn.classList.toggle("active", moveModeActive);

  if (moveModeActive) {
    deleteBtn.classList.add("disabled");
    addMachineBtn.classList.add("disabled");
    addMachineLayerBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
  } else {
    updateButtonsState();
  }

  renderMachineList();

  if (selectedParentIndex !== null) {
    if (selectedChildIndex !== null) {
      renderPartList(machines[selectedParentIndex].children[selectedChildIndex].parts || []);
    } else {
      const parent = machines[selectedParentIndex];
      const childParts = (parent.children || []).flatMap(child => child.parts || []);
      const partsToRender = parent.children?.length ? childParts : parent.parts || [];
      renderPartList(partsToRender);
    }
  }
});

// =======================
// Add Parent Machine
// =======================
addMachineBtn.addEventListener("click", () => {
  if (moveModeActive) return;
  const parentName = prompt("Enter Parent Machine Name:");
  if (!parentName) return;
  machines.push({ name: parentName, children: [], parts: [] });
  renderMachineList();
  updateButtonsState();
});

// =======================
// Add Child Machine Layer
// =======================
addMachineLayerBtn.addEventListener("click", () => {
  if (moveModeActive) return;
  if (selectedParentIndex === null) return;

  const childName = prompt("Enter Child Machine Name:");
  if (!childName) return;

  if (!machines[selectedParentIndex].children) {
    machines[selectedParentIndex].children = [];
  }
  machines[selectedParentIndex].children.push({ name: childName, parts: [] });
  renderMachineList();
  updateButtonsState();
});

// =======================
// Add Machine Detail (part) to selected machine (child only)
// =======================
addDetailBtn.addEventListener("click", () => {
  if (moveModeActive) return;
  if (selectedParentIndex === null) return;

  const partNumber = prompt("Enter Part Number:");
  if (!partNumber) return;
  const quantity = prompt("Enter Quantity:");
  if (!quantity) return;
  const location = prompt("Enter Location:");
  if (!location) return;

  // Only add details to child machines, since parents can't have parts
  if (selectedChildIndex === null) {
    alert("Cannot add machine details to a parent machine. Please select a child machine.");
    return;
  }

  const child = machines[selectedParentIndex].children[selectedChildIndex];
  if (!child.parts) child.parts = [];
  child.parts.push({ partNumber, quantity, location });
  renderPartList(child.parts);
  updateButtonsState();
});

// =======================
// Delete Button Logic
// =======================
deleteBtn.addEventListener("click", () => {
  if (moveModeActive) return;

  if (selectedPartIndex !== null && selectedParentIndex !== null) {
    const confirmPart = confirm("Delete this machine detail?");
    if (!confirmPart) return;

    let partsArr = null;
    if (selectedChildIndex !== null) {
      partsArr = machines[selectedParentIndex].children[selectedChildIndex].parts;
    } else {
      partsArr = machines[selectedParentIndex].parts;
    }

    if (!partsArr || partsArr.length === 0) return;

    partsArr.splice(selectedPartIndex, 1);
    selectedPartIndex = null;
    renderPartList(partsArr);
    deleteBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
    updateButtonsState();
    return;
  }

  if (selectedParentIndex !== null) {
    if (selectedChildIndex !== null) {
      const confirmChild = confirm("Delete this child machine?");
      if (!confirmChild) return;

      machines[selectedParentIndex].children.splice(selectedChildIndex, 1);
      selectedChildIndex = null;
      selectedPartIndex = null;
      renderMachineList();
      partList.innerHTML = "<p>No machine selected.</p>";
      updateButtonsState();
    } else {
      const confirmParent = confirm("Delete this entire parent machine?");
      if (!confirmParent) return;

      machines.splice(selectedParentIndex, 1);
      selectedParentIndex = null;
      selectedChildIndex = null;
      selectedPartIndex = null;
      renderMachineList();
      partList.innerHTML = "<p>No machine selected.</p>";
      updateButtonsState();
    }
  }
});

// =======================
// Edit Button Logic
// =======================
editBtn.addEventListener("click", () => {
  if (moveModeActive) return;

  if (selectedPartIndex !== null && selectedParentIndex !== null) {
    let partsArr = null;
    if (selectedChildIndex !== null) {
      partsArr = machines[selectedParentIndex].children[selectedChildIndex].parts;
    } else {
      partsArr = machines[selectedParentIndex].parts;
    }

    if (!partsArr || partsArr.length === 0) return;

    const part = partsArr[selectedPartIndex];

    const newPartNumber = prompt("Edit Part Number:", part.partNumber);
    if (!newPartNumber) return;

    const newQty = prompt("Edit Quantity:", part.quantity);
    if (!newQty) return;

    const newLoc = prompt("Edit Location:", part.location);
    if (!newLoc) return;

    Object.assign(part, { partNumber: newPartNumber, quantity: newQty, location: newLoc });
    renderPartList(partsArr);
    updateButtonsState();
    return;
  }

  if (selectedParentIndex !== null) {
    if (selectedChildIndex !== null) {
      const child = machines[selectedParentIndex].children[selectedChildIndex];
      const newName = prompt("Edit Child Machine Name:", child.name);
      if (!newName) return;

      child.name = newName;
      renderMachineList();
      updateButtonsState();
    } else {
      const parent = machines[selectedParentIndex];
      const newName = prompt("Edit Parent Machine Name:", parent.name);
      if (!newName) return;

      parent.name = newName;
      renderMachineList();
      updateButtonsState();
    }
  }
});

// =======================
// Deselect on background click
// =======================
document.addEventListener("click", (e) => {
  const isInsideMachine = machineList.contains(e.target);
  const isInsidePart = partList.contains(e.target);

  if (!isInsideMachine && !isInsidePart) {
    lastSelectedParentIndex = selectedParentIndex;
    lastSelectedChildIndex = selectedChildIndex;
    lastSelectedPartIndex = selectedPartIndex;

    selectedParentIndex = null;
    selectedChildIndex = null;
    selectedPartIndex = null;

    document.querySelectorAll(".machine-card").forEach(card => {
      card.classList.remove("selected", "last-selected");
    });

    deleteBtn.classList.add("disabled");
    addMachineLayerBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
    if (!moveModeActive) {
      moveBtn.classList.add("disabled");
    }

    partList.innerHTML = "<p>No machine selected.</p>";
  }
});

// =======================
// HOTKEYS Implementation
// =======================

// Track pressed keys for multi-key combos
const pressedKeys = new Set();

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  pressedKeys.add(key);

  function isPressed(keys) {
    return keys.every(k => pressedKeys.has(k));
  }

  // DELETE key for deleteBtn
  if (key === "delete" && !deleteBtn.classList.contains("disabled")) {
    e.preventDefault();
    deleteBtn.click();
    return;
  }

  // Ctrl + M for Move
  if (isPressed(["control", "m"]) && !moveBtn.classList.contains("disabled")) {
    e.preventDefault();
    moveBtn.click();
    return;
  }

  // Ctrl + E for Edit
  if (isPressed(["control", "e"]) && !editBtn.classList.contains("disabled")) {
    e.preventDefault();
    editBtn.click();
    return;
  }

  // Ctrl + A + M for Add Machine
  if (isPressed(["control", "shift", "m"]) && !addMachineBtn.classList.contains("disabled")) {
    e.preventDefault();
    addMachineBtn.click();
    return;
  }

  // Ctrl + A + L for Add Machine Layer
  if (isPressed(["control", "shift", "l"]) && !addMachineLayerBtn.classList.contains("disabled")) {
    e.preventDefault();
    addMachineLayerBtn.click();
    return;
  }

  // Ctrl + A + D for Add Machine Detail
  if (isPressed(["control", "shift", "d"]) && !addDetailBtn.classList.contains("disabled")) {
    e.preventDefault();
    addDetailBtn.click();
    return;
  }
});

document.addEventListener("keyup", (e) => {
  pressedKeys.delete(e.key.toLowerCase());
});

// =======================
// Initial render on load
// =======================
renderMachineList();
partList.innerHTML = "<p>No machine selected.</p>";
updateButtonsState();
