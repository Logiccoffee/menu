import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";
import {getJSON} from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";

onClick("buttonsimpaninfouser", saveUserInfo);
onClick("buttonbatalinfouser", closeUserModal);

document.addEventListener("DOMContentLoaded", function () {
  checkCookies();
  fetch("./data/menu.json")
    .then((response) => response.json())
    .then((data) => renderMenu(data))
    .catch((error) => console.error("Error loading menu:", error));
});

// Periksa apakah cookie login tersedia
const loginToken = getCookie("login");
if (!loginToken) {
    // Jika tidak ada cookie, arahkan ke halaman login
    alert("Anda belum login. Silakan login terlebih dahulu.");
    window.location.href = "/login";
} else {
    // Ambil data pengguna melalui API
    getJSON(
        "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/user", // Endpoint API
        { 
            "login": loginToken // Hanya header login
        },
        handleUserResponse // Fungsi callback untuk menangani respons
    );
}

// Fungsi untuk menangani respons dari API
function handleUserResponse(result) {
  if (result.status === 200 && result.data) {
      // Jika respons berhasil, tampilkan data pengguna
      const userData = result.data;

      // Tampilkan data pengguna pada elemen HTML
      setInner("user-photo", <img src="${userData.profpic}" alt="Foto Profil" class="user-photo" />);
      setInner("user-name", userData.name);
      setInner("user-phone", userData.phonenumber);

      console.log("Data pengguna berhasil dimuat:", userData);
  } else {
      // Jika gagal, tampilkan pesan kesalahan
      console.error("Gagal memuat data pengguna:", result.message || "Unknown error");
      alert("Gagal memuat informasi pengguna. Silakan coba lagi.");
    }
}

// Menambahkan kode untuk menampilkan nama pengguna setelah login
// const userName = getCookie("name");
// if (userName) {
//   // Menampilkan nama pengguna di elemen yang sesuai
//   document.getElementById("userName").textContent = userName;
// }

// Fungsi untuk mengambil dan menampilkan nama pengguna dari /data/user
// async function displayUserName() {
//   try {
//       // Mendapatkan data pengguna dari endpoint /data/user
//       const userData = await getJSON(" https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/user ");

//       // Memeriksa apakah data pengguna memiliki properti "name"
//       if (userData && userData.name) {
//           // Mengambil kata pertama dari nama pengguna
//           const firstName = userData.name.split(" ")[0];
          
//           // Menampilkan kata pertama di elemen dengan ID "userName"
//           document.getElementById("userName").textContent = firstName;
//       } else {
//           console.error("Properti 'name' tidak ditemukan pada data pengguna.");
//       }
//   } catch (error) {
//       console.error("Gagal mengambil data pengguna:", error);
//   }
// }

// Memanggil fungsi untuk menampilkan nama pengguna
displayUserName();

// function checkCookies() {
//   const userName = Cookies.get('name'); // Menggunakan jscroot untuk mendapatkan cookie
//   const userWhatsapp = Cookies.get('whatsapp');
//   const userNote = Cookies.get('note'); // Menggunakan key 'note' untuk catatan

//   // Tampilkan modal jika data tidak lengkap
//   document.getElementById("userModal").style.display =
//     userName && userWhatsapp && userNote ? "none" : "flex";

//   document.getElementById("modalTitle").textContent = "Masukkan Informasi Anda";
//   document.getElementById("buttonbatalinfouser").style.display = "none"; // Sembunyikan tombol "Batal" secara default
// }

// function saveUserInfo() {
//   const name = document.getElementById("name").value;
//   const whatsapp = document.getElementById("whatsapp").value;
//   const note = document.getElementById("note").value; // Mengambil nilai dari input "note"

//   if (name && whatsapp && note) {
//     // Simpan data menggunakan jscroot
//     Cookies.set('name', name, { expires: 365 });
//     Cookies.set('whatsapp', whatsapp, { expires: 365 });
//     Cookies.set('note', note, { expires: 365 });
//     closeUserModal();
//   } else {
//     alert("Silakan masukkan semua informasi.");
//   }
// }

// function closeUserModal() {
//   document.getElementById("userModal").style.display = "none";
// }

// // Panggil `checkCookies` saat halaman dimuat
// document.addEventListener("DOMContentLoaded", checkCookies);



function checkCookies() {
  const userName = getCookie("name");
  const userWhatsapp = getCookie("whatsapp");
  const userAddress = getCookie("address");

  document.getElementById("userModal").style.display =
    userName && userWhatsapp && userAddress ? "none" : "flex";
  document.getElementById("modalTitle").textContent = "Masukkan Informasi Anda";
  document.getElementById("buttonbatalinfouser").style.display = "none"; 
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
    document.getElementById("note").value = getCookie("note") || "";
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
  const userNote = getCookie("note");
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
  )}\n\nTotal: Rp ${total.toLocaleString()}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nCatatan: ${userNote}`;
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
    const userNote = getCookie("note");

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
      )}\n\nTotal: Rp ${total.toLocaleString()}\n\n${paymentInfo}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nCatatan: ${userNote}`;
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
        note: userNote,
      },
      payment: paymentInfo,
      paymentMethod: paymentMethod,
    };

    postJSON(
      "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/order/" +
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
