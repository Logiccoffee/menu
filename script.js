import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";

onClick("buttonsimpaninfouser", saveUserInfo);
onClick("buttonbatalinfouser", closeUserModal);

document.addEventListener("DOMContentLoaded", function () {
  checkCookies();
  fetch("./data/menu.json")
    .then((response) => response.json())
    .then((data) => renderMenu(data))
    .catch((error) => console.error("Error loading menu:", error));
});

function checkCookies() {
  const userName = getCookie("name");
  const userWhatsapp = getCookie("whatsapp");
  const userAddress = getCookie("address");

  document.getElementById("userModal").style.display =
    userName && userWhatsapp && userAddress ? "none" : "flex";
  document.getElementById("modalTitle").textContent = "Masukkan Informasi Anda";
  document.getElementById("buttonbatalinfouser").style.display = "none"; // Hide "Batal" initially
}

function saveUserInfo() {
  const name = document.getElementById("name").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const address = document.getElementById("address").value;

  if (name && whatsapp && address) {
    setCookie("name", name, 365);
    setCookie("whatsapp", whatsapp, 365);
    setCookie("address", address, 365);
    closeUserModal();
  } else {
    alert("Silakan masukkan semua informasi.");
  }
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
}

function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let c of ca) {
    while (c.charAt(0) == " ") c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length);
  }
  return "";
}

// Open modal with edit title when editing information
document
  .getElementById("editUserInfoButton")
  .addEventListener("click", function () {
    document.getElementById("name").value = getCookie("name") || "";
    document.getElementById("whatsapp").value = getCookie("whatsapp") || "";
    document.getElementById("address").value = getCookie("address") || "";
    document.getElementById("modalTitle").textContent = "Ubah Informasi Anda";
    document.getElementById("userModal").style.display = "flex";
    document.getElementById("buttonbatalinfouser").style.display =
      "inline-block"; // Show "Batal" button
  });

// Close modal function
function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
  document.getElementById("modalTitle").textContent = "Masukkan Informasi Anda";
  document.getElementById("buttonbatalinfouser").style.display = "none"; // Hide "Batal" button after closing
}

// Fungsi renderMenu, showQuantityControls, changeQuantity, calculateTotal, dll.

function renderMenu(menuItems) {
  const menuGrid = document.getElementById("menuGrid");
  menuItems.forEach((item) => {
    const menuItem = document.createElement("div");
    menuItem.className = "menu-item";
    menuItem.innerHTML = `
            <img src="./menu/${item.image}" alt="${
      item.name
    }" class="menu-image">
            <div class="menu-footer">
                <h3>${item.name}</h3>
                <p class="price">Rp ${item.price.toLocaleString()}</p>
                <button id="add-to-cart-${
                  item.id
                }" class="add-to-cart" onclick="showQuantityControls(${
      item.id
    })">Tambah Ke Pesanan</button>
                <div id="quantity-controls-${
                  item.id
                }" class="quantity-controls hidden">
                    <button type="button" class="qty-btn" onclick="changeQuantity('qty${
                      item.id
                    }', ${item.price}, -1, ${item.id})">-</button>
                    <input type="number" id="qty${item.id}" name="qty${
      item.id
    }" value="0" min="0" data-price="${item.price}" data-name="${
      item.name
    }" onchange="calculateTotal()">
                    <button type="button" class="qty-btn" onclick="changeQuantity('qty${
                      item.id
                    }', ${item.price}, 1, ${item.id})">+</button>
                </div>
            </div>
        `;
    menuGrid.appendChild(menuItem);
  });
}

// Fungsi untuk menampilkan kontrol kuantitas dan menyembunyikan tombol "Tambah Ke Pesanan"
function showQuantityControls(itemId) {
  // Sembunyikan tombol "Tambah Ke Pesanan"
  document.getElementById(`add-to-cart-${itemId}`).classList.add("hidden");

  // Tampilkan kontrol kuantitas dan set jumlah awal ke 1
  const quantityControls = document.getElementById(
    `quantity-controls-${itemId}`
  );
  // quantityControls.style.visibility = "visible";
  quantityControls.style.display = "flex";
  document.getElementById(`qty${itemId}`).value = 1;

  calculateTotal(); // Update total dengan jumlah awal 1
}

window.showQuantityControls = showQuantityControls;

// Fungsi untuk mengubah jumlah kuantitas dan menampilkan atau menyembunyikan kontrol kuantitas
window.changeQuantity = function (id, price, delta, itemId) {
  const qtyInput = document.getElementById(id);
  let currentValue = parseInt(qtyInput.value) || 0;
  const newQuantity = currentValue + delta;

  // Update jumlah jika lebih dari 0, atau sembunyikan kontrol jika 0
  if (newQuantity > 0) {
    qtyInput.value = newQuantity;
  } else {
    qtyInput.value = 0;
    document.getElementById(`quantity-controls-${itemId}`).style.display =
      "none";
    document.getElementById(`add-to-cart-${itemId}`).classList.remove("hidden"); // Tampilkan kembali tombol "Tambah Ke Pesanan"
  }

  calculateTotal(); // Update total setiap kali kuantitas berubah
};

// Global variable to store queue information for each checkout process
let currentQueueData = null;

function getDailyQueueNumber() {
  const currentDate = new Date();
  const companyCode = "LGC";

  // Format the date as YYYYMMDDHHMM
  const formattedDate =
    currentDate.getFullYear().toString() +
    (currentDate.getMonth() + 1).toString().padStart(2, "0") +
    currentDate.getDate().toString().padStart(2, "0") +
    currentDate.getHours().toString().padStart(2, "0") +
    currentDate.getMinutes().toString().padStart(2, "0");

  // Check if the last saved date is different from today, and reset if so
  const lastQueueDate = localStorage.getItem("lastQueueDate");
  if (lastQueueDate !== currentDate.toLocaleDateString()) {
    localStorage.setItem("lastQueueDate", currentDate.toLocaleDateString());
    localStorage.setItem("dailyQueueCounter", "1"); // Reset queue number to 1 for a new day
  }

  // Get the latest queue number, increment it by 1, then store it again
  const currentQueueNumber = parseInt(
    localStorage.getItem("dailyQueueCounter") || "0"
  );
  const newQueueNumber = currentQueueNumber + 1;

  // Immediately save the new queue number after calculating it
  localStorage.setItem("dailyQueueCounter", newQueueNumber.toString());

  // Generate the unique order number
  const uniqueOrderNumber = `${companyCode}${formattedDate}${newQueueNumber
    .toString()
    .padStart(3, "0")}`;

  return { queueNumber: newQueueNumber, uniqueOrderNumber };
}

function initializeQueueData() {
  if (!currentQueueData) {
    currentQueueData = getDailyQueueNumber(); // Fetch and store queue data once
  }
}

function calculateTotal() {
  initializeQueueData(); // Ensure we get queue data only once

  const inputs = document.querySelectorAll('input[type="number"]');
  let total = 0;
  let totalItems = 0;
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";

  inputs.forEach((input) => {
    const quantity = parseInt(input.value);
    const price = parseInt(input.getAttribute("data-price"));
    const name = input.getAttribute("data-name");

    if (quantity > 0) {
      total += quantity * price;
      totalItems += quantity;

      const menuItem = document.createElement("div");
      menuItem.classList.add("order-item");

      const menuName = document.createElement("div");
      menuName.classList.add("order-menu");
      menuName.innerText = name;

      const menuQuantity = document.createElement("div");
      menuQuantity.classList.add("order-quantity");
      menuQuantity.innerText = `x${quantity}`;

      const menuPrice = document.createElement("div");
      menuPrice.classList.add("order-price");
      menuPrice.innerText = `Rp ${(quantity * price).toLocaleString()}`;

      menuItem.append(menuName, menuQuantity, menuPrice);
      orderList.appendChild(menuItem);
    }
  });

  document.getElementById("totalPrice").innerText = total.toLocaleString();
  document.getElementById("totalItems").innerText = totalItems;
  document.querySelector(".total-summary .total-price span").innerText =
    total.toLocaleString();

  // Update WhatsApp link with queue data
  const { queueNumber, uniqueOrderNumber } = currentQueueData;
  const userName = getCookie("name");
  const userWhatsapp = getCookie("whatsapp");
  const userAddress = getCookie("address");
  const orders = Array.from(inputs)
    .filter((input) => parseInt(input.value) > 0)
    .map(
      (input) =>
        `${input.getAttribute("data-name")} x${input.value} - Rp ${(
          input.value * input.getAttribute("data-price")
        ).toLocaleString()}`
    );

  const message = `Nomor Antrian Anda: ${queueNumber}\nNomor Unik Antrian: ${uniqueOrderNumber}\n\nSaya ingin memesan:\n${orders.join(
    "\n"
  )}\n\nTotal: Rp ${total.toLocaleString()}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
  document.getElementById(
    "whatsappLink"
  ).href = `https://wa.me/6285183104981?text=${encodeURIComponent(message)}`;
}

// WhatsApp event handler
document
  .getElementById("whatsappLink")
  .addEventListener("click", function (event) {
    event.preventDefault();

    initializeQueueData(); // Ensure queue data is only retrieved once
    const { queueNumber, uniqueOrderNumber } = currentQueueData;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const rek =
      "Pembayaran akan dilakukan dengan transfer ke rekening\nBCA 2820321726\nKiki Santi Noviana";
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    const inputs = document.querySelectorAll('input[type="number"]');
    let orders = [];
    let total = 0;

    inputs.forEach((input) => {
      const quantity = parseInt(input.value);
      const price = parseInt(input.getAttribute("data-price"));
      const name = input.getAttribute("data-name");

      if (quantity > 0) {
        total += quantity * price;
        orders.push({ name, quantity, price: quantity * price });
      }
    });

    let paymentInfo =
      paymentMethod === "Transfer"
        ? rek
        : "Pembayaran akan dilakukan dengan metode COD.";

    const message = `${uniqueOrderNumber}\nNo. Antrian: ${queueNumber}\nSaya ingin memesan:\n${orders
      .map(
        (order) =>
          `${order.name} x${
            order.quantity
          } - Rp ${order.price.toLocaleString()}`
      )
      .join(
        "\n"
      )}\n\nTotal: Rp ${total.toLocaleString()}\n\n${paymentInfo}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    const whatsappUrl = `https://wa.me/6285183104981?text=${encodeURIComponent(
      message
    )}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // POST request to API
    const postData = {
      queueNumber: queueNumber,
      uniqueOrderNumber: uniqueOrderNumber,
      orders: orders,
      total: total,
      user: {
        name: userName,
        whatsapp: userWhatsapp,
        address: userAddress,
      },
      payment: paymentInfo,
      paymentMethod: paymentMethod,
    };

    postJSON(
      "https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/order/" +
        getLastPathSegment(),
      "login",
      "",
      postData,
      function (response) {
        console.log("API Response:", response);
      }
    );
  });

function getLastPathSegment() {
  // Ambil pathname dari URL
  let pathname = window.location.pathname;

  // Hapus leading slash dan trailing slash jika ada
  pathname = pathname.replace(/^\/|\/$/g, "");

  // Pisahkan pathname menjadi bagian-bagian
  let parts = pathname.split("/");

  // Ambil bagian terakhir dari URL
  return parts[parts.length - 1];
}
