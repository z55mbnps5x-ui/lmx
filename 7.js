(function () {
    'use strict';

    if (!window.Lampa) return;

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

    /* ===============================
       SOURCE
    =============================== */

    var SourceMyHome = function () {

        this.discovery = false;

        this.main = function (params, onComplete, onError) {

            var parts = [

                // 🔥 ТРЕНДЫ НЕДЕЛИ
                function (callback) {
                    tmdb('trending/all/week', { page: 1 }, function (json) {
                        callback({
                            title: 'Тренды недели',
                            source: 'tmdb',
                            results: json.results || []
                        });
                    }, callback);
                },

                // 🎬 ТОП ФИЛЬМЫ
                function (callback) {
                    tmdb('discover/movie', {
                        sort_by: 'vote_average.desc',
                        vote_count.gte: 500,
                        page: 1
                    }, function (json) {
                        callback({
                            title: 'Топ фильмы',
                            source: 'tmdb',
                            results: json.results || []
                        });
                    }, callback);
                },

                // 📺 ТОП СЕРИАЛЫ
                function (callback) {
                    tmdb('discover/tv', {
                        sort_by: 'vote_average.desc',
                        vote_count.gte: 500,
                        page: 1
                    }, function (json) {
                        callback({
                            title: 'Топ сериалы',
                            source: 'tmdb',
                            results: json.results || []
                        });
                    }, callback);
                }
            ];

            function load(partLoaded, partEmpty) {
                Lampa.Api.partNext(parts, parts.length, partLoaded, partEmpty);
            }

            load(onComplete, onError);
            return load;
        };
    };

    /* ===============================
       РЕГИСТРАЦИЯ SOURCE
    =============================== */

    Lampa.Api.sources.my_home = new SourceMyHome();

    // делаем источником по умолчанию
    Lampa.Storage.set('source', 'my_home');

})();
