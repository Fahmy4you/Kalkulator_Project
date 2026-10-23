(function () {
    'use strict';
    const T = window.TradingTime;
    const themeButton = document.getElementById('btnTheme');
    function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
    function write(key, value) { try { localStorage.setItem(key, value); } catch { /* Usable in private/restricted storage. */ } }
    function theme(dark) {
        document.documentElement.classList.toggle('dark', dark);
        document.getElementById('themeIcon').textContent = dark ? '☀️' : '🌙';
        document.getElementById('themeText').textContent = dark ? 'Light' : 'Dark';
        themeButton.setAttribute('aria-label', dark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
    }
    theme((read('trading_theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark');
    themeButton.addEventListener('click', () => {
        const dark = !document.documentElement.classList.contains('dark');
        theme(dark);
        write('trading_theme', dark ? 'dark' : 'light');
    });
    window.addEventListener('storage', event => {
        if (event.key === 'trading_theme' && ['light', 'dark'].includes(event.newValue)) theme(event.newValue === 'dark');
    });
    function fillZones(select, selected = 420) {
        select.replaceChildren(...T.offsets.map(offset => {
            const option = document.createElement('option');
            option.value = String(offset);
            option.textContent = T.zoneLabel(offset);
            return option;
        }));
        select.value = String(T.offsets.includes(selected) ? selected : 420);
    }
    window.TimeUI = { read, write, fillZones };
    document.querySelector('nav a[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
})();
