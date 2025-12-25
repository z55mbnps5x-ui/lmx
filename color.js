(function () {
    'use strict';

    /* защита от повторной загрузки */
    if (window.__lampa_vote_modern_3) return;
    window.__lampa_vote_modern_3 = true;

    var PLUGIN_ID = 'vote_modern_3';

    function registerManifest() {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
        Lampa.Manifest.plugins.push({
            type: 'other',
            version: '2.1.0',
            name: 'Современный рейтинг (3 уровня)',
            description: 'Плохой / Хороший / Отличный рейтинг',
            component: PLUGIN_ID
        });
    }

    function injectCSS() {
        if (document.getElementById('vote-modern-3-style')) return;

        var style = document.createElement('style');
        style.id = 'vote-modern-3-style';
        style.textContent = `
/* базовый бейдж рейтинга */
.card__vote{
    display:inline-flex;
    align-items:center;
    justify-content:center;

    min-width:56px;
    height:32px;
    padding:0 12px;

    font-family:Inter,system-ui,-apple-system,sans-serif;
    font-size:1.05rem;
    font-weight:700;
    letter-spacing:.02em;

    border-radius:999px;

    backdrop-filter:blur(6px);
    -webkit-backdrop-filter:blur(6px);

    box-shadow:
        0 6px 20px rgba(0,0,0,.35),
        inset 0 1px 0 rgba(255,255,255,.25);

    transition:
        transform .2s ease,
        box-shadow .2s ease;
}

/* hover / focus */
.card.focus .card__vote,
.card:hover .card__vote{
    transform:translateY(-1px) scale(1.04);
    box-shadow:
        0 10px 28px rgba(0,0,0,.45),
        inset 0 1px 0 rgba(255,255,255,.35);
}

/* плохой рейтинг */
.vote--bad{
    background:linear-gradient(135deg,#FF8A8A,#E63946);
    color:#2b0a0a;
}

/* хороший рейтинг — БЕЛЫЙ */
.vote--good{
    color:#fff;
}

/* отличный рейтинг */
.vote--excellent{
    color:#7AE582;
}
        `;

        document.head.appendChild(style);
    }

    function applyVoteStyle(el) {
        if (!el || el.getAttribute('data-vote-modern')) return;

        var value = parseFloat(el.textContent);
        if (isNaN(value)) return;

        el.classList.remove(
            'vote--bad',
            'vote--good',
            'vote--excellent'
        );

        /* пороги */
        if (value < 5) {
            el.classList.add('vote--bad');
        } else if (value < 7.1) {
            el.classList.add('vote--good');
        } else {
            el.classList.add('vote--excellent');
        }

        el.setAttribute('data-vote-modern', '1');
    }

    function scanVotes(root) {
        root = root || document;
        var votes = root.querySelectorAll('.card__vote');

        for (var i = 0; i < votes.length; i++) {
            applyVoteStyle(votes[i]);
        }
    }

    function observeDOM() {
        var scheduled = false;

        var observer = new MutationObserver(function () {
            if (scheduled) return;
            scheduled = true;

            requestAnimationFrame(function () {
                scanVotes(document);
                scheduled = false;
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function bindActivityListener() {
        if (!Lampa.Storage || !Lampa.Storage.listener) return;

        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === 'activity') {
                requestAnimationFrame(function () {
                    scanVotes(document);
                });
            }
        });
    }

    function start() {
        registerManifest();
        injectCSS();
        scanVotes(document);
        observeDOM();
        bindActivityListener();
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();

