(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.__hide_home_lines_final) return;
    window.__hide_home_lines_final = true;

    var HIDE_COUNT = 4;
    var done = false;

    function tryRemove() {
        if (done) return;

        // строго главная
        if (!Lampa.Activity || Lampa.Activity.active() !== 'main') return;

        var lines = document.querySelectorAll('.items-line');

        // ждём пока реально появятся
        if (lines.length < HIDE_COUNT + 1) return;

        // удаляем первые
        for (var i = 0; i < HIDE_COUNT; i++) {
            if (lines[i]) {
                lines[i].remove();
            }
        }

        done = true;
    }

    // 1. пробуем сразу
    tryRemove();

    // 2. ждём появления DOM
    var observer = new MutationObserver(tryRemove);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
