// Initialize Dexie.js database
const db = new Dexie("InventoryDB");

db.version(1).stores({
  items: "++id, partNumber, quantity, location"
});

// Add a new item with basic validation
async function addItem(partNumber, quantity, location) {
  if (!partNumber || isNaN(quantity) || !location) {
    console.warn("Invalid item data — cannot add.");
    return;
  }
  await db.items.add({ partNumber, quantity, location });
  displayItems();
}

// Get all items as an array
async function getItems() {
  return await db.items.toArray();
}

// Delete item by ID
async function deleteItem(id) {
  await db.items.delete(id);
  displayItems();
}

// Update existing item
async function updateItem(id, partNumber, quantity, location) {
  if (!partNumber || isNaN(quantity) || !location) {
    console.warn("Invalid item data — cannot update.");
    return;
  }
  await db.items.update(id, { partNumber, quantity, location });
  displayItems();
}

// Render all items to the list
async function displayItems() {
  const list = document.getElementById("inventory-list");
  list.innerHTML = "";

  const items = await getItems();
  console.log("Current items:", items);

  if (items.length === 0) {
    list.innerHTML = "<li><em>No items in inventory.</em></li>";
    return;
  }

  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      #${item.id}: <strong>${item.partNumber}</strong> - ${item.quantity} at ${item.location}
      <button onclick="editItem(${item.id})">✏️</button>
      <button onclick="confirmDelete(${item.id})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

function confirmDelete(id) {
  const confirmed = confirm("Are you sure you want to delete this item?");
  if (confirmed) {
    deleteItem(id);
  }
}


// Call displayItems() on first load
displayItems();
