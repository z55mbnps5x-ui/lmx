(function () {
    'use strict';

    if (typeof window.Lampa === 'undefined') return;
    if (window.__lampa_hide_home_lines) return;
    window.__lampa_hide_home_lines = true;

    var Plugin = {
        id: 'hide_home_lines',
        version: '1.0.0',
        hide_count: 4,
        applied: false
    };

    /* ======================
        MANIFEST
    ====================== */
    function registerManifest() {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
        Lampa.Manifest.plugins[Plugin.id] = {
            name: 'Hide Home Lines',
            version: Plugin.version,
            description: 'Скрывает первые строки на главной странице'
        };
    }

    /* ======================
        CORE LOGIC
    ====================== */
    function applyFix() {
        // работаем только на главной
        if (!Lampa.Activity || Lampa.Activity.active() !== 'main') return;

        var lines = document.querySelectorAll(
            '.items-line.items-line--type-default'
        );

        if (lines.length <= Plugin.hide_count) return;

        // 1. Скрываем первые строки + убираем из navigation
        for (var i = 0; i < Plugin.hide_count; i++) {
            var line = lines[i];
            if (!line) continue;

            line.style.display = 'none';

            line.querySelectorAll('.selector').forEach(function (el) {
                el.classList.remove('selector');
                el.setAttribute('tabindex', '-1');
            });
        }

        // 2. Ставим фокус на первый видимый блок (один раз)
        if (!Plugin.applied) {
            Plugin.applied = true;

            var targetLine = lines[Plugin.hide_count];
            if (!targetLine) return;

            var targetCard = targetLine.querySelector('.card.selector');

            if (targetCard && Lampa.Controller) {
                setTimeout(function () {
                    try {
                        Lampa.Controller.collectionSet(targetLine);
                        Lampa.Controller.focus(targetCard);
                    } catch (e) {}
                }, 150);
            }
        }
    }

    /* ======================
        OBSERVER
    ====================== */
    function initObserver() {
        var observer = new MutationObserver(function () {
            applyFix();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /* ======================
        START
    ====================== */
    function start() {
        registerManifest();
        applyFix();
        initObserver();
    }

    start();

})();
