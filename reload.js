  const RELOAD_ID = 'reboot';
  function addReloadButton() {
        if (document.getElementById(RELOAD_ID)) return;

        const actions = document.querySelector('#app .head__actions');
        if (!actions) return;

        const btn = document.createElement('div');
        btn.id = RELOAD_ID;
        btn.className = 'head__action selector reload-screen';

        // ⬇️ ТВОЙ ДИЗАЙН КНОПКИ — БЕЗ ИЗМЕНЕНИЙ
        btn.innerHTML = `
            <svg fill="#ffffff" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff" stroke-width="0.48">
                <path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"
                      fill="currentColor"/>
            </svg>
        `;

        const reload = () => location.reload();

        btn.addEventListener('hover:enter', reload);
        btn.addEventListener('hover:click', reload);
        btn.addEventListener('hover:touch', reload);

        actions.appendChild(btn);
    }

    function start() {
        addReloadButton();
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();