import {deleteCookie} from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js";
import {getJSON} from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";

// onclick
onClick('buttonsimpaninfouser', saveUserInfo);
onClick("buttonbatalinfouser", closeUserModal);


let currentQueueData = null;

function initializeQueueData() {
    if (!currentQueueData) {
      const lastOrder = null; // Ambil dari backend jika ada
      currentQueueData = getDailyQueueNumber(lastOrder);
    }
  }
  
document.addEventListener("DOMContentLoaded", function () {
  checkCookies();
  fetch("./data/menu.json")
    .then((response) => response.json())
    .then((data) => renderMenu(data))
    .catch((error) => console.error("Error loading menu:", error));
    initializeQueueData();
});

// menampilkan nama user
// cek cookie dengan header login ada ga?
if (getCookie("login") === "") {
    redirect("/");
}

// Ambil data pengguna menggunakan API
getJSON("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/user", "login", getCookie("login"), responseFunction);

function responseFunction(result) {
    try {
        if(result.status === 404) {
            redirect("/register");
            return;
        }

        // cek apakah name tersedia di response
        console.log("Data pengguna:", result.data);

        // get nama lengkap dari API
        const fullName = result.data.name || "Nama Tidak Diketahui";

        // pisahin nama depan(kata pertama)
        const firstName = fullName.split(' ')[0]; //ambil data pertama sebagai nama depan

        // munculin nama depan user di elemen yg sudah disediakan
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
            userNameElement.textContent = firstName;
        }

        // menampilkan data lainnya(untuk debugging)
        console.log("Nama depan yang ditampilkan:", firstName);
    }catch (error) {
        console.error("Terjadi kesalahan saat memproses respons:", error.message);
      }
}

//button simpan
const nameInput = document.getElementById("name");
const whatsappInput = document.getElementById("whatsapp");
const noteInput = document.getElementById("note");

if (nameInput && whatsappInput && noteInput) {
  let name = nameInput.value;
  let whatsapp = whatsappInput.value;
  let note = noteInput.value;

  // Cek validasi dan simpan informasi
} else {
  console.error("Elemen input tidak ditemukan!");
}

function checkCookies() {
  const userName = getCookie("name");
  const userWhatsapp = getCookie("whatsapp");
  const userNote = getCookie("note");

  document.getElementById("userModal").style.display =
    userName && userWhatsapp && userNote ? "none" : "flex";
  document.getElementById("modalTitle").textContent = "Masukkan Informasi Anda";
  document.getElementById("buttonbatalinfouser").style.display = "none"; // Hide "Batal" initially
}

function saveUserInfo() {
  const name = document.getElementById("name").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const note = document.getElementById("note").value;

  if (name && whatsapp && note) {
    setCookie("name", name, 365);
    setCookie("whatsapp", whatsapp, 365);
    setCookie("note", note, 365);
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
  
  function getDailyQueueNumber(lastOrder = null) {
    const currentDate = new Date();
    const companyCode = "LGC";
  
    const formattedDate =
      currentDate.getFullYear().toString() +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      currentDate.getDate().toString().padStart(2, "0") +
      currentDate.getHours().toString().padStart(2, "0") +
      currentDate.getMinutes().toString().padStart(2, "0");
  
    let lastQueueDate = null;
    let currentQueueNumber = 0;
  
    if (lastOrder) {
      lastQueueDate = new Date(lastOrder.orderDate);
      currentQueueNumber = lastOrder.queueNumber;
    }
  
    if (!isSameDay(lastQueueDate, currentDate)) {
      currentQueueNumber = 0; // Reset queue number
    }
  
    const newQueueNumber = currentQueueNumber + 1;
  
    // Ganti nama field menjadi orderNumber
    const orderNumber = `${companyCode}${formattedDate}${newQueueNumber
      .toString()
      .padStart(3, "0")}`;
  
    return { queueNumber: newQueueNumber, orderNumber };
  }
  

//   mau checkout nih
function calculateTotal() {
    initializeQueueData();

  if (!currentQueueData) {
    console.error("currentQueueData gagal diinisialisasi.");
    alert("Terjadi kesalahan saat memproses pesanan.");
    return;
  }

  const { queueNumber, orderNumber } = currentQueueData;
  if (!queueNumber || !orderNumber) {
    console.error("Queue data tidak valid:", currentQueueData);
    alert("Queue data tidak valid. Silakan coba lagi.");
    return;
  }
  
    const paymentMethod = document.getElementById("paymentMethod").value;
    const userName = getCookie("name") || "Guest";
    const userWhatsapp = getCookie("whatsapp") || "Tidak ada nomor";
    const userNote = getCookie("note") || "Catatan kosong";
  
    console.log("Queue Number:", queueNumber);
    console.log("Order Number:", orderNumber);
    console.log("User Info:", { userName, userWhatsapp, userNote });
  
    const postData = {
      orderNumber, // Nama field sesuai DB
      queueNumber,
      orderDate: new Date().toISOString(),
      userInfo: {
        name: userName,
        whatsapp: userWhatsapp,
        note: userNote,
      },
      orders: Array.from(document.querySelectorAll('input[type="number"]'))
        .filter((input) => parseInt(input.value) > 0)
        .map((input) => ({
          name: input.getAttribute("data-name"),
          quantity: parseInt(input.value),
          price: parseInt(input.getAttribute("data-price")),
        })),
      total: Array.from(document.querySelectorAll('input[type="number"]')).reduce(
        (acc, input) =>
          acc +
          parseInt(input.value) * parseInt(input.getAttribute("data-price") || 0),
        0
      ),
      paymentMethod,
    };
  
    // Kirim data ke server
    postJSON(
      "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/order",
      "login",
      getCookie("login"),
      postData,
      (response) => {
        if (response && response.status === "success") {
          alert("Pesanan berhasil disimpan!");
        } else {
          console.error("Gagal menyimpan pesanan:", response);
          alert("Terjadi kesalahan saat menyimpan pesanan.");
        }
      }
    );
  }
  
  // Tambahkan event listener ke tombol submit
document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitOrderButton");
    
    // Validasi jika tombol ditemukan
    if (submitButton) {
      submitButton.addEventListener("click", (event) => {
        event.preventDefault(); // Mencegah reload halaman
        submitOrder(); // Panggil fungsi untuk mengirim data
      });
    } else {
      console.error("Tombol submitOrderButton tidak ditemukan di halaman.");
    }
  });
  
  // Fungsi logout
function logout(event) {
    event.preventDefault(); // Mencegah perilaku default link
  
    // Hapus cookie dengan nama "login"
    deleteCookie("login");
  
    // Cek apakah cookie berhasil dihapus
    if (document.cookie.indexOf("login=") === -1) {
        console.log("Cookie 'login' berhasil dihapus. Mengarahkan ke halaman utama.");
        redirect("/");
    } else {
        console.error("Cookie 'login' gagal dihapus.");
    }
  }