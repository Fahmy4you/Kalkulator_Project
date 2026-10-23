(function () {
    'use strict';
    const T = window.TradingTime;
    const UI = window.TimeUI;
    const el = id => document.getElementById(id);
    const fields = ['intervalZone', 'intervalUnit', 'intervalValue', 'remindBefore', 'reminderUnit', 'reminderValue', 'soundMode', 'repeatSeconds'];
    UI.fillZones(el('intervalZone'));
    try {
        const saved = JSON.parse(UI.read('tr_interval_settings') || 'null');
        if (saved) fields.forEach(id => {
            if (saved[id] !== undefined) {
                if (id === 'remindBefore') el(id).checked = saved[id] === true;
                else el(id).value = String(saved[id]);
            }
        });
    } catch { /* Ignore corrupt saved preferences. */ }
    let audio;
    let masterGain;
    let alarmLimiter;
    const volumeInput = el('alarmVolume');
    const storedVolume = UI.read('tr_interval_volume');
    const savedVolume = storedVolume === null ? 100 : Number(storedVolume);
    volumeInput.value = String(Number.isFinite(savedVolume) ? Math.min(100, Math.max(0, Math.round(savedVolume))) : 100);
    function updateVolume() {
        const percent = Number(volumeInput.value);
        el('volumeValue').textContent = `${percent}%`;
        volumeInput.setAttribute('aria-valuetext', percent === 0 ? 'Bisu' : `${percent} persen`);
        if (masterGain && audio) masterGain.gain.setTargetAtTime((percent / 100) ** 2, audio.currentTime, 0.02);
        UI.write('tr_interval_volume', String(percent));
    }
    volumeInput.addEventListener('input', updateVolume);
    updateVolume();
    let voices = [];
    let deadlineTimer;
    let displayTimer;
    let starting = false;
    let generation = 0;
    let status = 'Siap dimulai';
    function stopVoices() {
        voices.forEach(voice => { try { voice.stop(); } catch { /* Already stopped. */ } });
        voices = [];
    }
    async function unlockAudio() {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Browser ini tidak mendukung bunyi alarm. Gunakan browser terbaru.');
        if (!audio || audio.state === 'closed') {
            audio = new Audio();
            masterGain = audio.createGain();
            masterGain.gain.value = (Number(volumeInput.value) / 100) ** 2;
            masterGain.connect(audio.destination);
            // Keep the louder alarm signal bounded before the user's volume control.
            alarmLimiter = audio.createWaveShaper();
            const curve = new Float32Array(4096);
            for (let i = 0; i < curve.length; i++) {
                const x = i * 2 / (curve.length - 1) - 1;
                curve[i] = 0.98 * Math.tanh(2.5 * x);
            }
            alarmLimiter.curve = curve;
            alarmLimiter.connect(masterGain);
        }
        if (audio.state !== 'running') await audio.resume();
        if (audio.state !== 'running') throw new Error('Bunyi belum diizinkan. Tekan Tes Bunyi lalu coba Start kembali.');
    }
    function beep() {
        if (!audio || audio.state !== 'running') {
            el('formError').textContent = 'Audio sedang ditangguhkan browser. Tekan Tes Bunyi untuk mengaktifkannya kembali.';
            return;
        }
        stopVoices();
        const start = audio.currentTime;
        [0, 0.58, 1.16].forEach((delay, i) => {
            const gain = audio.createGain();
            gain.connect(alarmLimiter);
            gain.gain.setValueAtTime(0, start);
            const oscillator = audio.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.value = i === 1 ? 1500 : 1100;
            oscillator.connect(gain);
            gain.gain.setValueAtTime(0, start + delay);
            gain.gain.linearRampToValueAtTime(0.95, start + delay + 0.01);
            gain.gain.setValueAtTime(0.95, start + delay + 0.44);
            gain.gain.linearRampToValueAtTime(0, start + delay + 0.47);
            oscillator.onended = () => {
                oscillator.disconnect();
                voices = voices.filter(v => v !== oscillator);
                gain.disconnect();
            };
            voices.push(oscillator);
            oscillator.start(start + delay);
            oscillator.stop(start + delay + 0.48);
        });
    }
    const engine = new T.CandleAlarm(event => {
        status = event.kind === 'reminder' ? 'Candle segera close' : 'Candle sudah close';
        const parts = T.clockParts(event.close, engine.config.offset);
        el('alarmMessage').textContent = `${status} · ${parts.time} ${T.zoneLabel(engine.config.offset)}`;
        el('alarmBanner').hidden = false;
        el('silenceButton').disabled = false;
        beep();
    });
    function config() {
        return {
            offset: Number(el('intervalZone').value), unit: el('intervalUnit').value,
            value: el('intervalValue').valueAsNumber, remind: el('remindBefore').checked,
            reminderUnit: el('reminderUnit').value, reminderValue: el('reminderValue').valueAsNumber,
            soundMode: el('soundMode').value, repeatSeconds: el('repeatSeconds').valueAsNumber
        };
    }
    function preferences() {
        const data = {};
        fields.forEach(id => { data[id] = id === 'remindBefore' ? el(id).checked : el(id).value; });
        UI.write('tr_interval_settings', JSON.stringify(data));
    }
    function updateForm() {
        const c = config();
        const hours = c.unit === 'hours';
        el('intervalValue').min = hours ? '1' : '5';
        el('intervalValue').max = hours ? '24' : '59';
        el('intervalHelp').textContent = hours ? 'Pilih 1–24 jam.' : 'Pilih 5–59 menit.';
        el('reminderFields').hidden = !c.remind;
        const max = c.reminderUnit === 'seconds' ? 60 : T.reminderMax(c.unit, c.value);
        el('reminderValue').max = String(max);
        el('reminderHelp').textContent = `Pilih 1–${max} ${c.reminderUnit === 'seconds' ? 'detik' : 'menit'}.`;
        el('repeatFields').hidden = c.soundMode !== 'repeat';
        render();
    }
    function render() {
        const c = engine.running ? engine.config : config();
        const now = Date.now();
        const valid = !T.validate(c);
        const candle = engine.running ? engine.candle : valid ? T.candleAt(now, c.value * (c.unit === 'hours' ? 60 : 1), c.offset) : null;
        el('countdown').textContent = candle ? T.duration(candle.close - now) : '--:--:--';
        el('closeTime').textContent = candle ? `${T.clockParts(candle.close, c.offset).time} · ${T.zoneLabel(c.offset)}` : '—';
        el('closeDate').textContent = candle ? T.clockParts(candle.close, c.offset).date : 'Periksa pengaturan interval';
        el('timerStatus').textContent = engine.running ? status : 'Siap dimulai';
        el('currentTime').textContent = valid ? `Sekarang ${T.clockParts(now, c.offset).time} · ${T.zoneLabel(c.offset)}` : '';
        el('reminderTime').textContent = !c.remind ? 'Nonaktif · bunyi saat close' : candle && candle.close - T.leadMs(c) > candle.start ? `${T.clockParts(candle.close - T.leadMs(c), c.offset).time}` : 'Dilewati pada candle pendek ini';
        el('startButton').disabled = engine.running || starting;
        el('stopButton').disabled = !engine.running && !starting;
        if (engine.alarmClose === null) {
            el('silenceButton').disabled = true;
            el('alarmBanner').hidden = true;
        }
    }
    function displayLoop() {
        clearTimeout(displayTimer);
        if (document.hidden) return;
        render();
        if (engine.running) displayTimer = setTimeout(displayLoop, 1000 - Date.now() % 1000);
    }
    function schedule() {
        clearTimeout(deadlineTimer);
        if (!engine.running) return;
        deadlineTimer = setTimeout(() => {
            engine.wake(Date.now());
            if (!document.hidden) render();
            schedule();
        }, Math.max(0, engine.nextDeadline() - Date.now()));
    }
    function lock(locked) { el('settings').disabled = locked; }
    el('intervalForm').addEventListener('submit', async event => {
        event.preventDefault();
        if (engine.running || starting) return;
        const c = config();
        let error = T.validate(c);
        if (!error) {
            const probe = new T.CandleAlarm();
            error = probe.start(c, Date.now());
        }
        if (error) { el('formError').textContent = error; return; }
        starting = true;
        const token = ++generation;
        lock(true);
        render();
        el('formError').textContent = '';
        try {
            await unlockAudio();
            if (token !== generation) return;
            error = engine.start(c, Date.now());
            if (error) throw new Error(error);
            preferences();
            status = 'Alarm aktif · menunggu jadwal';
            starting = false;
            schedule();
            displayLoop();
        } catch (err) {
            if (token === generation) { el('formError').textContent = err.message; lock(false); }
        } finally {
            if (token === generation) { starting = false; render(); }
        }
    });
    function stop() {
        generation++;
        starting = false;
        clearTimeout(deadlineTimer);
        clearTimeout(displayTimer);
        stopVoices();
        engine.stop();
        lock(false);
        render();
    }
    el('stopButton').addEventListener('click', stop);
    el('silenceButton').addEventListener('click', () => {
        engine.silence(); stopVoices(); status = 'Alarm aktif · bunyi candle ini dimatikan'; schedule(); render();
    });
    el('testSound').addEventListener('click', async () => {
        try { await unlockAudio(); beep(); } catch (err) { el('formError').textContent = err.message; }
    });
    fields.forEach(id => el(id).addEventListener('change', () => { el('formError').textContent = ''; preferences(); updateForm(); }));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(displayTimer);
        else { if (engine.running) { engine.wake(Date.now()); schedule(); } displayLoop(); }
    });
    window.addEventListener('pagehide', () => { stop(); if (audio) { audio.close().catch(() => {}); audio = null; masterGain = null; alarmLimiter = null; } });
    window.addEventListener('pageshow', render);
    updateForm();
})();
