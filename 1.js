(function () {
    'use strict';

    if (!window.Lampa) return;

    /* ===== СВОЯ ГЛАВНАЯ СТРАНИЦА ===== */

    function MyHomeSource() {
        this.network = new Lampa.Reguest();
        this.discovery = false;

        this.get = function (url, params, success, error) {
            this.network.silent(url, params, success, error);
        };

        this.main = function (params, onComplete, onError) {
            var owner = this;

            var parts = [

                // ТРЕНДЫ НЕДЕЛИ
                function (cb) {
                    owner.get('trending/all/week', params, function (json) {
                        json.title = 'Тренды недели';
                        cb(json);
                    }, cb);
                },

                // ТОП ФИЛЬМЫ
                function (cb) {
                    owner.get(
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
                    owner.get(
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
        };
    }

    /* ===== РЕГИСТРАЦИЯ И АКТИВАЦИЯ ===== */

    Lampa.Api.sources.my_home = MyHomeSource;

    // ДЕЛАЕМ ЭТУ ГЛАВНУЮ ОСНОВНОЙ
    Lampa.Storage.set('source', 'my_home');

})();
