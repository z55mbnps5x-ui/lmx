(function () {
    'use strict';

    Lampa.Platform.tv();

    /* =========================
       CONFIG
    ========================= */

    var TMDB_API_KEY = 'beeaea735f286c364a3eb92273c0a6a2';

    // PRIMARY / BACKUP (БЕЗ ПРОТОКОЛА)
    var PRIMARY_IMAGE = 'tmdbimage.abmsx.tech/';
    var BACKUP_IMAGE  = 'tmdbimg.bylampa.online/';

    var PRIMARY_API   = 'api.themoviedb.org/3/';
    var BACKUP_API    = 'tmdbapi.bylampa.online/3/';

    var useBackup = false;

    /* =========================
       CHECK IMAGE PROXY
    ========================= */

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

    function imageHost() {
        return useBackup ? BACKUP_IMAGE : PRIMARY_IMAGE;
    }

    function apiHost() {
        return useBackup ? BACKUP_API : PRIMARY_API;
    }

    /* =========================
       TMDB IMAGE
    ========================= */

    Lampa.TMDB.image = function (url) {
        if (!url) return '';

        return Lampa.Storage.field('proxy_tmdb')
            ? Lampa.Utils.protocol() + imageHost() + url
            : Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
    };

    /* =========================
       TMDB API
    ========================= */

    Lampa.TMDB.api = function (url) {
        var query = url.indexOf('?') > -1 ? '&' : '?';
        var full  = url + query + 'api_key=' + TMDB_API_KEY;

        return Lampa.Storage.field('proxy_tmdb')
            ? Lampa.Utils.protocol() + apiHost() + full
            : Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + full;
    };

    /* =========================
       START
    ========================= */

    function start() {
        if (window.tmdb_proxy_prod) return;
        window.tmdb_proxy_prod = true;

        // мягко отключаем DMCA
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

        // убираем пункт proxy из настроек TMDB
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'tmdb') {
                e.body.find('[data-parent="proxy"]').remove();
            }
        });

        console.log(
            '[TMDB PROXY PROD] enabled | backup:',
            useBackup ? 'ON' : 'OFF'
        );
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
