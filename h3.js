(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.__hide_home_lines_new_ui) return;
    window.__hide_home_lines_new_ui = true;

    var HIDE_COUNT = 4;
    var focused = false;

    function apply() {
        // только главная
        if (!Lampa.Activity || Lampa.Activity.active() !== 'main') return;

        var mappings = document.querySelectorAll(
            '.scroll__body.mapping--line'
        );

        if (mappings.length <= HIDE_COUNT) return;

        // 1. отключаем первые mapping-линии
        for (var i = 0; i < HIDE_COUNT; i++) {
            var map = mappings[i];
            if (!map) continue;

            // убираем selector
            map.querySelectorAll('.selector').forEach(function (el) {
                el.classList.remove('selector');
                el.setAttribute('tabindex', '-1');
            });

            // скрываем родительский items-line
            var itemsLine = map.closest('.items-line');
            if (itemsLine) {
                itemsLine.style.display = 'none';
            }
        }

        // 2. ставим фокус на первую видимую линию
        if (!focused) {
            focused = true;

            var targetMap = mappings[HIDE_COUNT];
            if (!targetMap) return;

            var targetCard = targetMap.querySelector('.card');

            if (targetCard) {
                setTimeout(function () {
                    try {
                        Lampa.Controller.collectionSet(targetMap);
                        Lampa.Controller.focus(targetCard);
                    } catch (e) {}
                }, 200);
            }
        }
    }

    // старт
    apply();

    // наблюдение за динамикой
    var observer = new MutationObserver(apply);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
