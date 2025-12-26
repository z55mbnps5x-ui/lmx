(function () {
    'use strict';

    var HIDE_COUNT = 4;
    var fixed = false;

    function fixHome() {
        var lines = document.querySelectorAll(
            '.items-line.items-line--type-default'
        );

        if (lines.length <= HIDE_COUNT) return;

        // 1. скрываем и отключаем навигацию
        for (var i = 0; i < HIDE_COUNT; i++) {
            var line = lines[i];

            line.style.display = 'none';
            line.classList.add('hide-by-plugin');

            // убираем из mapping
            line.querySelectorAll('.selector').forEach(function (el) {
                el.classList.remove('selector');
                el.setAttribute('tabindex', '-1');
            });
        }

        // 2. ставим фокус на первый ВИДИМЫЙ блок
        var firstVisible = lines[HIDE_COUNT];
        if (!firstVisible) return;

        var firstCard = firstVisible.querySelector('.selector');

        if (firstCard && !fixed) {
            fixed = true;

            setTimeout(function () {
                try {
                    Lampa.Controller.collectionSet(firstVisible);
                    Lampa.Controller.focus(firstCard);
                } catch (e) {}
            }, 100);
        }
    }

    // первый запуск
    fixHome();

    // слежение за подгрузкой
    var observer = new MutationObserver(function () {
        fixHome();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
