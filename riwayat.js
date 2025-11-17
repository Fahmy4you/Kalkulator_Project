const riwayat = document.querySelector('#riwayat');
const riwayat_content = document.querySelector('#riwayat_content');
const close = document.querySelector('#close_riwayat');
const bgblur = document.querySelector('.bg-blur');
const listRiwayat = document.querySelector('#list_riwayat');
const hapusAllRiwayat = document.querySelector('#hapus_all_riwayat');

const fetchRiwayat = async () => {
    const data = await JSON.parse(localStorage.getItem('riwayat')) || [];

    // kosongkan list riwayat
    listRiwayat.innerHTML = '';

    if(data.length === 0) {
        listRiwayat.innerHTML = '<p class="not_found_text">Belum ada riwayat perhitungan.</p>';
        return;
    }

    // tampilkan riwayat
    data.forEach((item, index) => {
        listRiwayat.innerHTML += `<li>
            <div>
                <h4>${item.konten}</h4>
                <p>${item.hasil}</p>
            </div>
            <button class="hapus_riwayat" data-index="${index}"><i class="bi bi-trash-fill"></i></button>   
        </li>
        `;
    });
}

riwayat.addEventListener('click', async () => {
    await fetchRiwayat();
    riwayat_content.classList.toggle('active');
    bgblur.classList.add('active');
})
close.addEventListener('click', () => {
    bgblur.classList.remove('active');
    riwayat_content.classList.remove('active');
});

// event delegation untuk menghapus satu riwayat
listRiwayat.addEventListener('click', (e) => {
    const btn = e.target.closest('.hapus_riwayat');

    // abaikan fungsi ketika bukan hapus riwayat yang diklik
    if(!btn) return;

    const isConfirm = confirm('Yakin ingin menghapus riwayat ini?');
    if(!isConfirm) return;
    
    const index = btn.dataset.index;
    const data = JSON.parse(localStorage.getItem('riwayat')) || [];
    data.splice(index, 1);
    localStorage.setItem('riwayat', JSON.stringify(data));
    fetchRiwayat();
}); 

hapusAllRiwayat.addEventListener('click', () => {
    if(localStorage.getItem('riwayat') === null || localStorage.getItem('riwayat') == []) return alert('Belum ada riwayat untuk dihapus.');
    const isConfirm = confirm('Yakin ingin menghapus seluruuh riwayat ini?');
    if(!isConfirm) return;
    localStorage.removeItem('riwayat');
    fetchRiwayat();
});