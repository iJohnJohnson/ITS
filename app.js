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

  // Hotkeys listener updated with Ctrl+Shift for Add buttons
  document.addEventListener("keydown", (e) => {
    // Delete key - Delete button
    if (e.key === "Delete") {
      e.preventDefault();
      if (!deleteBtn.classList.contains("disabled")) {
        deleteBtn.click();
      }
    }

    // Move - Ctrl + M
    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "m") {
      e.preventDefault();
      if (!moveBtn.classList.contains("disabled")) {
        moveBtn.click();
      }
    }

    // Edit - Ctrl + E
    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      if (!editBtn.classList.contains("disabled")) {
        editBtn.click();
      }
    }

    // Add Machine - Ctrl + Shift + M
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
      e.preventDefault();
      if (!addMachineBtn.classList.contains("disabled")) {
        addMachineBtn.click();
      }
    }

    // Add Machine Layer - Ctrl + Shift + L
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      if (!addMachineLayerBtn.classList.contains("disabled")) {
        addMachineLayerBtn.click();
      }
    }

    // Add Machine Detail - Ctrl + Shift + D
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      if (!addDetailBtn.classList.contains("disabled")) {
        addDetailBtn.click();
      }
    }

    // Toggle dark mode Ctrl + D (original)
    if (e.ctrlKey && e.key.toLowerCase() === "d" && !e.shiftKey) {
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

// =======================
// Update Buttons Enable/Disable & State
// =======================
function updateButtonsState() {
  if (selectedParentIndex === null) {
    // Nothing selected
    deleteBtn.classList.add("disabled");
    addMachineLayerBtn.classList.add("disabled");
    addDetailBtn.classList.add("disabled");
    editBtn.classList.add("disabled");
  } else if (selectedChildIndex === null) {
    // Parent selected
    const parent = machines[selectedParentIndex];
    deleteBtn.classList.remove("disabled");
    addMachineLayerBtn.classList.remove("disabled");

    // If parent has children, disable add detail for parent
    const isParent = parent.children && parent.children.length > 0;
    addDetailBtn.classList.toggle("disabled", isParent);

    editBtn.classList.remove("disabled");
  } else {
    // Child selected
    deleteBtn.classList.remove("disabled");
    addMachineLayerBtn.classList.add("disabled");
    addDetailBtn.classList.remove("disabled");
    editBtn.classList.remove("disabled");
  }

  if (!moveModeActive) {
    moveBtn.classList.remove("disabled");
  }
}

// =======================
// Render Machine List (Parent > Child hierarchy)
// =======================
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

      // If parent has children, show combined children parts in right container
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
          // On reorder, render parts for the moved parent (children combined if any)
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

    // Render children indented under parent
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
          childDiv.addEventListener("dragover", (e) => { e.preventDefault(); childDiv.classList.add("drag-over"); });
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

// =======================
// Render Parts List (Right Container)
// =======================
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
      partDiv.addEventListener("dragover", (e) => { e.preventDefault(); partDiv.classList.add("drag-over"); });
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
// Move Button Logic
// =======================
moveBtn.addEventListener("click", () => {
  moveModeActive = !moveModeActive;
  moveBtn.classList.toggle("active", moveModeActive);

  // When move mode active disable other buttons except moveBtn itself
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
      // Show combined children parts if parent has children, else parent parts
      const parent = machines[selectedParentIndex];
      if (parent.children && parent.children.length > 0) {
        renderPartList(parent.children.flatMap(c => c.parts || []));
      } else {
        renderPartList(parent.parts || []);
      }
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

  const parent = machines[selectedParentIndex];
  if (!parent.children) parent.children = [];
  parent.children.push({ name: childName, parts: [] });

  // When a parent gets a child, clear its own parts to enforce no parent parts
  if (parent.parts && parent.parts.length > 0) {
    parent.parts = [];
  }

  renderMachineList();
  updateButtonsState();
});

// =======================
// Add Machine Detail (Part) to selected machine (child only if parent has children)
// =======================
addDetailBtn.addEventListener("click", () => {
  if (moveModeActive) return;
  if (selectedParentIndex === null) return;

  const parent = machines[selectedParentIndex];
  const hasChildren = parent.children && parent.children.length > 0;

  // If parent has children, parts can only be added to child (selectedChildIndex)
  if (hasChildren && selectedChildIndex === null) {
    alert("Select a child machine to add details.");
    return;
  }

  const partNumber = prompt("Enter Part Number:");
  if (!partNumber) return;
  const quantity = prompt("Enter Quantity:");
  if (!quantity) return;
  const location = prompt("Enter Location:");
  if (!location) return;

  if (hasChildren) {
    const child = parent.children[selectedChildIndex];
    if (!child.parts) child.parts = [];
    child.parts.push({ partNumber, quantity, location });
    renderPartList(child.parts);
  } else {
    if (!parent.parts) parent.parts = [];
    parent.parts.push({ partNumber, quantity, location });
    renderPartList(parent.parts);
  }
  updateButtonsState();
});

// =======================
// Delete Button Logic
// =======================
deleteBtn.addEventListener("click", () => {
  if (moveModeActive) return;

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

      // After deleting last child, enable add detail for parent
      const parent = machines[selectedParentIndex];
      if (!parent.children || parent.children.length === 0) {
        parent.children = [];
      }

      // Show parent's parts or empty if none
      renderPartList(parent.parts || []);

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
      // Edit child machine name
      const child = machines[selectedParentIndex].children[selectedChildIndex];
      const newName = prompt("Edit Child Machine Name:", child.name);
      if (!newName) return;

      child.name = newName;
      renderMachineList();
      updateButtonsState();
    } else {
      // Edit parent machine name
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
document.body.addEventListener("click", (e) => {
  if (!machineList.contains(e.target) && !partList.contains(e.target)) {
    lastSelectedParentIndex = selectedParentIndex;
    lastSelectedChildIndex = selectedChildIndex;
    lastSelectedPartIndex = selectedPartIndex;

    selectedParentIndex = null;
    selectedChildIndex = null;
    selectedPartIndex = null;

    document.querySelectorAll("#machine-list .machine-card").forEach(card => card.classList.remove("selected", "last-selected"));
    document.querySelectorAll("#part-list .machine-card").forEach(card => card.classList.remove("selected", "last-selected"));

    partList.innerHTML = "<p>No machine selected.</p>";

    updateButtonsState();
  }
});

// =======================
// Initialize with sample data (optional, can remove)
// =======================
machines.push({
  name: "Parent Machine A",
  children: [
    { name: "Child A1", parts: [{ partNumber: "P100", quantity: 10, location: "Loc1" }] },
    { name: "Child A2", parts: [{ partNumber: "P101", quantity: 5, location: "Loc2" }] }
  ],
  parts: []
});
machines.push({
  name: "Parent Machine B",
  children: [],
  parts: [{ partNumber: "P200", quantity: 3, location: "Loc3" }]
});

renderMachineList();
partList.innerHTML = "<p>No machine selected.</p>";
updateButtonsState();
