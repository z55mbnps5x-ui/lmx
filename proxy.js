(function () { 
    'use strict';

    Lampa.Platform.tv();

    var plugin = {
        name: 'TMDB Proxy with Anti-DMCA',
        version: '1.0.4',
        description: 'Проксирование постеров и API TMDB с fallback и отключением DMCA'
    };

    // === PRIMARY / BACKUP ===
    var PRIMARY_IMAGE = 'tmdbimage.abmsx.tech';
    var PRIMARY_API   = 'https://api.themoviedb.org/3/';  // Правильный URL для API
    var BACKUP_IMAGE  = 'tmdbimg.bylampa.online';
    var BACKUP_API    = 'tmdbapi.bylampa.online/3/';

    var useBackup = false;

    // === Ваш API ключ TMDB ===
    var TMDB_API_KEY = 'beeaea735f286c364a3eb92273c0a6a2';  // Ваш API ключ

    // === Проверяем ТОЛЬКО картинки (API через img проверять нельзя) ===
    function checkImage(host) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = Lampa.Utils.protocol() + host + '/t/p/w92/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg';
        });
    }

    checkImage(PRIMARY_IMAGE).catch(function () {
        useBackup = true;
    });

    // === Пути ===
    function imagePath() {
        return Lampa.Utils.protocol() + (useBackup ? BACKUP_IMAGE : PRIMARY_IMAGE) + '/';
    }

    function apiPath() {
        return Lampa.Utils.protocol() + (useBackup ? BACKUP_API : PRIMARY_API);
    }

    // === TMDB IMAGE (как в твоём рабочем коде) ===
    Lampa.TMDB.image = function (url) {
        var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
        return Lampa.Storage.field('proxy_tmdb') ? imagePath() + url : base;
    };

    // === TMDB API (как в твоём рабочем коде) ===
    Lampa.TMDB.api = function (url) {
        var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url + '?api_key=' + TMDB_API_KEY;  // Добавлен API ключ
        return Lampa.Storage.field('proxy_tmdb') ? apiPath() + url : base;
    };

    function start() {
        if (window.anti_dmca_plugin) return;
        window.anti_dmca_plugin = true;

        // мягко отключаем dmca
        if (Lampa.Utils.dcma) {
            Lampa.Utils.dcma = function () { return undefined; };
        }

        var defaultSource = Lampa.Storage.get('source', 'cub');

        Lampa.Listener.follow('request_secuses', function (event) {
            if (event.data && event.data.blocked) {
                window.lampa_settings.dcma = [];

                var active = Lampa.Activity.active();
                if (active) {
                    active.source = 'tmdb';
                    Lampa.Storage.set('source', 'tmdb', true);
                    Lampa.Activity.replace(active);
                    Lampa.Storage.set('source', defaultSource, true);
                }
            }
        });

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'tmdb') {
                e.body.find('[data-parent="proxy"]').remove();
            }
        });

        console.log('[TMDB Proxy] enabled | backup:', useBackup);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') start();
        });
    }

})();
