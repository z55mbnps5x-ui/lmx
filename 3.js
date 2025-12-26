(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Api || !Lampa.Api.sources) return;

    /* ======================================
       CUSTOM HOME SOURCE (LAMPA.MX FORMAT)
    ====================================== */

    var network = new Lampa.Reguest();

    function get(url, params, success, error) {
        network.silent(url, params, success, error);
    }

    Lampa.Api.sources.my_home = {

        // обязательные поля (как в tmdb)
        discovery: false,
        search: false,
        person: false,
        tv: false,
        movie: false,

        /* ===== ГЛАВНАЯ СТРАНИЦА ===== */
        main: function (params, onComplete, onError) {

            var parts = [

                // ТРЕНДЫ НЕДЕЛИ
                function (cb) {
                    get('trending/all/week', params, function (json) {
                        json.title = 'Тренды недели';
                        cb(json);
                    }, cb);
                },

                // ТОП ФИЛЬМЫ
                function (cb) {
                    get(
                        'discover/movie?sort_by=vote_average.desc&vote_count.gte=500',
                        params,
                        function (json) {
                            json.title = 'Топ фильмы';
                            cb(json);
                        },
                        cb
                    );
                },

                // ТОП СЕРИАЛЫ
                function (cb) {
                    get(
                        'discover/tv?sort_by=vote_average.desc&vote_count.gte=500',
                        params,
                        function (json) {
                            json.title = 'Топ сериалы';
                            cb(json);
                        },
                        cb
                    );
                }
            ];

            function load(partLoaded, partEmpty) {
                Lampa.Api.partNext(parts, parts.length, partLoaded, partEmpty);
            }

            load(onComplete, onError);
            return load;
        }
    };

    /* ===== ДЕЛАЕМ ИСТОЧНИК ОСНОВНЫМ ===== */
    Lampa.Storage.set('source', 'my_home');

})();
