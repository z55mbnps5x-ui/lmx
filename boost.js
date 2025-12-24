(function () {
    'use strict';

    if (typeof window.Lampa === 'undefined') return;

    if (window.__lampa_performance_booster) return;
    window.__lampa_performance_booster = true;

    var Booster = {
        id: 'performance_booster',
        version: '1.0.1',
        started: false,
        timers: {},
        limits: {
            mutation: 120,
            activity: 200,
            line: 100
        }
    };

    function start() {
        if (Booster.started) return;
        Booster.started = true;

        registerManifest();
        patchMutationObserver();
        patchListeners();
        patchTMDBCache();
        detectWeakDevice();
    }

    /* ======================
        MANIFEST
    ====================== */
    function registerManifest() {
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
        Lampa.Manifest.plugins[Booster.id] = {
            name: 'Performance Booster',
            version: Booster.version,
            description: 'Оптимизация DOM и событий'
        };
    }

    /* ======================
        DEBOUNCE
    ====================== */
    function debounce(key, fn, delay) {
        if (Booster.timers[key]) {
            clearTimeout(Booster.timers[key]);
        }
        Booster.timers[key] = setTimeout(fn, delay);
    }

    /* ======================
        MUTATION OBSERVER
    ====================== */
    function patchMutationObserver() {
        if (!window.MutationObserver) return;

        var NativeObserver = window.MutationObserver;

        window.MutationObserver = function (callback) {
            var wrapped = function (mutations, observer) {
                debounce(
                    'mutation',
                    function () {
                        callback(mutations, observer);
                    },
                    Booster.limits.mutation
                );
            };
            return new NativeObserver(wrapped);
        };
    }

    /* ======================
        LISTENER THROTTLE
    ====================== */
    function patchListeners() {
        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        if (Lampa.Listener.__booster_patched) return;
        Lampa.Listener.__booster_patched = true;

        var originalFollow = Lampa.Listener.follow;

        Lampa.Listener.follow = function (name, callback) {
            var throttled = function (event) {
                var type = event && event.type ? event.type : 'none';
                var key = name + '_' + type;

                debounce(
                    key,
                    function () {
                        callback(event);
                    },
                    Booster.limits.activity
                );
            };

            return originalFollow.call(this, name, throttled);
        };
    }

    /* ======================
        TMDB CACHE LIMIT
    ====================== */
    function patchTMDBCache() {
        if (!Lampa.TMDB || !Lampa.TMDB.api) return;

        if (Lampa.TMDB.__booster_cached) return;
        Lampa.TMDB.__booster_cached = true;

        var MAX_CACHE = 50;
        var cache = {};
        var order = [];

        var originalApi = Lampa.TMDB.api;

        Lampa.TMDB.api = function (url) {
            if (cache[url]) return cache[url];

            var result = originalApi.call(this, url);
            cache[url] = result;
            order.push(url);

            if (order.length > MAX_CACHE) {
                var old = order.shift();
                delete cache[old];
            }

            return result;
        };
    }

    /* ======================
        WEAK DEVICE MODE
    ====================== */
    function detectWeakDevice() {
        var isTV =
            Lampa.Platform &&
            Lampa.Platform.tv &&
            Lampa.Platform.tv();

        var lowRAM =
            typeof navigator.deviceMemory === 'number' &&
            navigator.deviceMemory <= 2;

        if (isTV || lowRAM) {
            Booster.limits.mutation = 200;
            Booster.limits.activity = 300;
            Booster.limits.line = 200;

            console.log('[Performance Booster] Weak device mode');
        }
    }

    /* ======================
        START
    ====================== */
    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') start();
        });
    }

})();
