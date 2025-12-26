(function () {
    'use strict';

    function hideLines() {
        var lines = document.querySelectorAll(
            '.items-line.items-line--type-default'
        );

        if (!lines.length) return;

        for (var i = 0; i < 4 && i < lines.length; i++) {
            lines[i].style.display = 'none';
        }
    }

    // первичный вызов
    hideLines();

    // наблюдатель на динамическую подгрузку
    var observer = new MutationObserver(function () {
        hideLines();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
