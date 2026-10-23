(function () {
    'use strict';
    const T = window.TradingTime;
    const UI = window.TimeUI;
    const zone = document.getElementById('clockZone');
    const saved = UI.read('tr_clock_offset');
    UI.fillZones(zone, saved === null ? 420 : Number(saved));
    let timer;
    function render() {
        clearTimeout(timer);
        const now = Date.now();
        const parts = T.clockParts(now, Number(zone.value));
        document.getElementById('clockTime').textContent = parts.time;
        document.getElementById('clockDate').textContent = parts.date;
        document.getElementById('clockZoneLabel').textContent = T.zoneLabel(Number(zone.value));
        if (!document.hidden) timer = setTimeout(render, 1000 - now % 1000);
    }
    zone.addEventListener('change', () => { UI.write('tr_clock_offset', zone.value); render(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else render(); });
    window.addEventListener('pagehide', () => clearTimeout(timer));
    window.addEventListener('pageshow', render);
    render();
})();
