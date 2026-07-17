// Injected at deploy time from GitHub Secret SHEETS_SCRIPT_URL — do not hardcode here.
const SHEETS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL";

const locations = [
  { name: "Goregaon (East)",  contact: "Contact representative" },
  { name: "Mahesh Nagar",     contact: "Contact representative" },
  { name: "Mangalkarni",      contact: "Contact representative" },
  { name: "Bangard Nagar",    contact: "Contact representative" },
  { name: "Jogeshwari",       contact: "Contact representative" },
];

const catalog = {
  sattu: [
    { id: "chana_satu_kolkata", name: "Chana Satu (Kolkata)", unit: "per kg",            img: "img/chana-satu.svg" },
    { id: "gehu_satu",          name: "Gehu Satu",            unit: "per kg",            img: "img/gehu-satu.svg"  },
    { id: "chawal_satu",        name: "Chawal Satu",          unit: "per kg",            img: "img/chawal-satu.svg"},
    { id: "mumbai_dalia",       name: "Mumbai Dalia",         unit: "per kg",            img: "img/mumbai-dalia.svg"},
  ],
  mithai: [
    { id: "pisi_sugar", name: "Pisi Sugar", unit: "per kg",  img: "img/pisi-sugar.svg" },
    { id: "bura_sugar", name: "Bura Sugar", unit: "per kg",  img: "img/bura-sugar.svg" },
    { id: "rasgulla",   name: "Rasgulla",   unit: "per tin", img: "img/rasgulla.svg"   },
  ],
  special: [
    { id: "kesar",           name: "Kesar",           unit: "1 gm / packet",     img: "img/kesar.svg"       },
    { id: "moong_papad",     name: "Moong Papad",     unit: "800 gm / packet",   img: "img/moong-papad.svg" },
    { id: "chana_papad",     name: "Chana Papad",     unit: "400 gm / packet",   img: "img/chana-papad.svg" },
    { id: "bhujia_bikaneri", name: "Bhujia Bikaneri", unit: "1 kg / packet",     img: "img/bhujia.svg"      },
    { id: "mehendi",         name: "Mehendi",         unit: "250 gm / packet",   img: "img/mehendi.svg"     },
    { id: "varak",           name: "Varak",           unit: "10 pieces / packet", img: "img/varak.svg"      },
  ],
};

const categoryMeta = {
  sattu:   { chipLabel: "SATTU & GRAINS", chipClass: "cat-sattu"   },
  mithai:  { chipLabel: "SUGAR & SWEETS", chipClass: "cat-mithai"  },
  special: { chipLabel: "SPECIALTY",      chipClass: "cat-special" },
};

let cart = {};

function initPage() {
  renderLocations();
  renderSection("sattu",   "sattu-grid");
  renderSection("mithai",  "mithai-grid");
  renderSection("special", "special-grid");
}

function renderLocations() {
  const container = document.getElementById("location-tags");
  locations.forEach(loc => {
    const tag = document.createElement("div");
    tag.className = "location-tag";
    tag.innerHTML = `<strong>${loc.name}</strong><span>${loc.contact}</span>`;
    container.appendChild(tag);
  });
}

function renderSection(section, gridId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  catalog[section].forEach(prod => grid.appendChild(createProductCard(prod, section)));
}

function createProductCard(prod, section) {
  const meta = categoryMeta[section];
  const card = document.createElement("div");
  card.className = "product-card-compact";
  card.innerHTML = `
    <span class="category-chip ${meta.chipClass}">${meta.chipLabel}</span>
    <div class="product-image-area">
      <img src="${prod.img}" alt="${prod.name}" class="product-img">
    </div>
    <div class="product-name-compact">${prod.name}</div>
    <div class="product-unit-info">${prod.unit}</div>
    <div class="qty-counter">
      <button class="qty-btn" type="button" onclick="updateQty('${prod.id}', -1)">−</button>
      <input type="number" class="qty-input" id="qty_${prod.id}" value="0" min="0"
             onchange="setQty('${prod.id}', this.value)">
      <button class="qty-btn" type="button" onclick="updateQty('${prod.id}', 1)">+</button>
    </div>
  `;
  return card;
}

function updateQty(prodId, delta) {
  const newVal = Math.max(0, (cart[prodId] || 0) + delta);
  cart[prodId] = newVal;
  const input = document.getElementById(`qty_${prodId}`);
  if (input) input.value = newVal;
  updateSidebar();
}

function setQty(prodId, rawValue) {
  cart[prodId] = Math.max(0, parseInt(rawValue) || 0);
  updateSidebar();
}

function allProducts() {
  return [...catalog.sattu, ...catalog.mithai, ...catalog.special];
}

function updateSidebar() {
  const container = document.getElementById("summary-items-container");
  container.innerHTML = "";
  let totalUnits = 0;
  let hasItems   = false;

  Object.keys(cart).forEach(prodId => {
    const qty = cart[prodId];
    if (qty <= 0) return;
    hasItems = true;
    totalUnits += qty;

    const prod = allProducts().find(p => p.id === prodId);
    if (!prod) return;

    const row = document.createElement("div");
    row.className = "summary-item-row";
    row.innerHTML = `
      <div class="summary-item-details">
        <span class="summary-item-name">${prod.name}</span>
        <span class="summary-item-sub">${prod.unit}</span>
      </div>
      <span class="summary-item-cost" style="color:var(--secondary-color);">× ${qty}</span>
    `;
    container.appendChild(row);
  });

  if (!hasItems) {
    container.innerHTML = `<p style="color:var(--text-light); text-align:center; margin-top:20px; font-size:0.88rem;">No items selected yet.</p>`;
  }

  document.getElementById("total-units").innerText  = totalUnits;
  document.getElementById("badge-count").innerText  = totalUnits;
}

function openFormModal() {
  const orderPlace = document.getElementById("order-place").value.trim();
  const custName   = document.getElementById("customer-name").value.trim();
  const custMobile = document.getElementById("customer-mobile").value.trim();

  if (!orderPlace) {
    alert("Please select a collection point.");
    document.getElementById("order-place").focus();
    return;
  }
  if (!custName) {
    alert("Please enter your Full Name.");
    document.getElementById("customer-name").focus();
    return;
  }
  if (!custMobile || !/^\d{10}$/.test(custMobile)) {
    alert("Please enter a valid 10-digit Mobile Number.");
    document.getElementById("customer-mobile").focus();
    return;
  }

  // Populate customer details
  document.getElementById("co-location").textContent = orderPlace;
  document.getElementById("co-name").textContent     = custName;
  document.getElementById("co-mobile").textContent   = "+91 " + custMobile;

  // Populate items table
  const selected = Object.keys(cart).filter(id => cart[id] > 0);
  const tbody     = document.getElementById("confirm-items-body");
  const emptyMsg  = document.getElementById("confirm-empty-msg");
  const table     = document.getElementById("confirm-items-table");

  tbody.innerHTML = "";

  if (selected.length === 0) {
    table.style.display    = "none";
    emptyMsg.style.display = "block";
    document.getElementById("confirm-order-btn").disabled = true;
  } else {
    table.style.display    = "";
    emptyMsg.style.display = "none";
    document.getElementById("confirm-order-btn").disabled = false;

    let total = 0;
    selected.forEach(id => {
      const qty  = cart[id];
      const prod = allProducts().find(p => p.id === id);
      if (!prod) return;
      total += qty;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align:left;">${prod.name}</td>
        <td style="text-align:center; color:var(--text-light);">${prod.unit}</td>
        <td style="text-align:center; font-weight:700; color:var(--secondary-color);">${qty}</td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById("confirm-total").textContent = total;
  }

  showOrderReview();
  document.getElementById("form-modal").style.display = "flex";
}

function showOrderReview() {
  document.getElementById("order-review-state").style.display    = "block";
  document.getElementById("order-submitting-state").style.display = "none";
  document.getElementById("order-success-state").style.display   = "none";
  document.getElementById("order-error-state").style.display     = "none";
  document.getElementById("modal-close-btn").style.display       = "block";
}

async function confirmOrder() {
  const orderPlace = document.getElementById("order-place").value.trim();
  const custName   = document.getElementById("customer-name").value.trim();
  const custMobile = document.getElementById("customer-mobile").value.trim();

  const selected = Object.keys(cart).filter(id => cart[id] > 0);
  const items    = selected.map(id => {
    const prod = allProducts().find(p => p.id === id);
    return { name: prod.name, unit: prod.unit, qty: cart[id] };
  });

  const orderId = "MPM-" + Date.now().toString(36).toUpperCase();

  // Show submitting state
  document.getElementById("order-review-state").style.display    = "none";
  document.getElementById("order-submitting-state").style.display = "block";
  document.getElementById("modal-close-btn").style.display       = "none";

  const payload = {
    orderId,
    collectionPoint: orderPlace,
    name:            custName,
    mobile:          "+91" + custMobile,
    items,
    totalUnits:      items.reduce((s, i) => s + i.qty, 0),
    timestamp:       new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  };

  try {
    const response = await fetch(SHEETS_SCRIPT_URL, {
      method:   "POST",
      redirect: "follow",
      headers:  { "Content-Type": "application/json" },
      body:     JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === "duplicate") {
      document.getElementById("error-msg-text").textContent =
        "An order has already been placed for this mobile number" +
        (result.existingOrderId ? " (Order ID: " + result.existingOrderId + ")." : ".");
      document.getElementById("order-submitting-state").style.display = "none";
      document.getElementById("order-error-state").style.display      = "block";
      document.getElementById("modal-close-btn").style.display        = "block";
      return;
    }

    if (result.status !== "success") {
      throw new Error(result.message || "Unexpected error from server.");
    }

    document.getElementById("success-order-id").textContent = orderId;
    document.getElementById("order-submitting-state").style.display = "none";
    document.getElementById("order-success-state").style.display    = "block";

    // Reset cart after success
    cart = {};
    document.querySelectorAll(".qty-input").forEach(el => { el.value = 0; });
    updateSidebar();

  } catch (err) {
    console.error("confirmOrder:", err);
    document.getElementById("error-msg-text").textContent = err.message || "Network error. Please try again.";
    document.getElementById("order-submitting-state").style.display = "none";
    document.getElementById("order-error-state").style.display      = "block";
    document.getElementById("modal-close-btn").style.display        = "block";
  }
}

function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
  showOrderReview();
}

function resetAll() {
  if (!confirm("Clear all selected items?")) return;
  cart = {};
  document.querySelectorAll(".qty-input").forEach(el => { el.value = 0; });
  updateSidebar();
}
