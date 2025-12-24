(function () {
    'use strict';

    /* ================= PRE FILTERS ================= */

    function applyPreFilters(url) {
        if (
            url.indexOf(Lampa.TMDB.api('')) === -1 ||
            url.indexOf('/search') !== -1 ||
            url.indexOf('/person/') !== -1
        ) return url;

        // минимум голосов
        if (url.indexOf('vote_count.gte') === -1) {
            url += '&vote_count.gte=1';
        }

        // минимум рейтинг
        if (url.indexOf('vote_average.gte') === -1) {
            url += '&vote_average.gte=5';
        }

        // исключаем adult
        if (url.indexOf('include_adult') === -1) {
            url += '&include_adult=false';
        }

        // режем reality / talk / news / soap
        if (url.indexOf('without_genres') === -1) {
            url += '&without_genres=10763,10764,10766,10767';
        }

        // режем мусорные keyword
        var excluded = [
            '346488', // asian drama
            '158718', // anime
            '41278',  // soap
            '210024'  // talk show
        ];

        if (url.indexOf('without_keywords') === -1) {
            url += '&without_keywords=' + excluded.join(',');
        }

        // старьё
        if (url.indexOf('primary_release_date.gte') === -1) {
            url += '&primary_release_date.gte=1990-01-01';
        }

        return url;
    }

    /* ================= POST FILTERS ================= */

    function applyPostFilters(results) {
        if (!Array.isArray(results)) return results;

        return results.filter(function (item) {
            if (!item) return false;

            /* adult */
            if (item.adult === true) return false;

            /* язык */
            var lang = (item.original_language || '').toLowerCase();

            // жёсткий бан языков
            if (
                lang === 'zh' ||
                lang === 'ja' ||
                lang === 'ko' ||
                lang === 'th' ||
                lang === 'vi' ||
                lang === 'hi' ||
                lang === 'id' ||
                lang === 'tl'
            ) return false;

            /* страны */
            if (item.origin_country && item.origin_country.length) {
                var bannedCountries = ['CN', 'JP', 'KR', 'TH', 'IN', 'PH', 'ID', 'VN'];
                for (var i = 0; i < item.origin_country.length; i++) {
                    if (bannedCountries.indexOf(item.origin_country[i]) !== -1) {
                        return false;
                    }
                }
            }

            /* дата */
            var date = item.release_date || item.first_air_date || '';
            var year = parseInt(date.slice(0, 4));
            if (!year || year < 1990) return false;

            /* постер */
            if (!item.poster_path) return false;

            /* runtime (если есть) */
            if (item.runtime && item.runtime < 60) return false;

            /* RU / UA — всегда пускаем */
            if (lang === 'ru' || lang === 'uk') return true;

            /* рейтинг */
            if ((item.vote_count || 0) < 30) return false;
            if ((item.vote_average || 0) < 6) return false;

            return true;
        });
    }

    /* ================= HELPERS ================= */

    function hasMorePage(data) {
        return !!data &&
            Array.isArray(data.results) &&
            data.original_length !== data.results.length &&
            data.page === 1 &&
            data.total_pages > 1;
    }

    /* ================= INIT ================= */

    function start() {
        if (window.trash_filter_plugin) return;
        window.trash_filter_plugin = true;

        // PRE
        Lampa.Listener.follow('request', function (event) {
            if (event.params && event.params.url) {
                event.params.url = applyPreFilters(event.params.url);
            }
        });

        // POST
        Lampa.Listener.follow('request_secuses', function (event) {
            if (event.data && Array.isArray(event.data.results)) {
                event.data.original_length = event.data.results.length;
                event.data.results = applyPostFilters(event.data.results);
            }
        });

        // кнопка "ЕЩЁ"
        Lampa.Listener.follow('line', function (event) {
            if (event.type !== 'visible' || !hasMorePage(event.data)) return;

            var head = $(event.body.closest('.items-line')).find('.items-line__head');
            if (head.find('.items-line__more').length) return;

            var btn = $('<div class="items-line__more selector">' + Lampa.Lang.translate('more') + '</div>');
            btn.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: event.data.url,
                    title: event.data.title || Lampa.Lang.translate('title_category'),
                    component: 'category_full',
                    page: 1,
                    genres: event.params.genres,
                    filter: event.data.filter,
                    source: event.data.source || event.params.object.source
                });
            });

            head.append(btn);
        });
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
