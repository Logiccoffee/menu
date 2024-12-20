import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import { deleteCookie } from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";

// menampilkan nama user
// cek cookie dengan header login ada ga?
if (getCookie("login") === "") {
  redirect("/");
}

// Ambil data pengguna menggunakan API
getJSON(
  "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/user",
  "login",
  getCookie("login"),
  responseFunction
);

function responseFunction(result) {
  try {
    if (result.status === 404) {
      redirect("/register");
      return;
    }

    // cek apakah name tersedia di response
    console.log("Data pengguna:", result.data);

    // get nama lengkap dari API
    const fullName = result.data.name || "Nama Tidak Diketahui";

    // pisahin nama depan(kata pertama)
    const firstName = fullName.split(" ")[0]; //ambil data pertama sebagai nama depan

    // munculin nama depan user di elemen yg sudah disediakan
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      userNameElement.textContent = firstName;
    }

    // munculin nama lengkap user di elemen sidebar
    const fullNameElement = document.getElementById("user-fullname");
    if (fullNameElement) {
      fullNameElement.textContent = fullName;
    }

    // menampilkan data lainnya(untuk debugging)
    console.log("Nama depan yang ditampilkan:", firstName);
    console.log("Nama lengkap yang ditampilkan:", fullName);
  } catch (error) {
    console.error("Terjadi kesalahan saat memproses respons:", error.message);
  }
}

// get data order by user id
getJSON(
  "https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/order",
  "login",
  getCookie("login"),
  displayOrders
);

function displayOrders(orders) {
  // Pastikan orders adalah array
  if (!Array.isArray(orders.data)) {
    console.error("Data orders bukan array:", orders);
    return;
  }

  const orderHistoryElement = document.getElementById("orderHistory");

  // Validasi elemen
  if (!orderHistoryElement) {
    console.error("Elemen dengan ID 'orderHistory' tidak ditemukan di DOM.");
    return;
  }

  // Membersihkan konten sebelumnya
  orderHistoryElement.innerHTML = "";

  // Iterasi setiap pesanan
  orders.data.forEach((order) => {
    const formattedDate = new Date(order.orderDate).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long", // Menampilkan nama bulan dalam bentuk panjang (contoh: Desember)
        year: "numeric",
      }
    );

    const menuItems = order.orders
      .map(
        (item) =>
          `<p>${item.menu_name} <span>(${item.quantity}x) - Rp${(
            item.price * item.quantity
          ).toLocaleString("id-ID")}</span></p>`
      )
      .join("");

    // Buat elemen order-card
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";

    orderCard.innerHTML = `
      <!-- Left Section -->
      <div class="left-section">
          <div class="left-header">
              <div class="brand-logo">
                  <img src="assets/logo_logic.png" alt="Logo">
                  <h4 class="pc">Logic Coffee - Kopinya Mahasiswa</h4>
                  <h4 class="phone">Receipt</h4>
              </div>
              <p class="order-date">${formattedDate}</p>
          </div>
  
          <p class="order-code">${order.orderNumber}</p>
  
          <div class="order-details">
              <p><strong>Nama Pemesan :</strong> ${order.user_info.name}</p>
              <p><strong>Whatsapp :</strong> ${order.user_info.whatsapp}</p>
              <p><strong>Note :</strong> ${order.user_info.note || "-"}</p>
              <p><strong>Metode Pembayaran :</strong> ${
                order.payment_method
              }</p>
          </div>
  
          <div class="order-items">
              <p><strong>Pesanan :</strong></p>
              ${menuItems}
          </div>
  
          <p class="total">Total : Rp ${order.total.toLocaleString("id-ID")}</p>
      </div>
  
      <!-- Right Section -->
      <div class="right-section" data-status="${order.status}">
          <p class="queue-number">No. Antrian<br>${order.queueNumber}</p>
          <i class="status-icon"></i>
          <p class="status">${order.status}</p>
      </div>
    `;

    // Menambahkan card ke dalam container
    orderHistoryElement.appendChild(orderCard);

    // Panggil fungsi untuk menambahkan ikon status
    setStatusIcons();
  });
}

// pengaturan icon status
document.addEventListener("DOMContentLoaded", function () {
  setStatusIcons(); // Panggil fungsi untuk menetapkan ikon status
});

function setStatusIcons() {
  const rightSections = document.querySelectorAll(".right-section");

  rightSections.forEach((section) => {
    const statusIcon = section.querySelector(".status-icon");
    const statusText = section.getAttribute("data-status"); // Ambil status dari atribut

    // Reset semua class ikon terlebih dahulu
    statusIcon.className = "status-icon";

    // Tambahkan ikon berdasarkan status
    switch (statusText) {
      case "terkirim":
        statusIcon.classList.add("fa-regular", "fa-paper-plane");
        break;
      case "diproses":
        statusIcon.classList.add("fa-solid", "fa-hourglass-half");
        break;
      case "selesai":
        statusIcon.classList.add("fa-solid", "fa-circle-check");
        break;
      case "dibatalkan":
        statusIcon.classList.add("fa-solid", "fa-circle-xmark");
        break;
      default:
        statusIcon.classList.add("fa-solid", "fa-question");
        break;
    }

    // Tambahkan warna berdasarkan status
    if (statusText === "terkirim") {
      statusIcon.style.color = "#09431f"; // Hijau gelap
    } else if (statusText === "diproses") {
      statusIcon.style.color = "#f1c40f"; // Kuning
    } else if (statusText === "selesai") {
      statusIcon.style.color = "#27ae60"; // Hijau
    } else if (statusText === "dibatalkan") {
      statusIcon.style.color = "#e74c3c"; // Merah
    } else {
      statusIcon.style.color = "#7f8c8d"; // Abu-abu untuk default
    }
  });
}

// Fungsi logout
function logout(event) {
  event.preventDefault(); // Mencegah perilaku default link

  // Hapus cookie dengan nama "login"
  deleteCookie("login");

  // Cek apakah cookie berhasil dihapus
  if (document.cookie.indexOf("login=") === -1) {
    console.log(
      "Cookie 'login' berhasil dihapus. Mengarahkan ke halaman utama."
    );
    redirect("/");
  } else {
    console.error("Cookie 'login' gagal dihapus.");
  }
}

// Menjalankan logout saat tombol diklik
document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  } else {
    console.error("Tombol logout tidak ditemukan.");
  }
});
