// =======================
// API Base URL
// =======================
const API_URL = "api.php";

// =======================
// Dark Mode Toggle Logic (unchanged)
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

  document.addEventListener("keydown", handleHotkeys);

  const sidebarToggle = document.getElementById("theme-toggle-sidebar");
  if (sidebarToggle) sidebarToggle.addEventListener("click", toggleTheme);

  loadMachinesFromServer();
});

// =======================
// Hotkeys handler (moved here for clarity)
// =======================
function handleHotkeys(e) {
  if (e.key === "Delete") {
    e.preventDefault();
    if (!deleteBtn.classList.contains("disabled")) deleteBtn.click();
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "m") {
    e.preventDefault();
    if (!moveBtn.classList.contains("disabled")) moveBtn.click();
  }
  if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "e") {
    e.preventDefault();
    if (!editBtn.classList.contains("disabled")) editBtn.click();
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
    e.preventDefault();
    if (!addMachineBtn.classList.contains("disabled")) addMachineBtn.click();
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
    e.preventDefault();
    if (!addMachineLayerBtn.classList.contains("disabled")) addMachineLayerBtn.click();
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    if (!addDetailBtn.classList.contains("disabled")) addDetailBtn.click();
  }
  if (e.ctrlKey && e.key.toLowerCase() === "d" && !e.shiftKey) {
    e.preventDefault();
    toggleTheme();
  }
}

// =======================
// Global DOM Elements & Variables (unchanged)
// =======================
const machineList = document.getElementById("machine-list");
const partList = document.getElementById("part-list");
const deleteBtn = document.getElementById("delete-machine-btn");
const addMachineBtn = document.getElementById("add-machine-btn");
const addMachineLayerBtn = document.getElementById("add-machine-layer-btn");
const addDetailBtn = document.getElementById("add-detail-btn");
const editBtn = document.getElementById("edit-btn");
const moveBtn = document.getElementById("move-btn");

let machines = [];

let selectedParentIndex = null;
let selectedChildIndex = null;
let lastSelectedParentIndex = null;
let lastSelectedChildIndex = null;
let selectedPartIndex = null;
let lastSelectedPartIndex = null;

let moveModeActive = false;

// =======================
// Helper: POST to API
// =======================
async function postAPI(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API Error");
    return data;
  } catch (err) {
    alert("Error: " + err.message);
    throw err;
  }
}

// =======================
// Load machines from server (GET /api.php?load)
// =======================
async function loadMachinesFromServer() {
  try {
    const res = await fetch(`${API_URL}?load`);
    const data = await res.json();
    machines = data.machines || [];
    selectedParentIndex = null;
    selectedChildIndex = null;
    selectedPartIndex = null;

    renderMachineList();
    partList.innerHTML = "<p>No machine selected.</p>";
    updateButtonsState();
  } catch (err) {
    alert("Failed to load machines from server: " + err.message);
  }
}

// =======================
// UI Render Functions (unchanged from your version)
// =======================
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

      if (parent.children && parent.children.length > 0) {
        const combinedParts = parent.children.flatMap(child => child.parts || []);
        renderPartList(combinedParts);
      } else {
        renderPartList(parent.parts || []);
      }

      updateButtonsState();
    });

    if (moveModeActive) {
      parentDiv.setAttribute("draggable", true);
      parentDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("type", "parent");
        e.dataTransfer.setData("fromIndex", pIndex);
      });
      parentDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        parentDiv.classList.add("drag-over");
      });
      parentDiv.addEventListener("dragleave", () => parentDiv.classList.remove("drag-over"));
      parentDiv.addEventListener("drop", async (e) => {
        e.preventDefault();
        parentDiv.classList.remove("drag-over");
        const from = parseInt(e.dataTransfer.getData("fromIndex"));
        const to = pIndex;
        if (from !== to) {
          const moved = machines.splice(from, 1)[0];
          machines.splice(to, 0, moved);

          // TODO: Persist reorder to server if needed, or skip for now

          selectedParentIndex = to;
          selectedChildIndex = null;
          renderMachineList();
          const newParent = machines[to];
          if (newParent.children && newParent.children.length > 0) {
            renderPartList(newParent.children.flatMap(c => c.parts || []));
          } else {
            renderPartList(newParent.parts || []);
          }
          updateButtonsState();
        }
      });
    } else {
      parentDiv.removeAttribute("draggable");
    }

    machineList.appendChild(parentDiv);

    if (parent.children && parent.children.length > 0) {
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

        if (moveModeActive) {
          childDiv.setAttribute("draggable", true);
          childDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("type", "child");
            e.dataTransfer.setData("fromParentIndex", pIndex);
            e.dataTransfer.setData("fromChildIndex", cIndex);
          });
          childDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
            childDiv.classList.add("drag-over");
          });
          childDiv.addEventListener("dragleave", () => childDiv.classList.remove("drag-over"));
          childDiv.addEventListener("drop", (e) => {
            e.preventDefault();
            childDiv.classList.remove("drag-over");

            const fromParent = parseInt(e.dataTransfer.getData("fromParentIndex"));
            const fromChild = parseInt(e.dataTransfer.getData("fromChildIndex"));
            const toParent = pIndex;
            const toChild = cIndex;

            if (fromParent === toParent && fromChild !== toChild) {
              const siblings = machines[toParent].children;
              const moved = siblings.splice(fromChild, 1)[0];
              siblings.splice(toChild, 0, moved);
              selectedParentIndex = toParent;
              selectedChildIndex = toChild;
              renderMachineList();
              renderPartList(siblings[toChild].parts || []);
              updateButtonsState();
            }
          });
        } else {
          childDiv.removeAttribute("draggable");
        }

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

    if (moveModeActive) {
      partDiv.setAttribute("draggable", true);
      partDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("type", "part");
        e.dataTransfer.setData("fromIndex", index);
      });
      partDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        partDiv.classList.add("drag-over");
      });
      partDiv.addEventListener("dragleave", () => partDiv.classList.remove("drag-over"));
      partDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        partDiv.classList.remove("drag-over");
        const from = parseInt(e.dataTransfer.getData("fromIndex"));
        const to = index;
        if (from !== to) {
          let partsArr;
          if (selectedChildIndex !== null) {
            partsArr = machines[selectedParentIndex].children[selectedChildIndex].parts;
          } else {
            partsArr = machines[selectedParentIndex].parts;
          }
          if (!partsArr) return;
          const moved = partsArr.splice(from, 1)[0];
          partsArr.splice(to, 0, moved);
          selectedPartIndex = to;
          renderPartList(partsArr);
          updateButtonsState();
        }
      });
    } else {
      partDiv.removeAttribute("draggable");
    }

    partList.appendChild(partDiv);
  });
}

// =======================
// Button Handlers updated with API calls
// =======================

// Move Button Logic (same, no server sync for now)
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
      if (parent.children && parent.children.length > 0) {
        renderPartList(parent.children.flatMap(c => c.parts || []));
      } else {
        renderPartList(parent.parts || []);
      }
    }
  }
});

// Add Parent Machine
addMachineBtn.addEventListener("click", async () => {
  if (moveModeActive) return;
  const parentName = prompt("Enter Parent Machine Name:");
  if (!parentName) return;

  try {
    const res = await postAPI({ action: "add_machine", name: parentName, parent_id: null });
    machines.push({ id: res.id, name: parentName, parent_id: null, children: [], parts: [] });
    renderMachineList();
    updateButtonsState();
  } catch {}
});

// Add Child Machine Layer
addMachineLayerBtn.addEventListener("click", async () => {
  if (moveModeActive) return;
  if (selectedParentIndex === null) return;

  const childName = prompt("Enter Child Machine Name:");
  if (!childName) return;

  const parent = machines[selectedParentIndex];
  try {
    const res = await postAPI({ action: "add_machine", name: childName, parent_id: parent.id });
    if (!parent.children) parent.children = [];
    parent.children.push({ id: res.id, name: childName, parent_id: parent.id, parts: [] });

    // Clear parent's parts since it now has children
    if (parent.parts && parent.parts.length > 0) {
      parent.parts = [];
    }
    renderMachineList();
    updateButtonsState();
  } catch {}
});

// Add Machine Detail (Part)
addDetailBtn.addEventListener("click", async () => {
  if (moveModeActive) return;
  if (selectedParentIndex === null) return;

  const parent = machines[selectedParentIndex];
  const hasChildren = parent.children && parent.children.length > 0;
  if (hasChildren && selectedChildIndex === null) {
    alert("Select a child machine to add details.");
    return;
  }

  const partNumber = prompt("Enter Part Number:");
  if (!partNumber) return;
  const quantity = prompt("Enter Quantity:");
  if (!quantity || isNaN(quantity)) {
    alert("Quantity must be a valid number");
    return;
  }
  const location = prompt("Enter Location:");
  if (!location) return;

  try {
    const machineId = hasChildren ? parent.children[selectedChildIndex].id : parent.id;
    const res = await postAPI({
      action: "add_part",
      machine_id: machineId,
      partNumber,
      quantity: parseInt(quantity),
      location,
    });
    const newPart = { id: res.id, partNumber, quantity: parseInt(quantity), location };

    if (hasChildren) {
      if (!parent.children[selectedChildIndex].parts) parent.children[selectedChildIndex].parts = [];
      parent.children[selectedChildIndex].parts.push(newPart);
      renderPartList(parent.children[selectedChildIndex].parts);
    } else {
      if (!parent.parts) parent.parts = [];
      parent.parts.push(newPart);
      renderPartList(parent.parts);
    }
    updateButtonsState();
  } catch {}
});

// Delete Button
deleteBtn.addEventListener("click", async () => {
  if (moveModeActive) return;

  // Delete part
  if (selectedPartIndex !== null && selectedParentIndex !== null) {
    let partsArr;
    if (selectedChildIndex !== null) {
      partsArr = machines[selectedParentIndex].children[selectedChildIndex].parts;
    } else {
      partsArr = machines[selectedParentIndex].parts;
    }
    if (!partsArr || partsArr.length === 0) return;

    const confirmPart = confirm("Delete this machine detail?");
    if (!confirmPart) return;

    try {
      const part = partsArr[selectedPartIndex];
      await postAPI({ action: "delete_part", id: part.id });
      partsArr.splice(selectedPartIndex, 1);
      selectedPartIndex = null;
      renderPartList(partsArr);
      deleteBtn.classList.add("disabled");
      editBtn.classList.add("disabled");
      updateButtonsState();
    } catch {}
    return;
  }

  // Delete machine
  if (selectedParentIndex !== null) {
    let confirmMachine = false;
    let machineId;
    if (selectedChildIndex !== null) {
      const child = machines[selectedParentIndex].children[selectedChildIndex];
      confirmMachine = confirm(`Delete child machine "${child.name}"?`);
      machineId = child.id;
    } else {
      const parent = machines[selectedParentIndex];
      confirmMachine = confirm(`Delete parent machine "${parent.name}" and all its children?`);
      machineId = parent.id;
    }
    if (!confirmMachine) return;

    try {
      await postAPI({ action: "delete_machine", id: machineId });

      if (selectedChildIndex !== null) {
        machines[selectedParentIndex].children.splice(selectedChildIndex, 1);
        selectedChildIndex = null;
      } else {
        machines.splice(selectedParentIndex, 1);
        selectedParentIndex = null;
      }

      selectedPartIndex = null;
      renderMachineList();
      partList.innerHTML = "<p>No machine selected.</p>";
      deleteBtn.classList.add("disabled");
      editBtn.classList.add("disabled");
      updateButtonsState();
    } catch {}
  }
});

// Edit Button
editBtn.addEventListener("click", async () => {
  if (moveModeActive) return;

  // Edit part
  if (selectedPartIndex !== null && selectedParentIndex !== null) {
    let partsArr;
    if (selectedChildIndex !== null) {
      partsArr = machines[selectedParentIndex].children[selectedChildIndex].parts;
    } else {
      partsArr = machines[selectedParentIndex].parts;
    }
    if (!partsArr || partsArr.length === 0) return;

    const part = partsArr[selectedPartIndex];

    const newPartNumber = prompt("Edit Part Number:", part.partNumber);
    if (!newPartNumber) return;
    const newQuantity = prompt("Edit Quantity:", part.quantity);
    if (!newQuantity || isNaN(newQuantity)) {
      alert("Quantity must be a valid number");
      return;
    }
    const newLocation = prompt("Edit Location:", part.location);
    if (!newLocation) return;

    try {
      await postAPI({
        action: "edit_part",
        id: part.id,
        partNumber: newPartNumber,
        quantity: parseInt(newQuantity),
        location: newLocation,
      });
      part.partNumber = newPartNumber;
      part.quantity = parseInt(newQuantity);
      part.location = newLocation;

      renderPartList(partsArr);
    } catch {}
    return;
  }

  // Edit machine
  if (selectedParentIndex !== null) {
    if (selectedChildIndex !== null) {
      const child = machines[selectedParentIndex].children[selectedChildIndex];
      const newName = prompt("Edit Child Machine Name:", child.name);
      if (!newName) return;
      try {
        await postAPI({ action: "edit_machine", id: child.id, name: newName });
        child.name = newName;
        renderMachineList();
      } catch {}
    } else {
      const parent = machines[selectedParentIndex];
      const newName = prompt("Edit Parent Machine Name:", parent.name);
      if (!newName) return;
      try {
        await postAPI({ action: "edit_machine", id: parent.id, name: newName });
        parent.name = newName;
        renderMachineList();
      } catch {}
    }
  }
});
