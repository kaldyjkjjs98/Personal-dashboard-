
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


if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(

    async function(posisi) {
      const latitude = posisi.coords.latitude;
      const longitude = posisi.coords.longitude;

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Gagal mengambil alamat");
        }

        const data = await response.json();
        const alamat = data.address || {};

        const jalan =
          alamat.road ||
          alamat.pedestrian ||
          "Jalan tidak diketahui";

        const kelurahan =
          alamat.suburb ||
          alamat.village ||
          "Kelurahan tidak diketahui";

        const kecamatan =
          alamat.city_district ||
          alamat.subdistrict ||
          "Kecamatan tidak diketahui";

        const kota =
          alamat.city ||
          alamat.town ||
          alamat.county ||
          "Kota tidak diketahui";

        document.getElementById("lokasi").innerHTML = `
          ${jalan}<br>
          Kelurahan: ${kelurahan}<br>
          Kecamatan: ${kecamatan}<br>
          Kota: ${kota}
        `;

      } catch (error) {
        console.log("Error lokasi:", error);

        document.getElementById("lokasi").textContent =
          "Gagal mengambil nama lokasi";
      }

      try {
        const urlCuaca = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        const responseCuaca = await fetch(urlCuaca);

        if (!responseCuaca.ok) {
          throw new Error("Gagal mengambil data cuaca");
        }

        const dataCuaca = await responseCuaca.json();
        const cuaca = dataCuaca.current;

        document.getElementById("suhu").textContent =
          Math.round(cuaca.temperature_2m) + "°C";

        const kelembapan = cuaca.relative_humidity_2m;
        const angin = cuaca.wind_speed_10m;

        document.getElementById("kelembapan").textContent =
          kelembapan + "%";

        document.getElementById("angin").textContent =
          angin + " km/jam";

        const kode = cuaca.weather_code;

        let kondisi = "";
        let ikon = "";

        if (kode === 0) {
          kondisi = "Cerah";
          ikon = "☀️";
        } else if (kode <= 3) {
          kondisi = "Berawan";
          ikon = "🌤️";
        } else if (kode === 45 || kode === 48) {
          kondisi = "Berkabut";
          ikon = "🌫️";
        } else if (kode >= 51 && kode <= 57) {
          kondisi = "Gerimis";
          ikon = "🌦️";
        } else if (kode >= 61 && kode <= 67) {
          kondisi = "Hujan";
          ikon = "🌧️";
        } else if (kode >= 71 && kode <= 77) {
          kondisi = "Salju";
          ikon = "❄️";
        } else if (kode >= 80 && kode <= 82) {
          kondisi = "Hujan";
          ikon = "🌧️";
        } else if (kode >= 85 && kode <= 86) {
          kondisi = "Hujan salju";
          ikon = "🌨️";
        } else if (kode >= 95) {
          kondisi = "Badai petir";
          ikon = "⛈️";
        } else {
          kondisi = "Tidak diketahui";
          ikon = "🌡️";
        }

        document.getElementById("kondisi").textContent = kondisi;
        document.getElementById("ikon-cuaca").textContent = ikon;

        console.log("Data cuaca:", dataCuaca);

      } catch (error) {
        console.log("Error cuaca:", error);

        document.getElementById("kondisi").textContent =
          "Gagal mengambil data cuaca";
      }
    },

    function(error) {
      console.log("Error GPS:", error.message);

      document.getElementById("lokasi").textContent =
        "Gagal mengambil lokasi";
    }
  );

} else {
  document.getElementById("lokasi").textContent =
    "GPS tidak didukung browser";
}


const inputCatatan = document.getElementById("catatan-input");
const tombolSimpan = document.getElementById("simpan-catatan");
const statusCatatan = document.getElementById("status-catatan");

inputCatatan.value =
  localStorage.getItem("catatan-dashboard") || "";

if (inputCatatan.value !== "") {
  statusCatatan.textContent = "Catatan tersimpan";
}

tombolSimpan.addEventListener("click", function() {
  const isiCatatan = inputCatatan.value;

  localStorage.setItem("catatan-dashboard", isiCatatan);

  statusCatatan.textContent =
    "Catatan berhasil disimpan";
});


const inputTugas = document.getElementById("tugas-input");
const tombolTambah = document.getElementById("tambah-tugas");
const daftarTugas = document.getElementById("daftar-tugas");

let tugas = JSON.parse(
  localStorage.getItem("daftar-tugas")
) || [];

function simpanTugas() {
  localStorage.setItem(
    "daftar-tugas",
    JSON.stringify(tugas)
  );
}

function tampilkanTugas() {
  daftarTugas.innerHTML = "";

  if (tugas.length === 0) {
    daftarTugas.innerHTML =
      '<li class="tugas-kosong">Belum ada tugas.</li>';
    return;
  }

  tugas.forEach(function(item, index) {
    const li = document.createElement("li");
    li.className = "item-tugas";

    if (item.selesai) {
      li.classList.add("selesai");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.selesai;

    const teks = document.createElement("span");
    teks.textContent = item.nama;

    const tombolHapus = document.createElement("button");
    tombolHapus.className = "hapus-tugas";
    tombolHapus.textContent = "×";
    tombolHapus.type = "button";

    checkbox.addEventListener("change", function() {
      tugas[index].selesai = checkbox.checked;

      simpanTugas();
      tampilkanTugas();
    });

    tombolHapus.addEventListener("click", function() {
      tugas.splice(index, 1);

      simpanTugas();
      tampilkanTugas();
    });

    li.append(checkbox, teks, tombolHapus);
    daftarTugas.appendChild(li);
  });
}

function tambahTugas() {
  const namaTugas = inputTugas.value.trim();

  if (namaTugas === "") {
    return;
  }

  tugas.push({
    nama: namaTugas,
    selesai: false
  });

  simpanTugas();
  tampilkanTugas();

  inputTugas.value = "";
  inputTugas.focus();
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

    buka.querySelector("span").textContent =
      isi.hidden ? "+" : "−";
  });

  tutup.addEventListener("click", function() {
    isi.hidden = true;
    buka.querySelector("span").textContent = "+";
  });
}

aturPanel("buka-catatan", "panel-catatan", "tutup-catatan");
aturPanel("buka-tugas", "panel-tugas", "tutup-tugas");


if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/service-worker.js")
      .then(function(registration) {
        console.log("Service Worker aktif!", registration);
      })
      .catch(function(error) {
        console.log("Service Worker gagal:", error);
      });
  });
    }
                       
