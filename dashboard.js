// ==========================================
// 0. CUSTOM MODAL (PENGGANTI ALERT & CONFIRM)
// ==========================================
const customModal = document.getElementById("custom-modal");
const customModalTitle = document.getElementById("custom-modal-title");
const customModalMessage = document.getElementById("custom-modal-message");
const customModalButtons = document.getElementById("custom-modal-buttons");

function showCustomAlert(pesan, judul = "Pemberitahuan") {
  return new Promise((resolve) => {
    if (!customModal) {
      alert(pesan);
      resolve();
      return;
    }

    customModalTitle.textContent = judul;
    customModalMessage.textContent = pesan;
    customModalButtons.innerHTML = "";

    const btnOke = document.createElement("button");
    btnOke.className = "custom-modal-btn utama";
    btnOke.textContent = "OKE";
    btnOke.onclick = function() {
      customModal.classList.remove("aktif");
      resolve();
    };

    customModalButtons.appendChild(btnOke);
    customModal.classList.add("aktif");
  });
}

function showCustomConfirm(pesan, judul = "Konfirmasi") {
  return new Promise((resolve) => {
    if (!customModal) {
      resolve(confirm(pesan));
      return;
    }

    customModalTitle.textContent = judul;
    customModalMessage.textContent = pesan;
    customModalButtons.innerHTML = "";

    const btnBatal = document.createElement("button");
    btnBatal.className = "custom-modal-btn batal";
    btnBatal.textContent = "BATAL";
    btnBatal.onclick = function() {
      customModal.classList.remove("aktif");
      resolve(false);
    };

    const btnOke = document.createElement("button");
    btnOke.className = "custom-modal-btn utama";
    btnOke.textContent = "YA";
    btnOke.onclick = function() {
      customModal.classList.remove("aktif");
      resolve(true);
    };

    customModalButtons.append(btnBatal, btnOke);
    customModal.classList.add("aktif");
  });
}

// ==========================================
// 1. JAM DAN TANGGAL
// ==========================================
const jam = document.querySelector(".clock h2");
const tanggal = document.querySelector(".clock p");

function updateClock() {
  const sekarang = new Date();
  if (jam) {
    jam.textContent = sekarang.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  if (tanggal) {
    tanggal.textContent = sekarang.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }
}

updateClock();
setInterval(updateClock, 1000);

// ==========================================
// 2. CUACA, LOKASI & DROPDOWN DETAIL LOKASI
// ==========================================
const lokasi = document.getElementById("lokasi");
const suhu = document.getElementById("suhu");
const kondisi = document.getElementById("kondisi");
const ikonCuaca = document.getElementById("ikon-cuaca");
const elemenHujan = document.getElementById("hujan");
const elemenTekanan = document.getElementById("tekanan");

const alamatJalan = document.getElementById("alamat-jalan");
const alamatKelurahan = document.getElementById("alamat-kelurahan");
const alamatKecamatan = document.getElementById("alamat-kecamatan");
const alamatKota = document.getElementById("alamat-kota");
const alamatKodepos = document.getElementById("alamat-kodepos");

const tombolDetailLokasi = document.getElementById("detail-lokasi-toggle");
const kontainerDetailLokasi = document.getElementById("detail-lokasi");

if (tombolDetailLokasi && kontainerDetailLokasi) {
  tombolDetailLokasi.addEventListener("click", function() {
    const isHidden = kontainerDetailLokasi.hasAttribute("hidden");
    if (isHidden) {
      kontainerDetailLokasi.removeAttribute("hidden");
      tombolDetailLokasi.classList.add("aktif");
      tombolDetailLokasi.setAttribute("aria-expanded", "true");
    } else {
      kontainerDetailLokasi.setAttribute("hidden", "");
      tombolDetailLokasi.classList.remove("aktif");
      tombolDetailLokasi.setAttribute("aria-expanded", "false");
    }
  });
}

function tampilkanCuaca(kode) {
  if (!kondisi || !ikonCuaca) return;
  if (kode === 0) {
    kondisi.textContent = "Cerah";
    ikonCuaca.textContent = "☀️";
  } else if ([1, 2].includes(kode)) {
    kondisi.textContent = "Cerah berawan";
    ikonCuaca.textContent = "🌤️";
  } else if (kode === 3) {
    kondisi.textContent = "Berawan";
    ikonCuaca.textContent = "☁️";
  } else if ([45, 48].includes(kode)) {
    kondisi.textContent = "Berkabut";
    ikonCuaca.textContent = "🌫️";
  } else if ([51, 53, 55, 56, 57].includes(kode)) {
    kondisi.textContent = "Gerimis";
    ikonCuaca.textContent = "🌦️";
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(kode)) {
    kondisi.textContent = "Hujan";
    ikonCuaca.textContent = "🌧️";
  } else if ([71, 73, 75, 77, 85, 86].includes(kode)) {
    kondisi.textContent = "Salju";
    ikonCuaca.textContent = "❄️";
  } else if ([95, 96, 99].includes(kode)) {
    kondisi.textContent = "Badai petir";
    ikonCuaca.textContent = "⛈️";
  } else {
    kondisi.textContent = "Tidak diketahui";
    ikonCuaca.textContent = "🌡️";
  }
}

async function ambilCuaca(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,surface_pressure,weather_code&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil data cuaca");

    const data = await response.json();
    const cuaca = data.current;

    if (suhu) suhu.textContent = `${Math.round(cuaca.temperature_2m)}°C`;
    if (elemenHujan) elemenHujan.textContent = `${cuaca.precipitation} mm`;
    if (elemenTekanan) elemenTekanan.textContent = `${cuaca.surface_pressure} hPa`;

    tampilkanCuaca(cuaca.weather_code);
  } catch (error) {
    if (kondisi) kondisi.textContent = "Gagal memuat cuaca";
    console.error("Error cuaca:", error);
  }
}

async function ambilLokasi(posisi) {
  const latitude = posisi.coords.latitude;
  const longitude = posisi.coords.longitude;

  ambilCuaca(latitude, longitude);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url);
    const data = await response.json();

    const alamat = data.address || {};
    const namaLokasi =
      alamat.suburb ||
      alamat.village ||
      alamat.neighbourhood ||
      alamat.city_district ||
      alamat.town ||
      alamat.city ||
      "Lokasi ditemukan";

    const kotaKab = alamat.city || alamat.town || alamat.regency || alamat.county || "";

    if (lokasi) {
      lokasi.textContent = kotaKab ? `${namaLokasi}, ${kotaKab}` : namaLokasi;
    }

    if (alamatJalan) alamatJalan.textContent = [alamat.road, alamat.house_number].filter(Boolean).join(" ") || "Tidak tersedia";
    if (alamatKelurahan) alamatKelurahan.textContent = alamat.suburb || alamat.village || alamat.neighbourhood || "Tidak tersedia";
    if (alamatKecamatan) alamatKecamatan.textContent = alamat.city_district || alamat.subdistrict || "Tidak tersedia";
    if (alamatKota) alamatKota.textContent = kotaKab || "Tidak tersedia";
    if (alamatKodepos) alamatKodepos.textContent = alamat.postcode || "Tidak tersedia";

  } catch (error) {
    if (lokasi) lokasi.textContent = "Lokasi ditemukan";
    console.error("Error lokasi:", error);
  }
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    ambilLokasi,
    function(error) {
      if (lokasi) lokasi.textContent = "Izin lokasi ditolak/gagal";
      if (kondisi) kondisi.textContent = "Cuaca tidak tersedia";
      console.error("Geolocation error:", error);
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
} else {
  if (lokasi) lokasi.textContent = "GPS tidak didukung";
}

// ==========================================
// 3. FITUR CATATAN (NOTES)
// ==========================================
const judulCatatan = document.getElementById("judul-catatan");
const inputCatatan = document.getElementById("catatan-input");
const tombolSimpan = document.getElementById("simpan-catatan");
const statusCatatan = document.getElementById("status-catatan");
const fotoCatatan = document.getElementById("foto-catatan");
const previewFoto = document.getElementById("preview-foto");
const daftarCatatan = document.getElementById("daftar-catatan");
const jumlahCatatan = document.getElementById("jumlah-catatan");

let semuaCatatan = [];
try {
  semuaCatatan = JSON.parse(localStorage.getItem("dashboard_catatan_list")) || [];
} catch (error) {
  semuaCatatan = [];
}

let catatanEditId = null;
let fotoCatatanData = [];

function kompresFoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const gambar = new Image();
      gambar.onload = function() {
        const canvas = document.createElement("canvas");
        const batas = 800;
        let lebar = gambar.width;
        let tinggi = gambar.height;

        if (lebar > tinggi && lebar > batas) {
          tinggi = tinggi * (batas / lebar);
          lebar = batas;
        } else if (tinggi > batas) {
          lebar = lebar * (batas / tinggi);
          tinggi = batas;
        }

        canvas.width = lebar;
        canvas.height = tinggi;
        const context = canvas.getContext("2d");
        context.drawImage(gambar, 0, 0, lebar, tinggi);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      gambar.onerror = reject;
      gambar.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function tampilkanPreviewFoto() {
  if (!previewFoto) return;
  previewFoto.innerHTML = "";

  fotoCatatanData.forEach(function(foto, index) {
    const wadah = document.createElement("div");
    wadah.className = "preview-item";

    const gambar = document.createElement("img");
    gambar.src = foto;
    gambar.alt = `Foto ${index + 1}`;

    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.textContent = "×";
    tombolHapus.addEventListener("click", function() {
      fotoCatatanData.splice(index, 1);
      tampilkanPreviewFoto();
    });

    wadah.append(gambar, tombolHapus);
    previewFoto.appendChild(wadah);
  });

  const jumlah = document.createElement("p");
  jumlah.textContent = `${fotoCatatanData.length}/10 foto`;
  previewFoto.appendChild(jumlah);
}

if (fotoCatatan) {
  fotoCatatan.addEventListener("change", async function() {
    const fileDipilih = Array.from(fotoCatatan.files);
    const sisaSlot = 10 - fotoCatatanData.length;

    if (sisaSlot <= 0) {
      await showCustomAlert("Maksimal 10 foto per catatan!");
      fotoCatatan.value = "";
      return;
    }

    if (fileDipilih.length > sisaSlot) {
      await showCustomAlert(`Kamu hanya bisa menambahkan ${sisaSlot} foto lagi.`);
    }

    const fileDiproses = fileDipilih.slice(0, sisaSlot);
    for (const file of fileDiproses) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const hasilKompres = await kompresFoto(file);
        fotoCatatanData.push(hasilKompres);
      } catch (error) {
        console.error("Gagal memproses foto:", error);
      }
    }
    tampilkanPreviewFoto();
    fotoCatatan.value = "";
  });
}

function simpanDataCatatan() {
  try {
    localStorage.setItem("dashboard_catatan_list", JSON.stringify(semuaCatatan));
    return true;
  } catch (error) {
    showCustomAlert("Penyimpanan penuh. Coba kurangi foto atau catatan.");
    console.error(error);
    return false;
  }
}

function resetFormCatatan() {
  if (judulCatatan) judulCatatan.value = "";
  if (inputCatatan) inputCatatan.value = "";
  if (fotoCatatan) fotoCatatan.value = "";
  fotoCatatanData = [];
  catatanEditId = null;
  if (previewFoto) previewFoto.innerHTML = "";
  if (tombolSimpan) tombolSimpan.textContent = "SIMPAN";
  if (statusCatatan) statusCatatan.textContent = "Belum ada perubahan";
}

function tampilkanCatatan() {
  if (!daftarCatatan) return;
  daftarCatatan.innerHTML = "";
  if (jumlahCatatan) jumlahCatatan.textContent = semuaCatatan.length;

  if (semuaCatatan.length === 0) {
    const kosong = document.createElement("p");
    kosong.className = "catatan-kosong";
    kosong.textContent = "Belum ada catatan tersimpan.";
    daftarCatatan.appendChild(kosong);
    return;
  }

  semuaCatatan.forEach(function(catatan) {
    const card = document.createElement("div");
    card.className = "catatan-card";

    const judul = document.createElement("h4");
    judul.textContent = catatan.judul || "Tanpa judul";

    const isi = document.createElement("p");
    isi.textContent = catatan.isi || "";

    const waktu = document.createElement("span");
    waktu.className = "catatan-tanggal";
    waktu.textContent = catatan.tanggal;

    card.append(judul, isi);

    if (catatan.foto && catatan.foto.length > 0) {
      const galeri = document.createElement("div");
      galeri.className = "catatan-galeri";

      catatan.foto.forEach(function(foto, index) {
        const gambar = document.createElement("img");
        gambar.src = foto;
        gambar.alt = `Foto catatan ${index + 1}`;
        galeri.appendChild(gambar);
      });
      card.appendChild(galeri);
    }

    const aksi = document.createElement("div");
    aksi.className = "catatan-actions";

    const tombolEdit = document.createElement("button");
    tombolEdit.type = "button";
    tombolEdit.textContent = "EDIT";
    tombolEdit.addEventListener("click", function() {
      editCatatan(catatan.id);
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className = "hapus-catatan";
    tombolHapus.textContent = "HAPUS";
    tombolHapus.addEventListener("click", function() {
      hapusCatatan(catatan.id);
    });

    aksi.append(tombolEdit, tombolHapus);
    card.append(waktu, aksi);
    daftarCatatan.appendChild(card);
  });
}

if (tombolSimpan) {
  tombolSimpan.addEventListener("click", async function() {
    const judul = judulCatatan.value.trim();
    const isi = inputCatatan.value.trim();

    if (!judul && !isi && fotoCatatanData.length === 0) {
      if (statusCatatan) statusCatatan.textContent = "Catatan masih kosong";
      return;
    }

    if (catatanEditId !== null) {
      const index = semuaCatatan.findIndex(c => c.id === catatanEditId);
      if (index !== -1) {
        semuaCatatan[index].judul = judul;
        semuaCatatan[index].isi = isi;
        semuaCatatan[index].foto = [...fotoCatatanData];
        semuaCatatan[index].tanggal = new Date().toLocaleString("id-ID");
      }
    } else {
      semuaCatatan.unshift({
        id: Date.now(),
        judul: judul,
        isi: isi,
        foto: [...fotoCatatanData],
        tanggal: new Date().toLocaleString("id-ID")
      });
    }

    if (!simpanDataCatatan()) return;
    resetFormCatatan();
    tampilkanCatatan();
    if (statusCatatan) statusCatatan.textContent = "Catatan berhasil disimpan";
  });
}

function editCatatan(id) {
  const catatan = semuaCatatan.find(item => item.id === id);
  if (!catatan) return;

  if (judulCatatan) judulCatatan.value = catatan.judul || "";
  if (inputCatatan) inputCatatan.value = catatan.isi || "";

  fotoCatatanData = Array.isArray(catatan.foto) ? [...catatan.foto] : (catatan.foto ? [catatan.foto] : []);
  catatanEditId = id;

  tampilkanPreviewFoto();
  if (tombolSimpan) tombolSimpan.textContent = "PERBARUI";
  if (statusCatatan) statusCatatan.textContent = "Sedang mengedit catatan";

  const panel = document.getElementById("panel-catatan");
  const tombolBuka = document.getElementById("buka-catatan");
  if (panel) panel.hidden = false;
  if (tombolBuka) tombolBuka.querySelector("span").textContent = "−";
  if (judulCatatan) judulCatatan.focus();
}

async function hapusCatatan(id) {
  const konfirmasi = await showCustomConfirm("Yakin ingin menghapus catatan ini?");
  if (!konfirmasi) return;

  semuaCatatan = semuaCatatan.filter(catatan => catatan.id !== id);
  if (!simpanDataCatatan()) return;

  if (catatanEditId === id) resetFormCatatan();
  tampilkanCatatan();
}

tampilkanCatatan();

// ==========================================
// 4. TO-DO LIST
// ==========================================
const inputTugas = document.getElementById("tugas-input");
const tombolTambah = document.getElementById("tambah-tugas");
const daftarTugas = document.getElementById("daftar-tugas");

let semuaTugas = [];
try {
  semuaTugas = JSON.parse(localStorage.getItem("daftar-tugas")) || [];
} catch (error) {
  semuaTugas = [];
}

function simpanTugas() {
  localStorage.setItem("daftar-tugas", JSON.stringify(semuaTugas));
}

function tampilkanTugas() {
  if (!daftarTugas) return;
  daftarTugas.innerHTML = "";

  if (semuaTugas.length === 0) {
    const kosong = document.createElement("div");
    kosong.className = "tugas-kosong";
    kosong.textContent = "Belum ada tugas.";
    daftarTugas.appendChild(kosong);
    return;
  }

  semuaTugas.forEach(function(tugas, index) {
    const item = document.createElement("li");
    item.className = "item-tugas";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tugas.selesai;

    const teks = document.createElement("span");
    teks.textContent = tugas.nama;

    if (tugas.selesai) {
      item.classList.add("selesai");
    }

    checkbox.addEventListener("change", function() {
      semuaTugas[index].selesai = checkbox.checked;
      simpanTugas();
      tampilkanTugas();
    });

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "hapus-tugas";
    hapus.textContent = "×";
    hapus.addEventListener("click", function() {
      semuaTugas.splice(index, 1);
      simpanTugas();
      tampilkanTugas();
    });

    item.append(checkbox, teks, hapus);
    daftarTugas.appendChild(item);
  });
}

function tambahTugas() {
  if (!inputTugas) return;
  const namaTugas = inputTugas.value.trim();
  if (namaTugas === "") return;

  semuaTugas.push({ nama: namaTugas, selesai: false });
  simpanTugas();
  tampilkanTugas();
  inputTugas.value = "";
}

if (tombolTambah) tombolTambah.addEventListener("click", tambahTugas);
if (inputTugas) {
  inputTugas.addEventListener("keydown", function(event) {
    if (event.key === "Enter") tambahTugas();
  });
}

tampilkanTugas();

// ==========================================
// 5. PANEL TOGGLE
// ==========================================
function aturPanel(tombolBuka, panel, tombolTutup) {
  const buka = document.getElementById(tombolBuka);
  const isi = document.getElementById(panel);
  const tutup = document.getElementById(tombolTutup);

  if (!buka || !isi || !tutup) return;

  buka.addEventListener("click", function() {
    isi.hidden = !isi.hidden;
    buka.querySelector("span").textContent = isi.hidden ? "+" : "−";
  });

  tutup.addEventListener("click", function() {
    isi.hidden = true;
    buka.querySelector("span").textContent = "+";
  });
}

aturPanel("buka-catatan", "panel-catatan", "tutup-catatan");
aturPanel("buka-tugas", "panel-tugas", "tutup-tugas");
aturPanel("buka-tools", "panel-tools", "tutup-tools");

const tutupCatatanBtn = document.getElementById("tutup-catatan");
if (tutupCatatanBtn) {
  tutupCatatanBtn.addEventListener("click", resetFormCatatan);
}

// ==========================================
// 6. FULLSCREEN FOTO MODAL
// ==========================================
const modalFoto = document.getElementById("foto-fullscreen");
const gambarFullscreen = document.getElementById("foto-fullscreen-img");
const tombolTutupFoto = document.getElementById("tutup-foto-fullscreen");

if (daftarCatatan && modalFoto && gambarFullscreen) {
  daftarCatatan.addEventListener("click", function(e) {
    if (e.target.tagName === "IMG" && e.target.closest(".catatan-galeri")) {
      gambarFullscreen.src = e.target.src;
      modalFoto.classList.add("aktif");
    }
  });
}

if (tombolTutupFoto && modalFoto) {
  tombolTutupFoto.addEventListener("click", function() {
    modalFoto.classList.remove("aktif");
  });

  modalFoto.addEventListener("click", function(e) {
    if (e.target === modalFoto) {
      modalFoto.classList.remove("aktif");
    }
  });
}

// ==========================================
// 7. FITUR TOGGLE DARK / LIGHT MODE
// ==========================================
const themeToggleBtn = document.getElementById("theme-toggle");

if (themeToggleBtn) {
  const savedTheme = localStorage.getItem("dashboard_theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeToggleBtn.textContent = "🌙";
  }

  themeToggleBtn.addEventListener("click", function() {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    
    themeToggleBtn.textContent = isLight ? "🌙" : "☀️";
    localStorage.setItem("dashboard_theme", isLight ? "light" : "dark");
  });
}

// ==========================================
// 8. FITUR KALKULATOR & VARIABEL (DISEMPURNAKAN)
// ==========================================
const calcInputField = document.getElementById("calc-input-field");
const calcDisplay = document.getElementById("calc-display");

// Agar keyboard HP tidak muncul saat diklik, tapi tetap bisa ditekan tombol kalkulatornya
if (calcInputField) {
  calcInputField.setAttribute("readonly", "true");
}

function calcInsert(val) {
  if (!calcInputField) return;
  // Jika nilai awal masih kosong atau '0', Timpa. Jika tidak, tambahkan.
  if (calcInputField.value === "" || calcInputField.value === "0") {
    calcInputField.value = val;
  } else {
    calcInputField.value += val;
  }
}

function calcClear() {
  if (calcInputField) calcInputField.value = "";
  if (calcDisplay) calcDisplay.textContent = "0";
}

window.calcHitung = function() {
  if (!calcInputField || !calcDisplay) return;
  let ekspresi = calcInputField.value.trim();
  
  if (!ekspresi) return;

  try {
    // Jika mengandung tanda pertidaksamaan, tampilkan sebagai info ekspresi
    if (ekspresi.includes("<") || ekspresi.includes(">")) {
      calcDisplay.textContent = ekspresi;
      return;
    }

    // Ganti simbol visual dengan operator hitung JavaScript
    let proses = ekspresi
      .replace(/÷/g, "/")
      .replace(/×/g, "*");

    // Jika ada variabel x atau y dan ingin dihitung, ganti atau biarkan. 
    // Di sini kita evaluasi matematika dasarnya terlebih dahulu jika berupa angka murni,
    // atau biarkan tampil sebagai bentuk aljabar jika mengandung huruf.
    if (/[xy]/.test(proses)) {
      calcDisplay.textContent = proses;
      return;
    }

    // Evaluasi fungsi trigonometri jika ada
    proses = proses.replace(/sin\(([^)]+)\)/g, (match, p1) => {
      let rad = (parseFloat(p1) * Math.PI) / 180;
      return Math.sin(rad);
    });

    proses = proses.replace(/cos\(([^)]+)\)/g, (match, p1) => {
      let rad = (parseFloat(p1) * Math.PI) / 180;
      return Math.cos(rad);
    });

    let hasil = eval(proses);
    if (!isFinite(hasil)) throw new Error();

    if (!Number.isInteger(hasil)) {
      hasil = parseFloat(hasil.toFixed(4));
    }

    calcDisplay.textContent = hasil;
  } catch (e) {
    calcDisplay.textContent = "Format Error";
  }
};
      
// Fungsi untuk menghapus 1 karakter di sebelah kiri kursor (Backspace)
function calcBack() {
  if (!calcInputField) return;
  const start = calcInputField.selectionStart;
  const end = calcInputField.selectionEnd;
  const text = calcInputField.value;

  if (start > 0 || start !== end) {
    if (start === end) {
      calcInputField.value = text.substring(0, start - 1) + text.substring(end);
      calcInputField.selectionStart = calcInputField.selectionEnd = start - 1;
    } else {
      calcInputField.value = text.substring(0, start) + text.substring(end);
      calcInputField.selectionStart = calcInputField.selectionEnd = start;
    }
  }
  calcInputField.focus();
}
