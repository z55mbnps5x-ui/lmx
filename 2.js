(function () {
    'use strict';

    if (!window.Lampa) return;

    /* ==============================
       СВОЯ ГЛАВНАЯ СТРАНИЦА (SOURCE)
    ============================== */

    Lampa.Api.sources.my_home = function () {

        var network = new Lampa.Reguest();

        function get(url, params, success, error) {
            network.silent(url, params, success, error);
        }

        return {

            discovery: false,

            main: function (params, onComplete, onError) {

                var parts = [

                    // 1. ТРЕНДЫ НЕДЕЛИ
                    function (cb) {
                        get('trending/all/week', params, function (json) {
                            json.title = 'Тренды недели';
                            cb(json);
                        }, cb);
                    },

                    // 2. ТОП ФИЛЬМЫ
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

                    // 3. ТОП СЕРИАЛЫ
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
                    Lampa.Api.partNext(parts, 3, partLoaded, partEmpty);
                }

                load(onComplete, onError);
                return load;
            }
        };
    };

    /* ==============================
       ДЕЛАЕМ ЭТУ ГЛАВНУЮ ОСНОВНОЙ
    ============================== */

    Lampa.Storage.set('source', 'my_home');

})();
