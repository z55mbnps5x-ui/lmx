// ==UserScript==
// @name        Lampa Hard Reload
// @version     1.0.0
// @description Кнопка жесткой перезагрузки с очисткой кеша
// ==/UserScript==

(function () {
    'use strict';

    const PLUGIN_ID = 'lampa-hard-reload';
    const BUTTON_ID = 'hard-reload-btn';

    function hardReload() {
        try {
            // 1. Очистка Cache Storage (PWA / ServiceWorker)
            if (window.caches && caches.keys) {
                caches.keys().then(keys => {
                    keys.forEach(key => caches.delete(key));
                });
            }

            // 2. Удаление Service Worker
            if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
                navigator.serviceWorker.getRegistrations().then(regs => {
                    regs.forEach(reg => reg.unregister());
                });
            }
        } catch (e) {}

        // 3. Жёсткая перезагрузка
        setTimeout(function () {
            location.reload(true);
        }, 300);
    }

    function addButton() {
        if (document.getElementById(BUTTON_ID)) return;

        const actions = document.querySelector('#app .head__actions');
        if (!actions) return;

        const btn = document.createElement('div');
        btn.id = BUTTON_ID;
        btn.className = 'head__action selector reload-screen';
        btn.setAttribute('title', 'Жесткая перезагрузка');

        btn.innerHTML = `
            <svg fill="#ffffff" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"/>
            </svg>
        `;

        btn.addEventListener('hover:enter', hardReload);
        btn.addEventListener('hover:click', hardReload);
        btn.addEventListener('hover:touch', hardReload);

        actions.appendChild(btn);
    }

    function observeHeader() {
        const observer = new MutationObserver(addButton);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function start() {
        addButton();
        observeHeader();
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
