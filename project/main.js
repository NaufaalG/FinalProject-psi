// main.js
document.addEventListener('DOMContentLoaded', function () {
  const playBtn = document.querySelector('.group');
  const landingPage = document.querySelector('.landing-page');
  const areaBermain = document.querySelector('.area-bermain');
  const penyimpananBtn = document.querySelector('.chest-wood');
  const tokoBtn = document.querySelector('.game-shop-red');

  if (playBtn && landingPage && areaBermain) {
    playBtn.addEventListener('click', function () {
      landingPage.style.display = 'none';
      areaBermain.style.display = 'block';
    });
  }

  if (penyimpananBtn) {
    penyimpananBtn.addEventListener('click', function () {
      window.location.href = 'penyimpanan.html';
    });
  }

  if (tokoBtn) {
    tokoBtn.addEventListener('click', function () {
      window.location.href = 'toko.html';
    });
  }

  // Cek query string untuk langsung ke area bermain
  if (window.location.search.includes('area=1')) {
    if (landingPage && areaBermain) {
      landingPage.style.display = 'none';
      areaBermain.style.display = 'block';
    }
  }

  // Tombol keluar di area bermain
  const keluarBtn = document.querySelector('.download-removebg-2');
  if (keluarBtn && landingPage && areaBermain) {
    keluarBtn.style.cursor = 'pointer';
    keluarBtn.addEventListener('click', function () {
      areaBermain.style.display = 'none';
      landingPage.style.display = 'block';
      // Hapus query string jika ada
      if (window.location.search.includes('area=1')) {
        window.history.replaceState({}, document.title, 'index.html');
      }
    });
  }

  // Tombol reset di area bermain
  const resetBtn = document.querySelector('.restart');
  if (resetBtn && areaBermain) {
    resetBtn.style.cursor = 'pointer';
    resetBtn.addEventListener('click', function () {
      nyawa = 100;
      kebersihan = 100;
      happiness = 100;
      setStorage({ makanan: 3, sabun: 3, obat: 1 });
      window.dispatchEvent(new Event('storage'));
      setCoin(15);
      updateBar();
      areaBermain.style.display = 'block';
      if (landingPage) landingPage.style.display = 'none';
      updateStorageDisplay();
      updateCoinDisplay();
      energy = 3;
      updateEnergyDisplay();
      isSickState = false;
      hideSakitPopup();
    });
  }

  // Reset di penyimpanan.html dan toko.html
  if (window.location.pathname.endsWith('penyimpanan.html') || window.location.pathname.endsWith('toko.html')) {
    const resetBtn = document.querySelector('.restart');
    if (resetBtn) {
      resetBtn.style.cursor = 'pointer';
      resetBtn.addEventListener('click', function () {
        setStorage({ makanan: 3, sabun: 3, obat: 1 });
        setCoin(15);
        updateStorageDisplay();
        updateCoinDisplay();
      });
    }
  }

  // Tombol Makan dan Mandi di area bermain
  const makanBtn = document.querySelector('.area-bermain .text-wrapper-5');
  const mandiBtn = document.querySelector('.area-bermain .text-wrapper-7');

  // State untuk animasi aksi (makan/mandi/main)
  let chickoActionTimeout = null;
  let chickoActionActive = false;

// state sakit chicko
  let sakitTimeout = null;
  let isSickState = false;
  function checkSakitState() {
    if (isSickState) return; // Jika sudah sakit, jangan cek lagi
    if (nyawa < 50 || kebersihan < 50 || happiness < 50) {
      if (!sakitTimeout) {
        sakitTimeout = setTimeout(() => {
          showSakitPopup();
        }, 8000);
      }
    } else {
      if (sakitTimeout) {
        clearTimeout(sakitTimeout);
        sakitTimeout = null;
      }
    }
  }
  function showSakitPopup() {
    isSickState = true;
    document.querySelector('.popup-sakit').style.display = 'flex';
    setChickoImage('assets/chickosakit.png');
    if (gameOverTimeout) clearTimeout(gameOverTimeout);
    console.log('Timer game over dimulai');
    gameOverTimeout = setTimeout(() => {
      console.log('Memanggil showGameOverPopup');
      showGameOverPopup();
    }, 10000);
  }
  function hideSakitPopup() {
    let storage = getStorage();
    if (storage.obat > 0) {
      storage.obat--;
      setStorage(storage);
      updateStorageDisplay();
      isSickState = false;
      document.querySelector('.popup-sakit').style.display = 'none';
      nyawa = 100; kebersihan = 100; happiness = 100;
      updateBar();
      setChickoImage('assets/chicko2.png');
      // Cancel game over timer if cured
      if (gameOverTimeout) clearTimeout(gameOverTimeout);
    } else {
      alert('Stok obat habis!');
    }
  }
  function ensureObatListener() {
    const btnObat = document.querySelector('.btn-obat');
    if (btnObat && !btnObat._obatListener) {
      btnObat.addEventListener('click', hideSakitPopup);
      btnObat._obatListener = true;
    }
  }
  document.addEventListener('DOMContentLoaded', ensureObatListener);
  // Juga pasang listener setiap kali popup muncul
  const observer = new MutationObserver(ensureObatListener);
  observer.observe(document.body, { childList: true, subtree: true });

  function setChickoImage(src, isAction = false) {
    if (isSickState && src !== 'assets/chickosakit.png') return; // Kunci gambar saat sakit
    const chickoImg = document.querySelector('.area-bermain .free-vector-hen-with');
    if (chickoImg) {
      chickoImg.src = src;
    }
    if (isAction) {
      chickoActionActive = true;
      if (chickoActionTimeout) clearTimeout(chickoActionTimeout);
      chickoActionTimeout = setTimeout(function () {
        chickoActionActive = false;
        // Setelah animasi aksi, cek kondisi lapar dan kotor
        if (isSickState) {
          setChickoImage('assets/chickosakit.png');
        } else if (nyawa < 50) {
          setChickoImage('assets/chickolapar.png');
        } else if (kebersihan < 50) {
          setChickoImage('assets/chickokotor.png');
        } else {
          setChickoImage('assets/chicko2.png');
        }
      }, 5000);
    }
  }

  if (makanBtn) {
    makanBtn.style.cursor = 'pointer';
    makanBtn.addEventListener('click', function () {
      let storage = getStorage();
      if (storage.makanan > 0) {
        useItem('makanan');
        nyawa = Math.min(nyawa + 30, 100);
        updateBar();
        // Ganti gambar chicko saat makan (pakai state animasi)
        setChickoImage('assets/chickomakan.png', true);
      } else {
        alert('Stok makanan habis!');
      }
    });
  }

  if (mandiBtn) {
    mandiBtn.style.cursor = 'pointer';
    mandiBtn.addEventListener('click', function () {
      let storage = getStorage();
      if (storage.sabun > 0) {
        kebersihan = Math.min(kebersihan + 30, 100);
        useItem('sabun');
        updateBar();
        setChickoImage('assets/chickomandi.png', true);
      } else {
        alert('Stok sabun habis!');
      }
    });
  }

  // --- LOGIKA BAR STATUS ---
  let nyawa = 100;
  let kebersihan = 100;
  let happiness = 100;

  function updateBar() {
    // Bar lapar
    const barRects1 = [
      document.querySelector('.rectangle-7'),
      document.querySelector('.rectangle-8'),
      document.querySelector('.rectangle-9'),
      document.querySelector('.rectangle-10'),
      document.querySelector('.rectangle-11'),
    ];
    const barText1 = document.querySelector('.area-bermain .text-wrapper-2');
    if (barText1) barText1.textContent = nyawa + '/100';
    barRects1.forEach(bar => { if (bar) bar.style.opacity = '1'; });
    let lost1 = Math.floor((100 - nyawa) / 20);
    for (let i = 0; i < lost1; i++) {
      if (barRects1[i]) barRects1[i].style.opacity = '0.2';
    }
    // Update chicko lapar/kotor jika tidak sedang animasi aksi
    if (!chickoActionActive && !isSickState) {
      if (nyawa < 50) {
        setChickoImage('assets/chickolapar.png');
      } else if (kebersihan < 50) {
        setChickoImage('assets/chickokotor.png');
      } else {
        setChickoImage('assets/chicko2.png');
      }
    }
    // Bar kebersihan
    const barRects2 = [
      document.querySelector('.rectangle-13'),
      document.querySelector('.rectangle-14'),
      document.querySelector('.rectangle-15'),
      document.querySelector('.rectangle-12'),
      document.querySelector('.rectangle-16'),
    ];
    const barText2 = document.querySelector('.area-bermain .text-wrapper-4');
    if (barText2) barText2.textContent = kebersihan + '/100';
    barRects2.forEach(bar => { if (bar) bar.style.opacity = '1'; });
    let lost2 = Math.floor((100 - kebersihan) / 20);
    for (let i = 0; i < lost2; i++) {
      if (barRects2[i]) barRects2[i].style.opacity = '0.2';
    }
    // Bar happiness
    const barRects3 = [
      document.querySelector('.rectangle-18'),
      document.querySelector('.rectangle-19'),
      document.querySelector('.rectangle-17'),
      document.querySelector('.rectangle-21'),
      document.querySelector('.rectangle-20'),
    ];
    const barText3 = document.querySelector('.area-bermain .text-wrapper-3');
    if (barText3) barText3.textContent = happiness + '/100';
    barRects3.forEach(bar => { if (bar) bar.style.opacity = '1'; });
    let lost3 = Math.floor((100 - happiness) / 20);
    for (let i = 0; i < lost3; i++) {
      if (barRects3[i]) barRects3[i].style.opacity = '0.2';
    }
    checkSakitState();
  }

  setInterval(function () {
    if (areaBermain && areaBermain.style.display !== 'none') {
      if (nyawa > 0) {
        nyawa -= 10;
      }
      if (kebersihan > 0) {
        kebersihan -= 10;
      }
      if (happiness > 0) {
        happiness -= 10;
      }
      updateBar();
    }
  }, 25000);

  // Interval untuk menambah energy jika semua bar di atas 50
  setInterval(function () {
    if (nyawa > 50 && kebersihan > 50 && happiness > 50 && energy < 3) {
      energy++;
      updateEnergyDisplay();
    }
  }, 10000);

  // --- LOGIKA PENYIMPANAN ---
  function getStorage() {
    let storage = localStorage.getItem('chicko_storage');
    if (storage) return JSON.parse(storage);
    // Default value
    return { makanan: 3, sabun: 3, obat: 1 };
  }
  function setStorage(val) {
    localStorage.setItem('chicko_storage', JSON.stringify(val));
  }
  function useItem(type) {
    let storage = getStorage();
    if (storage[type] > 0) {
      storage[type]--;
      setStorage(storage);
      updateStorageDisplay();
    }
  }
  function updateStorageDisplay() {
    console.log('updateStorageDisplay called');
    // Hanya update jika di penyimpanan.html
    if (!window.location.pathname.endsWith('penyimpanan.html')) return;
    const makananEl = document.querySelector('.text-wrapper-9');
    const sabunEl = document.querySelector('.text-wrapper-10');
    const obatEl = document.querySelector('.text-wrapper-11');
    let storage = getStorage();
    if (!storage) storage = { makanan: 3, sabun: 3, obat: 1 };
    if (makananEl) makananEl.textContent = storage.makanan;
    if (sabunEl) sabunEl.textContent = storage.sabun;
    if (obatEl) obatEl.textContent = storage.obat;
    console.log('storage:', storage);
    console.log('makananEl:', makananEl, 'sabunEl:', sabunEl, 'obatEl:', obatEl);
  }

  // Jika di penyimpanan.html, update setiap kali halaman aktif atau localStorage berubah
  if (window.location.pathname.endsWith('penyimpanan.html')) {
    window.addEventListener('storage', updateStorageDisplay);
    document.addEventListener('visibilitychange', updateStorageDisplay);
    document.addEventListener('DOMContentLoaded', updateStorageDisplay);
    window.addEventListener('pageshow', updateStorageDisplay);
    updateStorageDisplay();
  }

  window.updateStorageDisplay = updateStorageDisplay;

  // --- LOGIKA COIN ---
  function getCoin() {
    let coin = localStorage.getItem('chicko_coin');
    if (coin !== null) return parseInt(coin);
    return 15;
  }
  function setCoin(val) {
    localStorage.setItem('chicko_coin', val);
  }
  function updateCoinDisplay() {
    // Tampilkan coin di penyimpanan.html dan toko.html
    if (
      window.location.pathname.endsWith('penyimpanan.html') ||
      window.location.pathname.endsWith('toko.html')
    ) {
      const coinEl = document.querySelector('.text-wrapper-3');
      if (coinEl) coinEl.textContent = getCoin();
    }
    // Tampilkan coin di index.html (area bermain)
    if (window.location.pathname.endsWith('index.html')) {
      const coinEl = document.querySelector('.text-wrapper-8');
      if (coinEl) coinEl.textContent = getCoin();
    }
  }

  // --- LOGIKA BELI DI TOKO ---
  if (window.location.pathname.endsWith('toko.html')) {
    function beliBarang(type, harga) {
      let coin = getCoin();
      if (coin < harga) {
        alert('Coin tidak cukup!');
        return;
      }
      let storage = getStorage();
      storage[type] = (storage[type] || 0) + 1;
      setStorage(storage);
      setCoin(coin - harga);
      updateCoinDisplay();
      // update penyimpanan jika buka tab lain
      window.dispatchEvent(new Event('storage'));
    }
    // Obat
    const obatBtn = document.querySelector('.text-wrapper-6');
    if (obatBtn) {
      obatBtn.style.cursor = 'pointer';
      obatBtn.addEventListener('click', function () {
        beliBarang('obat', 10);
      });
    }
    // Sabun
    const sabunBtn = document.querySelector('.text-wrapper-7');
    if (sabunBtn) {
      sabunBtn.style.cursor = 'pointer';
      sabunBtn.addEventListener('click', function () {
        beliBarang('sabun', 3);
      });
    }
    // Makanan
    const makananBtn = document.querySelector('.text-wrapper-8');
    if (makananBtn) {
      makananBtn.style.cursor = 'pointer';
      makananBtn.addEventListener('click', function () {
        beliBarang('makanan', 5);
      });
    }
    // Tombol kembali di toko.html
    const kembaliBtn = document.querySelector('.text-wrapper-5');
    if (kembaliBtn) {
      kembaliBtn.style.cursor = 'pointer';
      kembaliBtn.addEventListener('click', function () {
        window.location.href = 'index.html?area=1';
      });
    }
    // Update coin saat halaman toko dibuka
    document.addEventListener('DOMContentLoaded', updateCoinDisplay);
    window.addEventListener('pageshow', updateCoinDisplay);
    updateCoinDisplay();
  }

  // Update coin di penyimpanan.html
  if (window.location.pathname.endsWith('penyimpanan.html')) {
    document.addEventListener('DOMContentLoaded', updateCoinDisplay);
    window.addEventListener('pageshow', updateCoinDisplay);
    window.addEventListener('storage', updateCoinDisplay);
    updateCoinDisplay();
  }

  // Update coin di index.html (area bermain)
  if (window.location.pathname.endsWith('index.html')) {
    document.addEventListener('DOMContentLoaded', updateCoinDisplay);
    window.addEventListener('pageshow', updateCoinDisplay);
    window.addEventListener('storage', updateCoinDisplay);
    updateCoinDisplay();
  }

  // --- LOGIKA ENERGY DAN MAIN ---
  let energy = 3;

  function updateEnergyDisplay() {
    // Ada 3 baterai: .download-battery, .download-battery-2, .download-battery-3
    const bat1 = document.querySelector('.area-bermain .download-battery');
    const bat2 = document.querySelector('.area-bermain .download-battery-2');
    const bat3 = document.querySelector('.area-bermain .download-battery-3');
    if (bat1) bat1.style.opacity = energy >= 1 ? '1' : '0.2';
    if (bat2) bat2.style.opacity = energy >= 2 ? '1' : '0.2';
    if (bat3) bat3.style.opacity = energy >= 3 ? '1' : '0.2';
  }

  // Tombol Main di area bermain
  const mainBtn = document.querySelector('.area-bermain .text-wrapper-6');
  if (mainBtn) {
    mainBtn.style.cursor = 'pointer';
    mainBtn.addEventListener('click', function () {
      if (energy > 0) {
        energy--;
        happiness = Math.min(happiness + 30, 100);
        // Tambah coin 5 setiap main
        setCoin(getCoin() + 5);
        updateBar();
        updateEnergyDisplay();
        setChickoImage('assets/chickomain.png', true);
        updateCoinDisplay();
      } else {
        alert('Energy habis!');
      }
    });
  }

  // Reset energy saat reset game
  if (resetBtn && areaBermain) {
    resetBtn.addEventListener('click', function () {
      energy = 3;
      updateEnergyDisplay();
    });
  }

  // Inisialisasi energy display saat halaman dimuat
  if (window.location.pathname.endsWith('index.html')) {
    document.addEventListener('DOMContentLoaded', updateEnergyDisplay);
    window.addEventListener('pageshow', updateEnergyDisplay);
    updateEnergyDisplay();
  }

  // --- GAME OVER POPUP LOGIC ---
  let gameOverTimeout = null;
  function showGameOverPopup() {
    console.log('Menampilkan modal game over');
    const modal = document.getElementById('gameOverModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  function hideGameOverPopup() {
    const modal = document.getElementById('gameOverModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  // Handle Keluar button
  const keluarBtnModal = document.getElementById('keluarBtn');
  if (keluarBtnModal) {
    keluarBtnModal.onclick = function() {
      window.location.href = 'index.html';
    };
  }

  // --- NAMA CHICKO ---
  const chickoNameInput = document.getElementById('chickoNameInput');
  const chickoNameDisplay = document.getElementById('chickoNameDisplay');

  function setChickoName(name) {
    localStorage.setItem('chicko_name', name);
  }
  function getChickoName() {
    return localStorage.getItem('chicko_name') || 'CHICKO';
  }

  // Saat play button diklik, simpan nama
  if (playBtn) {
    playBtn.addEventListener('click', function () {
      let name = chickoNameInput ? chickoNameInput.value.trim() : '';
      if (!name) name = 'CHICKO';
      setChickoName(name);
      updateChickoNameDisplay();
    });
  }

  function updateChickoNameDisplay() {
    if (chickoNameDisplay) {
      chickoNameDisplay.textContent = getChickoName();
    }
  }

  // Panggil saat area bermain muncul
  if (window.location.search.includes('area=1') || (areaBermain && areaBermain.style.display !== 'none')) {
    updateChickoNameDisplay();
  }
});
