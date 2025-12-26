(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Api) return;

    /* ===============================
       MY_HOME — CUSTOM MAIN SOURCE
       (точно как SourceTMDB)
    =============================== */

    var SourceMyHome = function () {

        var network = new Lampa.Reguest();
        this.discovery = false;

        this.get = function (url, params, success, error) {
            network.silent(url, params, success, error);
        };

        this.main = function () {
            var owner = this;

            var params     = arguments[0] || {};
            var onComplete = arguments[1];
            var onError    = arguments[2];

            var partsLimit = 10;

            var partsData = [

                // ТРЕНДЫ НЕДЕЛИ
                function (callback) {
                    owner.get('trending/all/week', params, function (json) {
                        json.title = 'Тренды недели';
                        callback(json);
                    }, callback);
                },

                // ТОП ФИЛЬМЫ
                function (callback) {
                    owner.get(
                        'discover/movie?sort_by=vote_average.desc&vote_count.gte=500',
                        params,
                        function (json) {
                            json.title = 'Топ фильмы';
                            callback(json);
                        },
                        callback
                    );
                },

                // ТОП СЕРИАЛЫ
                function (callback) {
                    owner.get(
                        'discover/tv?sort_by=vote_average.desc&vote_count.gte=500',
                        params,
                        function (json) {
                            json.title = 'Топ сериалы';
                            callback(json);
                        },
                        callback
                    );
                }
            ];

            function load(partLoaded, partEmpty) {
                Lampa.Api.partNext(partsData, partsLimit, partLoaded, partEmpty);
            }

            load(onComplete, onError);
            return load;
        };
    };

    /* ===============================
       РЕГИСТРАЦИЯ ИСТОЧНИКА
    =============================== */

    Lampa.Api.sources['my_home'] = new SourceMyHome();

    /* ===============================
       ДЕЛАЕМ ЕГО ОСНОВНЫМ
    =============================== */

    Lampa.Storage.set('source', 'my_home');

})();
