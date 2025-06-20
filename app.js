let editingItemId = null; // null = add mode, number = edit mode

document.getElementById("item-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const partNumber = document.getElementById("partNumber").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const location = document.getElementById("location").value;

  if (editingItemId === null) {
    // ADD mode
    await addItem(partNumber, quantity, location);
  } else {
    // UPDATE mode
    await updateItem(editingItemId, partNumber, quantity, location);
    editingItemId = null;
    this.querySelector("button").textContent = "Add Item";
  }

  this.reset();
});

function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText, decodedResult) => {
      document.getElementById("scan-result").textContent = `Scanned: ${decodedText}`;
      document.getElementById("partNumber").value = decodedText;
      html5QrCode.stop(); // stop after one scan
    },
    error => {
      // optional: handle errors
    }
  );
}

async function editItem(id) {
  const item = await db.items.get(id);
  if (!item) return;

  document.getElementById("partNumber").value = item.partNumber;
  document.getElementById("quantity").value = item.quantity;
  document.getElementById("location").value = item.location;

  editingItemId = id;
  document.querySelector("#item-form button").textContent = "Update Item";
}

const themeToggleBtn = document.getElementById("theme-toggle");

// Load saved theme from localStorage or default to light
const savedTheme = localStorage.getItem("theme") || "light";
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
  themeToggleBtn.textContent = "🌙";
} else {
  themeToggleBtn.textContent = "🌞";
}

// Toggle theme on button click
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  if (document.body.classList.contains("dark-theme")) {
    themeToggleBtn.textContent = "🌙"; // moon icon
    localStorage.setItem("theme", "dark");
  } else {
    themeToggleBtn.textContent = "🌞"; // sun icon
    localStorage.setItem("theme", "light");
  }
});

