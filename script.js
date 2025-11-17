const inputAngka = document.querySelectorAll('.angka');
const textKalkulator = document.querySelector('.text input');
const output = document.querySelector('.output input');
const operator = document.querySelectorAll('.operator');
const hapusSatu = document.querySelector('.hapus-satu');
const hapusSemua = document.querySelector('.hapus-semua');

window.addEventListener("click", () => {
  textKalkulator.focus();
});

window.addEventListener("keydown", () => {
  if (document.activeElement !== textKalkulator) {
    textKalkulator.focus();
  }
});

textKalkulator.addEventListener('input', () => {
  hitungKalkulator();
  formatAngkaTeks();
});

// cegah dia agar tidak bisa ketik dari keyboard
textKalkulator.addEventListener('keydown', (e) => {
  // Izinkan angka 0–9
  const isNumber = e.key >= '0' && e.key <= '9';

  // Izinkan tombol navigasi & pengeditan tertentu
  const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'];

  if (isNumber || allowedKeys.includes(e.key)) {
    return; // boleh lanjut
  }

  // Cegah semua tombol lain
  e.preventDefault();
});


// Kalau kamu punya tombol-tombol angka/operator, pastikan juga mereka gak "mengambil" fokus
[...inputAngka, ...operator].forEach(btn => {
  btn.addEventListener("click", () => {
    setTimeout(() => textKalkulator.focus(), 0);
  });
});

document.querySelector('.hapus-semua').addEventListener('click', () => {
  textKalkulator.value = '';
  output.value = '0';
});

document.querySelector('.hapus-satu').addEventListener('click', () => {
  textKalkulator.focus();

  // Kirim event keydown 'Backspace'
  const backspaceEvent = new KeyboardEvent('keydown', {
    key: 'Backspace',
    keyCode: 8,
    code: 'Backspace',
    which: 8,
    bubbles: true,
    cancelable: true,
  });

  // Dispatch event
  textKalkulator.dispatchEvent(backspaceEvent);

  // Jalankan perintah delete (efeknya seperti backspace di posisi kursor)
  document.execCommand('delete');

  // Panggil ulang formatting dan perhitungan
  formatAngkaTeks();
  hitungKalkulator();
});

document.querySelector('.balik').addEventListener('click', () => {
  let ekspresi = textKalkulator.value;
  if(ekspresi == '') return;

  ekspresi = ekspresi.replace(/\./g, '');
  
  const parts = ekspresi.split(/([\+\-\×\÷])/g);
  const last = parts[parts.length -1];
  const prev = parts[parts.length -2];
  const beforePrev = parts[parts.length -3];

  if(/^-?\d+([,]\d+)?%?$/.test(last)) {
    parts[parts.length -1] = `(-${last})`;

  } else if(beforePrev == '(' && prev == '-' && /\d+\)?$/.test(last)) {
    parts.splice(parts.length -3, 3, last.replace(')', ''));

  } else if(/^\(-.*\)$/.test(last)) {
    parts[parts.length - 1] = last.replace(/^\(-/, '').replace(/\)$/, '');
  } else {
    return;
  }

  textKalkulator.value = parts.join('');
  formatAngkaTeks();
  hitungKalkulator();
})

inputAngka.forEach((angka) => {
    angka.addEventListener('click', () => {
        insertAtCursor(angka.textContent)
    })
})

operator.forEach((o) => {
    o.addEventListener('click', () => {
        let simbol = o.textContent;
        const terbaru = textKalkulator.value;
        const lastSimbol = terbaru.slice(-1);

        if(['sin', 'cos', 'tan', 'cosec', 'sec', 'cot','sinh','cosh', 'tanh','cosech','sech','coth'].includes(simbol)) {

          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×' + simbol + '(');
          } else {
            insertAtCursor(simbol + '(');
          }

          return;
        }

        if(simbol == "1/x") {
          const lastPart = terbaru.split(/([\+\-\×\÷\^\(\)])/g).pop();

          if(/^\d+([,]\d+)?$/.test(lastPart)) {
            insertAtCursor('^-1');
            formatAngkaTeks();
            hitungKalkulator();
          }

          return;
        }

        if(simbol == "Rand") {
          const randomValue = (Math.random() * 100).toFixed(6).toString().replace('.', ',');

          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×' + randomValue);
          } else {
            insertAtCursor(randomValue);
          }

          return;
        }

        if(simbol == "eˣ") {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×е^');
          } else {
            insertAtCursor('е^');
          }

          return;
        }

        if(simbol == "π") {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×π');
          } else {
            insertAtCursor('π');
          }

          return;
        }

        if(simbol == "10ˣ") {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×10^');
          } else {
            insertAtCursor('10^');
          }

          return;
        }

        if(simbol == "x√(y)") {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×x√(');
          } else {
            insertAtCursor('x√(');
          }

          return
        }

        if(simbol == "2√(y)") {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×2√(');
          } else {
            insertAtCursor('2√(');
          }

          return
        }

        if(simbol == "x!") {
          const ekspresi = terbaru.replace(/\./g, '');
          const parts = ekspresi.split(/([\+\-\×\÷])/g);
          const lastParts = parts.pop();

          if(/^\d+$/.test(lastParts)) {
            insertAtCursor('!');
            formatAngkaTeks();
            hitungKalkulator();
          }
          return;
        }

        if(simbol == 'yˣ') simbol = '^';

        if(simbol == 'x³') {
          const ekspresi = terbaru.replace(/\./g, '');
          const parts = ekspresi.split(/([\+\-\×\÷])/g);
          const lastParts = parts.pop();

          if(/^\d+([,]\d+)?$/.test(lastParts)) {
            insertAtCursor('^3');
            formatAngkaTeks();
            hitungKalkulator();
          }

          return;
        }

        if(simbol == 'x²') {
          const ekspresi = terbaru.replace(/\./g, '');
          const parts = ekspresi.split(/([\+\-\×\÷])/g);
          const lastParts = parts.pop();

          if(/^\d+([,]\d+)?$/.test(lastParts)) {
            insertAtCursor('^2');
            formatAngkaTeks();
            hitungKalkulator();
          }

          return;
        }

        if(simbol == '(') {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('×(');
          } else {
            insertAtCursor('(');
          }
          return;
        }

        if(simbol == ')') {
          // pastikan jumlah kurung tutup sesuai dengan jumlah kurung buka
          const buka = (terbaru.match(/\(/g) || []).length;
          const tutup = (terbaru.match(/\)/g) || []).length;
          if(tutup < buka && !['+', '-', '×', '÷'].includes(lastSimbol)) {
            insertAtCursor(')');
            hitungKalkulator();
          }

          return;
        }

        if(simbol == '%') {
          if(/\d|\%|\)/.test(lastSimbol)) {
            insertAtCursor('%');
            hitungKalkulator();
            return;
          }
        }

        if(simbol == ',') {
          const bagianTerakhir = terbaru.split(/[\+\-\×\÷]/).pop();
          if(bagianTerakhir.includes(',')) return;
          insertAtCursor(',');
          return;
        }

        if(simbol == "=")  {
            const hasil = parseFloat(output.value);
            if(isNaN(hasil) || !isFinite(hasil)) {
              output.value = "Kesalahan";
              return;
            }

            if(output.value != "Kesalahan") {
                let riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
                riwayat.push({
                    konten: textKalkulator.value,
                    hasil: output.value
                })
                localStorage.setItem('riwayat', JSON.stringify(riwayat));

                textKalkulator.value = output.value;
            }
        }

        if(['+','-','×','÷'].includes(lastSimbol)) {
            textKalkulator.value = terbaru.slice(0, -1) + simbol;
            return;
        }

        if(simbol != '=') {
            insertAtCursor(simbol)
        }
    })
})

function hitungKalkulator() {
    try {
        let ekspresi = textKalkulator.value;

        // Ganti simbol sesuai dengan penjumlahan di js
        ekspresi = ekspresi
                    .replace(/\×/g, '*')
                    .replace(/\÷/g, '/')
                    .replace(/\./g, '')
                    .replace(/\,/g, '.')
                    .replace(/\^/g, '**')
                    .replace(/\π/g, `(${Math.PI})`)
                    .replace(/\е/g, `(${Math.E})`)
                    .replace(/\%/g, '/100');
                    

        // ekspresi = ekspresi.trim();
        if(ekspresi == '' || ekspresi == '+' || ekspresi == '-') {
            output.value = '0';
            return;
        }
          
        if(/(sin|cos|tan|cosec|sec|cot|sinh|cosh|tanh|cosech|sech|coth)\([^()]*$/.test(ekspresi)) {
          output.value = "Selesaikan Fungsi Trigonometri";
          return;
        }

        const buka = (ekspresi.match(/\(/g) || []).length;
        const tutup = (ekspresi.match(/\)/g) || []).length;
        if(tutup < buka) {
          output.value = "Kurung kurang lengkap";
          return;
        }

        // Tangani Fungsi Trigonometri
        const trigMap = [
          { name: 'cosech', fn: x => 1 / Math.sinh(x * Math.PI / 180) },
          { name: 'sech',   fn: x => 1 / Math.cosh(x * Math.PI / 180) },
          { name: 'coth',   fn: x => 1 / Math.tanh(x * Math.PI / 180) },
          { name: 'cosec',  fn: x => 1 / Math.sin(x * Math.PI / 180) },
          { name: 'sec',    fn: x => 1 / Math.cos(x * Math.PI / 180) },
          { name: 'cot',    fn: x => 1 / Math.tan(x * Math.PI / 180) },
          { name: 'sinh',   fn: x => Math.sinh(x * Math.PI / 180) },
          { name: 'cosh',   fn: x => Math.cosh(x * Math.PI / 180) },
          { name: 'tanh',   fn: x => Math.tanh(x * Math.PI / 180) },
          { name: 'sin',    fn: x => Math.sin(x * Math.PI / 180) },
          { name: 'cos',    fn: x => Math.cos(x * Math.PI / 180) },
          { name: 'tan',    fn: x => Math.tan(x * Math.PI / 180) },
        ];

        // Sort agar nama terpanjang dulu (hindari konflik substring)
        trigMap.sort((a, b) => b.name.length - a.name.length);


        for (const { name, fn } of trigMap) {
          const regex = new RegExp(`\\b${name}\\s*\\(([^()]+|\\((?:[^()]+|\\([^()]*\\))*\\))*\\)`, 'gi');

          while (regex.test(ekspresi)) {
            ekspresi = ekspresi.replace(regex, (_, inner) => {
              try {
                // Hitung isi dalam secara rekursif
                let innerValue = inner;

                // Rekursif: panggil hitung kalkulator untuk isi dalamnya
                innerValue = innerValue
                  .replace(/\×/g, '*')
                  .replace(/\÷/g, '/')
                  .replace(/\./g, '')
                  .replace(/\,/g, '.')
                  .replace(/\^/g, '**')
                  .replace(/\π/g, `(${Math.PI})`)
                  .replace(/\е/g, `(${Math.E})`)
                  .replace(/\%/g, '/100');

                const val = eval(innerValue);
                const hasil = fn(val);
                return isFinite(hasil) ? hasil : 'NaN';
              } catch (err) {
                console.log(err);
                return 'NaN';
              }
            });
          }
        }


        // pendukung akar
        while(/(\d+)√\(([^()]+)\)/.test(ekspresi)) {
          ekspresi = ekspresi.replace(/(\d+)√\(([^()]+)\)/g, (_, n, inner) => {
            const pangkat = parseInt(n);
            let ie = inner
                    .replace(/\×/g, '*')
                    .replace(/\÷/g, '/')
                    .replace(/\./g, '')
                    .replace(/\,/g, '.')
                    .replace(/\^/g, '**')
                    .replace(/\%/g, '/100')

            ekspresi = ekspresi.replace(/(\d+)!/g, (_, m) => {
              const num = parseInt(m);

              let hasil = 1;
              for(let i = 1; i <= num; i++) hasil *= i;
              return hasil;
            })

            let val;
            try {
              val = eval(ie);
            } catch (err) {
              val = NaN;
            }

            if(!isFinite(val) || isNaN(val) || val < 0) {
              return 'NaN'
            }

            const hasil = Math.pow(val, 1 / pangkat);
            return String(hasil).replace('.', ',');
          }) 
        }

        // pendukung factorial
        ekspresi = ekspresi.replace(/(\d+)!/g, (_, n) => {
          const num = parseInt(n);

          let hasil = 1;
          for(let i = 1; i <= num; i++) hasil *= i;
          return hasil;
        })

        if(ekspresi.includes('NaN')) {
          output.value = 'Kesalahan';
          return;
        }

        const karakterTerakhir = ekspresi.slice(-1);
        if(['+','-','*','/', '(', '^'].includes(karakterTerakhir)) return;

        console.log(ekspresi)
        ekspresi = ekspresi.replace(/,/g, '.');
        const hasil = eval(ekspresi); 
        if(!isFinite(hasil) || isNaN(hasil)) {
            output.value = 'Kesalahan';
            return;
        }

        output.value = Number(hasil).toLocaleString('id-ID');;
    } catch(err) {
        console.log(err);
        output.value = 'Kesalahan';
    }
}

// helper: hitung index pada raw string (tanpa titik) dari index pada formatted string
function formattedToRawIndex(formatted, pos) {
  let rawIndex = 0;
  for (let i = 0; i < pos; i++) {
    if (formatted[i] !== '.') rawIndex++;
  }
  return rawIndex;
}

// helper: cari posisi di formatted string untuk rawIndex (count non-dot chars)
function rawIndexToFormattedIndex(formatted, rawIndex) {
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== '.') count++;
    if (count === rawIndex) return i + 1; // posisi setelah karakter ke-rawIndex
  }
  // jika rawIndex == 0 atau melebihi, return length atau 0
  return formatted.length;
}

// format raw expression (tanpa titik) -> formatted dengan titik ribuan setiap token angka
function formatRawToFormatted(raw) {
  // pecah berdasarkan operator, jaga operatornya
  const parts = raw.split(/([\+\-\×\÷\^\(\)])/g);
  return parts.map(part => {
    if (/^\d+$/.test(part)) {
      // format angka murni
      return Number(part).toLocaleString('id-ID');
    }
    return part;
  }).join('');
}

// new formatAngkaTeks: format current raw value and preserve cursor as best as possible
function formatAngkaTeks() {
  const formattedBefore = textKalkulator.value;
  const posFormattedBefore = textKalkulator.selectionStart;

  const rawBefore = formattedBefore.replace(/\./g, '');
  const rawCursor = formattedToRawIndex(formattedBefore, posFormattedBefore);

  const formattedAfter = formatRawToFormatted(rawBefore);

  textKalkulator.value = formattedAfter;

  // map rawCursor back to formatted index
  const newCursor = rawIndexToFormattedIndex(formattedAfter, rawCursor);
  textKalkulator.setSelectionRange(newCursor, newCursor);
}

// new insertAtCursor that operates on raw, then formats and restores cursor
function insertAtCursor(textToInsert) {
  const formatted = textKalkulator.value;
  const selStart = textKalkulator.selectionStart;
  const selEnd = textKalkulator.selectionEnd;

  // raw version (remove thousand dots)
  const raw = formatted.replace(/\./g, '');

  // map formatted selection to raw indices
  const rawStart = formattedToRawIndex(formatted, selStart);
  const rawEnd = formattedToRawIndex(formatted, selEnd);

  // insert text (textToInsert likely contains operators or digits).
  // For safety, do NOT add dots here; keep raw semantics.
  const newRaw = raw.slice(0, rawStart) + textToInsert + raw.slice(rawEnd);

  // format raw -> formatted
  const newFormatted = formatRawToFormatted(newRaw);

  // write back
  textKalkulator.value = newFormatted;

  // calculate new raw cursor position (after inserted text)
  const rawCursorAfter = rawStart + textToInsert.length;

  // map raw cursor back to formatted position
  const newCursorPos = rawIndexToFormattedIndex(newFormatted, rawCursorAfter);

  // set cursor and focus
  textKalkulator.setSelectionRange(newCursorPos, newCursorPos);
  textKalkulator.focus();

  // run calculation on the new raw (hitungOtomatis expects formatted input but removes dots inside)
  hitungKalkulator();
}