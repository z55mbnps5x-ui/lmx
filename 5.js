(function () {
    'use strict';

    if (!window.Lampa || !Lampa.Api) return;

    /* =========================================
       MY_HOME — CUSTOM HOME (REAL LAMPA WAY)
    ========================================= */

    var SourceMyHome = function () {

        var network = new Lampa.Reguest();

        this.discovery = false;

        this.trending = function (params, callback) {
            network.silent('trending', {
                type: 'all',
                period: 'week',
                page: 1
            }, callback, callback);
        };

        this.topMovies = function (params, callback) {
            network.silent('discover', {
                type: 'movie',
                sort_by: 'vote_average.desc',
                vote_count_gte: 500,
                page: 1
            }, callback, callback);
        };

        this.topTv = function (params, callback) {
            network.silent('discover', {
                type: 'tv',
                sort_by: 'vote_average.desc',
                vote_count_gte: 500,
                page: 1
            }, callback, callback);
        };

        this.main = function () {
            var owner = this;

            var params     = arguments[0] || {};
            var onComplete = arguments[1];
            var onError    = arguments[2];

            var parts = [

                // ТРЕНДЫ НЕДЕЛИ
                function (call) {
                    owner.trending(params, function (json) {
                        json.title = 'Тренды недели';
                        call(json);
                    });
                },

                // ТОП ФИЛЬМЫ
                function (call) {
                    owner.topMovies(params, function (json) {
                        json.title = 'Топ фильмы';
                        call(json);
                    });
                },

                // ТОП СЕРИАЛЫ
                function (call) {
                    owner.topTv(params, function (json) {
                        json.title = 'Топ сериалы';
                        call(json);
                    });
                }
            ];

            function load(partLoaded, partEmpty) {
                Lampa.Api.partNext(parts, parts.length, partLoaded, partEmpty);
            }

            load(onComplete, onError);
            return load;
        };
    };

    /* =========================================
       REGISTER + SET AS MAIN
    ========================================= */

    Lampa.Api.sources.my_home = new SourceMyHome();
    Lampa.Storage.set('source', 'my_home');

})();
