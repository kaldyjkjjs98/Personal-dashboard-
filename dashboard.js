
const jam = document.querySelector(".clock h2");
const tanggal = document.querySelector(".clock p");

function updateClock() {
  const sekarang = new Date();

  jam.textContent = sekarang.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  tanggal.textContent = sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

updateClock();
setInterval(updateClock, 1000);

const lokasi = document.getElementById("lokasi");
const suhu = document.getElementById("suhu");
const kondisi = document.getElementById("kondisi");
const ikonCuaca = document.getElementById("ikon-cuaca");
const kelembapan = document.getElementById("kelembapan");
const angin = document.getElementById("angin");

function tampilkanCuaca(kode) {
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gagal mengambil data cuaca");
    }

    const data = await response.json();
    const cuaca = data.current;

    suhu.textContent = `${Math.round(cuaca.temperature_2m)}°C`;
    kelembapan.textContent = `${cuaca.relative_humidity_2m}%`;
    angin.textContent = `${cuaca.wind_speed_10m} km/jam`;

    tampilkanCuaca(cuaca.weather_code);
  } catch (error) {
    kondisi.textContent = "Gagal memuat cuaca";
    console.error(error);
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

    const alamat = data.address;

    const namaLokasi =
      alamat.suburb ||
      alamat.village ||
      alamat.neighbourhood ||
      alamat.city_district ||
      alamat.town ||
      alamat.city ||
      "Lokasi ditemukan";

    const kota =
      alamat.city ||
      alamat.town ||
      alamat.regency ||
      alamat.county ||
      "";

    lokasi.textContent = kota
      ? `${namaLokasi}, ${kota}`
      : namaLokasi;

  } catch (error) {
    lokasi.textContent = "Lokasi ditemukan";
    console.error(error);
  }
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    ambilLokasi,
    function(error) {
      lokasi.textContent = "Izin lokasi diperlukan";
      kondisi.textContent = "Lokasi tidak tersedia";
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000
    }
  );
} else {
  lokasi.textContent = "GPS tidak didukung";
}

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
  semuaCatatan = JSON.parse(
    localStorage.getItem("dashboard_catatan_list")
  ) || [];
} catch (error) {
  semuaCatatan = [];
}

let catatanEditId = null;
let fotoCatatanData = "";

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

        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };

      gambar.onerror = reject;
      gambar.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

fotoCatatan.addEventListener("change", async function() {
  const file = fotoCatatan.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar");
    fotoCatatan.value = "";
    return;
  }

  try {
    fotoCatatanData = await kompresFoto(file);

    previewFoto.innerHTML = "";

    const gambar = document.createElement("img");
    gambar.src = fotoCatatanData;
    gambar.alt = "Preview foto catatan";

    const tombolHapusFoto = document.createElement("button");
    tombolHapusFoto.type = "button";
    tombolHapusFoto.textContent = "HAPUS FOTO";

    tombolHapusFoto.addEventListener("click", function() {
      fotoCatatanData = "";
      fotoCatatan.value = "";
      previewFoto.innerHTML = "";
    });

    previewFoto.append(gambar, tombolHapusFoto);

  } catch (error) {
    alert("Gagal memproses foto");
    console.error(error);
  }
});

function simpanDataCatatan() {
  try {
    localStorage.setItem(
      "dashboard_catatan_list",
      JSON.stringify(semuaCatatan)
    );

    return true;
  } catch (error) {
    alert("Penyimpanan penuh. Coba hapus beberapa foto atau catatan.");
    console.error(error);
    return false;
  }
}

function resetFormCatatan() {
  judulCatatan.value = "";
  inputCatatan.value = "";
  fotoCatatan.value = "";
  fotoCatatanData = "";
  catatanEditId = null;
  previewFoto.innerHTML = "";
  tombolSimpan.textContent = "SIMPAN";
  statusCatatan.textContent = "Belum ada perubahan";
}

function tampilkanCatatan() {
  daftarCatatan.innerHTML = "";
  jumlahCatatan.textContent = semuaCatatan.length;

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

    if (catatan.foto) {
      const gambar = document.createElement("img");
      gambar.src = catatan.foto;
      gambar.alt = "Foto catatan";
      card.appendChild(gambar);
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

tombolSimpan.addEventListener("click", function() {
  const judul = judulCatatan.value.trim();
  const isi = inputCatatan.value.trim();

  if (!judul && !isi && !fotoCatatanData) {
    statusCatatan.textContent = "Catatan masih kosong";
    return;
  }

  if (catatanEditId !== null) {
    const index = semuaCatatan.findIndex(function(catatan) {
      return catatan.id === catatanEditId;
    });

    if (index !== -1) {
      semuaCatatan[index].judul = judul;
      semuaCatatan[index].isi = isi;
      semuaCatatan[index].foto = fotoCatatanData;
      semuaCatatan[index].tanggal = new Date().toLocaleString("id-ID");
    }
  } else {
    semuaCatatan.unshift({
      id: Date.now(),
      judul: judul,
      isi: isi,
      foto: fotoCatatanData,
      tanggal: new Date().toLocaleString("id-ID")
    });
  }

  if (!simpanDataCatatan()) return;

  resetFormCatatan();
  statusCatatan.textContent = "Catatan berhasil disimpan";
  tampilkanCatatan();
});

function editCatatan(id) {
  const catatan = semuaCatatan.find(function(item) {
    return item.id === id;
  });

  if (!catatan) return;

  judulCatatan.value = catatan.judul;
  inputCatatan.value = catatan.isi;
  fotoCatatanData = catatan.foto || "";
  catatanEditId = id;

  previewFoto.innerHTML = "";

  if (fotoCatatanData) {
    const gambar = document.createElement("img");
    gambar.src = fotoCatatanData;
    gambar.alt = "Preview foto catatan";

    const tombolHapusFoto = document.createElement("button");
    tombolHapusFoto.type = "button";
    tombolHapusFoto.textContent = "HAPUS FOTO";

    tombolHapusFoto.addEventListener("click", function() {
      fotoCatatanData = "";
      fotoCatatan.value = "";
      previewFoto.innerHTML = "";
    });

    previewFoto.append(gambar, tombolHapusFoto);
  }

  tombolSimpan.textContent = "PERBARUI";
  statusCatatan.textContent = "Sedang mengedit catatan";

  const panel = document.getElementById("panel-catatan");
  const tombolBuka = document.getElementById("buka-catatan");

  panel.hidden = false;
  tombolBuka.querySelector("span").textContent = "−";
  judulCatatan.focus();
}

function hapusCatatan(id) {
  const konfirmasi = confirm("Yakin ingin menghapus catatan ini?");

  if (!konfirmasi) return;

  const sebelumnya = semuaCatatan;

  semuaCatatan = semuaCatatan.filter(function(catatan) {
    return catatan.id !== id;
  });

  if (!simpanDataCatatan()) {
    semuaCatatan = sebelumnya;
    return;
  }

  if (catatanEditId === id) {
    resetFormCatatan();
  }

  tampilkanCatatan();
}

tampilkanCatatan();

const inputTugas = document.getElementById("tugas-input");
const tombolTambah = document.getElementById("tambah-tugas");
const daftarTugas = document.getElementById("daftar-tugas");

let semuaTugas = [];

try {
  semuaTugas = JSON.parse(
    localStorage.getItem("daftar-tugas")
  ) || [];
} catch (error) {
  semuaTugas = [];
}

function simpanTugas() {
  localStorage.setItem("daftar-tugas", JSON.stringify(semuaTugas));
}

function tampilkanTugas() {
  daftarTugas.innerHTML = "";

  semuaTugas.forEach(function(tugas, index) {
    const item = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tugas.selesai;

    const teks = document.createElement("span");
    teks.textContent = tugas.nama;

    if (tugas.selesai) {
      teks.style.textDecoration = "line-through";
      teks.style.opacity = "0.5";
    }

    checkbox.addEventListener("change", function() {
      semuaTugas[index].selesai = checkbox.checked;
      simpanTugas();
      tampilkanTugas();
    });

    const hapus = document.createElement("button");
    hapus.type = "button";
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
  const namaTugas = inputTugas.value.trim();

  if (namaTugas === "") return;

  semuaTugas.push({
    nama: namaTugas,
    selesai: false
  });

  simpanTugas();
  tampilkanTugas();
  inputTugas.value = "";
}

tombolTambah.addEventListener("click", tambahTugas);

inputTugas.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    tambahTugas();
  }
});

tampilkanTugas();

function aturPanel(tombolBuka, panel, tombolTutup) {
  const buka = document.getElementById(tombolBuka);
  const isi = document.getElementById(panel);
  const tutup = document.getElementById(tombolTutup);

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

document.getElementById("tutup-catatan").addEventListener("click", function() {
  resetFormCatatan();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/service-worker.js")
      .catch(function(error) {
        console.error("Service Worker gagal:", error);
      });
  });
      }
            
