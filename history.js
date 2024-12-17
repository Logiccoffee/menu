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
  
      // menampilkan data lainnya(untuk debugging)
      console.log("Nama depan yang ditampilkan:", firstName);
    } catch (error) {
      console.error("Terjadi kesalahan saat memproses respons:", error.message);
    }
  }
  
  // get data order by user id
getJSON("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/order", "login", getCookie("login"), displayOrders);

// Fungsi untuk menampilkan data pesanan
function displayOrders(orders) {
    const contentElement = document.querySelector(".content");
    contentElement.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
        contentElement.innerHTML = "<p>Belum ada pesanan.</p>";
        return;
    }

    orders.forEach((order) => {
        const menuItems = order.orders
            .map((item) => `${item.quantity}x ${item.menu_name}`)
            .join(", ");
        const orderCard = `
            <div class="order-card">
                <div class="card-header">
                    <h3>Pesanan Logic Coffee</h3>
                    <p>Tanggal Pesanan: ${order.orderDate}</p>
                    <p>Kode Pesanan: ${order.orderNumber}</p>
                </div>
                <div class="card-body">
                    <p><strong>Nama Pemesan:</strong> ${order.user_info.name}</p>
                    <p><strong>No. Telepon:</strong> ${order.user_info.whatsapp}</p>
                    <p><strong>Pesanan:</strong> ${menuItems}</p>
                    <p><strong>Total:</strong> ${order.total}</p>
                </div>
            </div>
        `;
        contentElement.innerHTML += orderCard;
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