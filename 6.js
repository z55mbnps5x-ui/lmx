(function () {
    'use strict';

    if (!window.Lampa) return;

    /* ==========================
       НАСТРОЙКИ
    ========================== */

    var TMDB_API_KEY = 'beeaea735f286c364a3eb92273c0a6a2';
    var TMDB_URL = 'https://api.themoviedb.org/3/';
    var LANGUAGE = 'ru-RU';

    function tmdb(endpoint, params, success, error) {
        params = params || {};
        params.api_key = TMDB_API_KEY;
        params.language = LANGUAGE;

        var query = Object.keys(params)
            .map(k => k + '=' + encodeURIComponent(params[k]))
            .join('&');

        fetch(TMDB_URL + endpoint + '?' + query)
            .then(r => r.json())
            .then(success)
            .catch(error || function () {});
    }

    /* ==========================
       SOURCE MY_HOME (TMDB)
    ========================== */

    var SourceMyHome = function () {

        this.discovery = false;

        this.main = function () {
            var params     = arguments[0] || {};
            var onComplete = arguments[1];
            var onError    = arguments[2];

            var parts = [

                // 🔥 ТРЕНДЫ НЕДЕЛИ
                function (cb) {
                    tmdb('trending/all/week', { page: 1 }, function (json) {
                        json.title = 'Тренды недели';
                        json.results = json.results || [];
                        cb(json);
                    }, cb);
                },

                // 🎬 ТОП ФИЛЬМЫ
                function (cb) {
                    tmdb('discover/movie', {
                        sort_by: 'vote_average.desc',
                        vote_count.gte: 500,
                        page: 1
                    }, function (json) {
                        json.title = 'Топ фильмы';
                        json.results = json.results || [];
                        cb(json);
                    }, cb);
                },

                // 📺 ТОП СЕРИАЛЫ
                function (cb) {
                    tmdb('discover/tv', {
                        sort_by: 'vote_average.desc',
                        vote_count.gte: 500,
                        page: 1
                    }, function (json) {
                        json.title = 'Топ сериалы';
                        json.results = json.results || [];
                        cb(json);
                    }, cb);
                }
            ];

            function load(partLoaded, partEmpty) {
                Lampa.Api.partNext(parts, parts.length, partLoaded, partEmpty);
            }

            load(onComplete, onError);
            return load;
        };
    };

    /* ==========================
       РЕГИСТРАЦИЯ
    ========================== */

    Lampa.Api.sources.my_home = new SourceMyHome();
    Lampa.Storage.set('source', 'my_home');

})();
