import {getCookie} from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
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
getJSON("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/order", "login", getCookie("login"), displayOrders);

function displayOrders(orders) {
    const orderHistoryElement = document.getElementById("orderHistory");
  
    // Validasi elemen
    if (!orderHistoryElement) {
      console.error("Elemen dengan ID 'orderHistory' tidak ditemukan di DOM.");
      return;
    }
  
    // Membersihkan konten sebelumnya
    orderHistoryElement.innerHTML = "";
  
    // Iterasi setiap pesanan
    orders.forEach((order) => {
      const formattedDate = new Date(order.orderDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
  
      // Membuat elemen utama order card
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";
  
      // Header Card
      const cardHeader = document.createElement("div");
      cardHeader.className = "card-header";
      cardHeader.innerHTML = `
        <div class="header-content">
          <img src="assets/logo_logic.png" alt="Logo Logic Coffee" class="logo">
          <h3>Pesanan Logic Coffee</h3>
        </div>
        <div class="order-info">
          <div class="order-date">Tanggal Pesanan: ${formattedDate}</div>
          <div class="divider"></div>
          <div class="order-code">Kode Pesanan: ${order.orderNumber}</div>
          <div class="order-queue">No. Antrian: ${order.queueNumber}</div>
        </div>
      `;
  
      // Body Card
      const cardBody = document.createElement("div");
      cardBody.className = "card-body";
  
      // Daftar menu dengan harga total
      const menuItems = order.orders
        .map(
          (item) =>
            `<p><strong>${item.menu_name}</strong> (${item.quantity}x) - Rp${(
              item.price * item.quantity
            ).toLocaleString("id-ID")}</p>`
        )
        .join("");
  
      cardBody.innerHTML = `
        <p><strong>Nama Pemesan:</strong> ${order.user_info.name}</p>
        <p><strong>Whatsapp:</strong> ${order.user_info.whatsapp}</p>
        <div><strong>Pesanan:</strong></div>
        ${menuItems}
        <p><strong>Total:</strong> Rp${order.total.toLocaleString("id-ID")}</p>
        <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod}</p>
      `;
  
      // Footer Card
      const cardFooter = document.createElement("div");
      cardFooter.className = "card-footer";
      cardFooter.innerHTML = `
        <span class="status ${order.status.toLowerCase()}">${order.status}</span>
      `;
  
      // Menyatukan header, body, dan footer ke dalam card
      orderCard.appendChild(cardHeader);
      orderCard.appendChild(cardBody);
      orderCard.appendChild(cardFooter);
  
      // Menambahkan order card ke dalam orderHistoryElement
      orderHistoryElement.appendChild(orderCard);
    });
  }  

//   function displayOrders(orders) {
//     const orderHistory = document.getElementById("orderHistory")
//     orderHistory.forEach((order) => {
//         const orderHistory = document.createElement("div");
//         orderHistory.className = "order-history";
//         orderHistory.innerHTML = `
//         <img src= "./assets/logo_logic
//         `
//     })
//   }
  

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