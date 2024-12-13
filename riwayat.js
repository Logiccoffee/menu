// Mengimpor modul eksternal
import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js";
import { redirect } from "https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js";
import { deleteCookie } from "https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js";

// Fungsi untuk mengecek status login
function checkLoginStatus() {
    const loginToken = getCookie("login");

    // Jika tidak ada cookie login, arahkan ke halaman login
    if (!loginToken) {
        window.location.href = "https://logiccoffee.id.biz.id/login"; // Ganti dengan URL halaman login
    } else {
        console.log("Pengguna sudah login");
        // Lanjutkan untuk menampilkan data pengguna jika diperlukan
    }
}

// Panggil fungsi checkLoginStatus() di awal
checkLoginStatus();

// Cek apakah cookie login ada, jika tidak arahkan ke halaman utama
if (getCookie("login") === "") {
    console.log("Cookie login tidak ditemukan. Mengarahkan ke halaman utama.");
    redirect("/");
}

// Ambil data pengguna menggunakan API
getJSON("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/user", "login", getCookie("login"), responseFunction);

// Fungsi untuk memisahkan nama depan
function getFirstName(fullName) {
    // Memisahkan nama lengkap menjadi array berdasarkan spasi dan mengambil nama pertama
    const nameParts = fullName.split(" ");
    return nameParts[0]; // Mengambil nama pertama
}

// Fungsi untuk menangani respons API
function responseFunction(result) {
    try {
        if (result.status === 404) {
            console.log("Pengguna tidak ditemukan. Mengarahkan ke halaman pendaftaran.");
            setInner("content", "Silahkan lakukan pendaftaran terlebih dahulu.");
            redirect("/register");
            return; // Menghentikan eksekusi setelah redirect
        }

        // Ambil nama lengkap dari API dan pisahkan untuk mendapatkan nama depan
        const fullName = result.data.name || "Nama Tidak Diketahui";
        const firstName = getFirstName(fullName);

        // Menampilkan nama pengguna dan peran pengguna di elemen yang telah disediakan
        const userNameElement = document.getElementById("user-name");

        if (userNameElement) {
            userNameElement.textContent = firstName; // Menampilkan hanya nama depan
        }

        // Menampilkan nama pengguna di sidebar
        const profileNameElement = document.querySelector(".profile-name");
        if (profileNameElement) {
            profileNameElement.textContent = firstName; // Menampilkan nama depan di sidebar
        }

        // Ambil userId dan panggil fetchUserOrders
        const userId = result.data.id;
        fetchUserOrders(userId);

        console.log("Data pengguna:", result.data);
    } catch (error) {
        console.error("Terjadi kesalahan saat memproses respons:", error.message);
        setInner("content", "Terjadi kesalahan saat memproses data.");
    }
}

// Fungsi logout
function logout(event) {
    event.preventDefault(); // Mencegah perilaku default link

    // Hapus cookie dengan nama "login"
    deleteCookie("login");

    // Cek apakah cookie berhasil dihapus
    if (document.cookie.indexOf("login=") === -1) {
        console.log("Cookie 'login' berhasil dihapus. Mengarahkan ke halaman utama.");
        redirect("/"); // Ganti "/" dengan URL halaman utama Anda
    } else {
        console.error("Cookie 'login' gagal dihapus.");
    }
}

// Menjalankan logout saat tombol diklik
document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.querySelector("#logout-btn"); // Menggunakan ID tombol logout
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    } else {
        console.error("Tombol logout tidak ditemukan.");
    }
});

// Fungsi untuk mengambil data pesanan pengguna
function fetchUserOrders(userId) {
    getJSON(`https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/order?user_id=${userId}`, "login", getCookie("login"), (result) => {
        if (result.status === 200) {
            const orders = result.data || [];
            displayOrders(orders);
        } else {
            console.error("Gagal memuat data pesanan:", result.status);
            setInner("content", "Tidak ada data pesanan untuk ditampilkan.");
        }
    });
}

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

