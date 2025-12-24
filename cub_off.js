(function () {
    'use strict';

    /* ================= GUARD ================= */

    if (window.cub_clean_plugin) return;
    window.cub_clean_plugin = true;

    /* ================= CONFIG ================= */

    const REGION_CODE = 'ru';
    const STYLE_ID = 'stlico_css';
    const RELOAD_ID = 'reboot';

    /* ================= REGION ================= */

    function setRegion() {
        const time = Date.now();
        localStorage.setItem('region', JSON.stringify({
            code: REGION_CODE,
            time: time
        }));
    }

    /* ================= UI CLEAN ================= */

    function hideLocks() {
        $('.selectbox-item__lock').parent().hide();

        if (!$('.extensions__body').length) {
            $('.settings-param-title').last().hide();
        }
    }

    function removeAds() {
        $('.ad-bot').remove();
        $('.card__textbox').closest('.card').remove();
    }

    function cleanHeader() {
        $('.open--feed, .open--premium').remove();
        $('[data-action=feed], [data-action=subscribes]').remove();
    }

    function cleanFullCard() {
        $('.button--subscribe').remove();
        $('.full-start__button.selector.button--play').remove();

        $('.hide.buttons--container > div')
            .prependTo('.full-start-new__buttons');
    }

    /* ================= RELOAD BUTTON ================= */

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

    /* ================= STYLES ================= */

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        Lampa.Template.add(STYLE_ID, `
<style>
.menu__list li[data-action='soursehome'] {color:#ff2d7b;}
.menu__list li[data-type='history'] {color:#ff9b00;}
.menu__list li[data-type='book'] {color:red;}
.menu__list li[data-action='mytorrents'] {color:#66cf0e;}
.menu__list li[data-action='movie'] {color:#00c2ff;}
.menu__list li[data-action='tv'] {color:#ffee00;}
.menu__list li[data-action='filter'] {color:#c700bf;}

.menu__item.focus,
.menu__item.traverse,
.menu__item.hover {
    color:#000!important;
}

.full-start-new__buttons
.full-start__button:nth-child(-n+3):not(.focus) span {
    display:block;
}

body.glass--style-opacity--blacked .player-panel,
body.glass--style-opacity--blacked .player-info,
body.glass--style-opacity--blacked .player-video__paused,
body.glass--style-opacity--blacked .player-video__loader {
    background-color: rgba(0,0,0,0.3);
}
</style>
        `);

        $('body').append(Lampa.Template.get(STYLE_ID, {}, true));
    }

    /* ================= OBSERVER ================= */

    function observeDOM() {
        const observer = new MutationObserver(function () {
            hideLocks();
            removeAds();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /* ================= LISTENERS ================= */

    function registerListeners() {

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(cleanFullCard, 0);
            }
        });

        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === 'activity') {
                setTimeout(function () {
                    hideLocks();
                    removeAds();
                }, 200);
            }
        });
    }

    /* ================= INIT ================= */

    function start() {
        setRegion();
        cleanHeader();
        injectStyles();
        addReloadButton();
        observeDOM();
        registerListeners();

        // первичный проход
        hideLocks();
        removeAds();
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();

