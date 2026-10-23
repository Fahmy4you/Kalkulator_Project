(function (root) {
    'use strict';
    const DAY = 86400000;
    const offsets = [];
    for (let offset = -720; offset <= 840; offset += 15) offsets.push(offset);
    function zoneLabel(offset) {
        if (offset === 0) return 'UTC';
        const n = Math.abs(offset);
        return `UTC${offset < 0 ? '−' : '+'}${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
    }
    function candleAt(now, intervalMinutes, offset) {
        const shift = offset * 60000;
        const day = Math.floor((now + shift) / DAY) * DAY - shift;
        const size = intervalMinutes * 60000;
        const start = day + Math.floor((now - day) / size) * size;
        return { start, close: Math.min(start + size, day + DAY) };
    }
    function reminderMax(unit, value) {
        return unit === 'hours' ? 10 : value <= 7 ? 2 : value <= 19 ? 3 : value <= 39 ? 5 : 10;
    }
    function validate(config) {
        if (!offsets.includes(config.offset)) return 'Pilih zona waktu yang valid.';
        if (!['minutes', 'hours'].includes(config.unit) || !Number.isInteger(config.value) || config.value < (config.unit === 'hours' ? 1 : 5) || config.value > (config.unit === 'hours' ? 24 : 59)) return 'Interval harus bilangan bulat: 5–59 menit atau 1–24 jam.';
        if (config.remind && (!['minutes', 'seconds'].includes(config.reminderUnit) || !Number.isInteger(config.reminderValue) || config.reminderValue < 1 || config.reminderValue > (config.reminderUnit === 'seconds' ? 60 : reminderMax(config.unit, config.value)))) return 'Nilai pengingat berada di luar batas yang diizinkan.';
        if (!['once', 'repeat'].includes(config.soundMode)) return 'Pilih mode bunyi yang valid.';
        if (config.soundMode === 'repeat' && (!Number.isInteger(config.repeatSeconds) || config.repeatSeconds < 10 || config.repeatSeconds > 30)) return 'Jarak bunyi harus 10–30 detik.';
        return '';
    }
    function leadMs(config) {
        return config.remind ? config.reminderValue * (config.reminderUnit === 'minutes' ? 60000 : 1000) : 0;
    }
    function clockParts(now, offset) {
        const date = new Date(now + offset * 60000);
        const time = [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()].map(n => String(n).padStart(2, '0')).join(':');
        const day = new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        return { time, date: day };
    }
    function duration(ms) {
        const seconds = Math.max(0, Math.ceil(ms / 1000));
        return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
    }
    // Pure scheduling state. The UI owns one deadline timer and one visible-only display timer.
    class CandleAlarm {
        constructor(onEvent = () => {}) { this.onEvent = onEvent; this.stop(); }
        start(config, now) {
            const error = validate(config);
            if (error) return error;
            const interval = config.value * (config.unit === 'hours' ? 60 : 1);
            const candle = candleAt(now, interval, config.offset);
            const lead = leadMs(config);
            if (lead && candle.close - lead <= now) return 'Waktu pengingat candle terdekat sudah tiba atau terlewat. Kurangi waktu pengingat, nonaktifkan pengingat, atau tunggu candle berikutnya.';
            this.stop();
            this.config = { ...config };
            this.interval = interval;
            this.lead = lead;
            this.running = true;
            this.setCandle(candle);
            return '';
        }
        setCandle(candle) {
            this.candle = candle;
            this.preDone = !this.lead || candle.close - this.lead <= candle.start;
        }
        fire(kind, close, now) {
            if (this.mutedClose === close) return;
            this.alarmClose = close;
            this.eventKind = kind;
            this.onEvent({ kind, close });
            this.repeatAt = this.config.soundMode === 'repeat' ? now + this.config.repeatSeconds * 1000 : Infinity;
        }
        wake(now) {
            if (!this.running) return;
            let fired = false;
            if (now < this.candle.start) {
                // Device clock moved backwards: re-anchor and discard obsolete alarms.
                this.alarmClose = null;
                this.repeatAt = Infinity;
                this.setCandle(candleAt(now, this.interval, this.config.offset));
            }
            if (now >= this.candle.close) {
                const close = this.candle.close;
                if (now - close <= 2000) { this.fire('close', close, now); fired = true; }
                else { this.alarmClose = null; this.repeatAt = Infinity; }
                this.setCandle(candleAt(now, this.interval, this.config.offset));
            }
            if (!this.preDone && now >= this.candle.close - this.lead) {
                this.preDone = true;
                this.fire('reminder', this.candle.close, now);
                fired = true;
            }
            if (!fired && now >= this.repeatAt && this.alarmClose !== null) {
                this.onEvent({ kind: this.eventKind, close: this.alarmClose });
                this.repeatAt = now + this.config.repeatSeconds * 1000;
            }
        }
        nextDeadline() {
            if (!this.running) return Infinity;
            return Math.min(this.candle.close, this.preDone ? Infinity : this.candle.close - this.lead, this.repeatAt);
        }
        silence() {
            if (this.alarmClose === null) return;
            this.mutedClose = this.alarmClose;
            this.alarmClose = null;
            this.repeatAt = Infinity;
        }
        stop() {
            this.running = false;
            this.alarmClose = null;
            this.mutedClose = null;
            this.repeatAt = Infinity;
            this.eventKind = null;
        }
    }
    const api = { offsets, zoneLabel, candleAt, reminderMax, validate, leadMs, clockParts, duration, CandleAlarm };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.TradingTime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
