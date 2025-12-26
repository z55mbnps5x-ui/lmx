(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // Сколько первых строк скрыть/удалить
    var HIDE_FIRST_N = 4;

    // Если хочешь скрывать строго по названиям — раскомментируй нужные
    var HIDE_TITLES = [
        // 'Сейчас смотрят',
        // 'Сегодня в тренде',
        // 'В тренде за неделю',
        // 'Смотрите в кинозалах'
    ];

    // Служебное: чтобы не цепляться повторно к одному и тому же рендеру
    var lastAttachedTo = null;

    function textOfTitle(line) {
        var t = line.querySelector('.items-line__title');
        if (!t) return '';
        return (t.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function isMainActivity() {
        var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
        return !!(active && active.component === 'main' && active.activity && active.activity.render);
    }

    function getMainVerticalBody(render) {
        // В главной есть горизонтальные скроллы внутри строк,
        // нам нужен именно вертикальный контейнер со строками.
        // Обычно это: .scroll--mask.scroll--over .scroll__body
        var body = render && render.find ? render.find('.scroll--mask.scroll--over .scroll__body').get(0) : null;
        if (!body) {
            // запасной вариант
            body = render && render.get ? render.get(0).querySelector('.scroll--mask .scroll__body') : null;
        }
        return body || null;
    }

    function refreshController(render) {
        // Наша цель: после удаления строк фокус сразу стал на первый реальный элемент.
        // Самый безопасный трюк в Lampa-плагинах: "перетогглить" текущий контроллер.
        try {
            var enabled = Lampa.Controller && Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;
            var name = enabled && enabled.name ? enabled.name : null;

            // Чаще всего на главной активен 'content'
            if (name) {
                setTimeout(function () {
                    Lampa.Controller.toggle(name);
                }, 0);
            } else {
                setTimeout(function () {
                    Lampa.Controller.toggle('content');
                }, 0);
            }
        } catch (e) { }
    }

    function removeLine(line) {
        if (!line || !line.parentNode) return;

        // На всякий случай сначала убираем селекторы, чтобы фокус точно не мог туда попасть
        var selectors = line.querySelectorAll('.selector');
        for (var i = 0; i < selectors.length; i++) selectors[i].classList.remove('selector');

        line.parentNode.removeChild(line);
    }

    function applyFilter(render) {
        var body = getMainVerticalBody(render);
        if (!body) return;

        // Удаляем первые N строк
        var lines = body.querySelectorAll(':scope > .items-line');
        var removed = 0;

        for (var i = 0; i < lines.length; i++) {
            if (removed >= HIDE_FIRST_N) break;

            var title = textOfTitle(lines[i]);

            // Если список названий задан — можно удалять только совпадающие
            // (либо оставить HIDE_TITLES пустым — тогда удаляем просто первые N)
            if (HIDE_TITLES.length) {
                if (HIDE_TITLES.indexOf(title) === -1) continue;
            }

            removeLine(lines[i]);
            removed++;
        }

        if (removed > 0) refreshController(render);
    }

    function attachObserver() {
        if (!isMainActivity()) return;

        var active = Lampa.Activity.active();
        var render = active.activity.render();

        if (!render || !render.get) return;

        var root = render.get(0);
        if (!root || lastAttachedTo === root) return;
        lastAttachedTo = root;

        // 1) Сразу пробуем подчистить то, что уже отрисовалось
        applyFilter(render);

        // 2) И ставим наблюдатель — потому что строки догружаются/перерисовываются
        var body = getMainVerticalBody(render);
        if (!body) return;

        var observer = new MutationObserver(function (mutations) {
            var need = false;

            for (var m = 0; m < mutations.length; m++) {
                if (mutations[m].addedNodes && mutations[m].addedNodes.length) {
                    need = true;
                    break;
                }
            }

            if (need) applyFilter(render);
        });

        observer.observe(body, { childList: true });

        // Отвязка при уходе со страницы
        // (на случай если активити поменялась, а DOM ещё жив)
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                var a = Lampa.Activity.active();
                if (!a || a.component !== 'main') {
                    try { observer.disconnect(); } catch (x) { }
                    lastAttachedTo = null;
                }
            }
        });
    }

    function start() {
        if (window.hide_first_lines_plugin) return;
        window.hide_first_lines_plugin = true;

        // При старте/переключении активити пробуем подключиться
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                setTimeout(attachObserver, 0);
            }
        });

        // На всякий случай — когда уже на главной и плагин загрузился позже
        setTimeout(attachObserver, 0);
        setTimeout(attachObserver, 500);
        setTimeout(attachObserver, 1500);
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
