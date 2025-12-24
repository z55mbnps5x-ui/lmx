(function () { 
    'use strict'; 

    /* ============ utils ============ */ 
    function getCountryFlag(code) { 
        if (!code || code.length !== 2) return ''; 
        return code.toUpperCase().split('').map(function (c) { 
            return String.fromCodePoint(127397 + c.charCodeAt(0)); 
        }).join(''); 
    } 

    const countryTranslations = { 
        DE: 'Германия', 
        RU: 'Россия', 
        US: 'США', 
        FR: 'Франция', 
        NL: 'Нидерланды', 
        GB: 'Великобритания', 
        PL: 'Польша', 
        UA: 'Украина', 
        KZ: 'Казахстан', 
        IT: 'Италия', 
        ES: 'Испания', 
        TR: 'Турция' 
    }; 

    function getLocalTime() { 
        const d = new Date(); 
        return d.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }); 
    } 

    /* ============ UI ============ */ 
    function showStartupBanner(info) { 
        if (document.getElementById('startup-info')) return;

        const box = document.createElement('div'); 
        box.id = 'startup-info'; 

        Object.assign(box.style, { 
            position: 'fixed', 
            bottom: '90px', 
            left: '50%', 
            transform: 'translateX(-50%) translateY(20px)', 
            background: 'linear-gradient(135deg, #1f1f1f, #2b2b2b)', 
            color: '#ffffff', 
            padding: '18px 26px', 
            borderRadius: '12px', 
            boxShadow: '0 12px 32px rgba(0,0,0,.7)', 
            textAlign: 'center', 
            zIndex: '9999', 
            opacity: '0', 
            transition: 'all .4s ease', 
            fontFamily: 'Arial, sans-serif', 
            minWidth: '280px', 
            lineHeight: '1.4' 
        });

        const title = document.createElement('div'); 
        title.textContent = '🌍 ' + info.country + ' ' + info.flag; 
        Object.assign(title.style, { 
            fontSize: '14px', 
            fontWeight: '700', 
            marginBottom: '6px' 
        }); 

        const city = document.createElement('div'); 
        city.textContent = info.city + ' · ' + info.time; 
        Object.assign(city.style, { 
            fontSize: '12px', 
            opacity: '0.9', 
            marginBottom: '4px' 
        }); 

        const isp = document.createElement('div'); 
        isp.textContent = 'Провайдер: ' + info.isp; 
        Object.assign(isp.style, { 
            fontSize: '11px', 
            opacity: '0.75', 
            marginBottom: '10px' 
        }); 

        const footer = document.createElement('div'); 
        footer.textContent = '@maksim8'; 
        Object.assign(footer.style, { 
            fontSize: '11px', 
            opacity: '0.45', 
            letterSpacing: '0.3px' 
        }); 

        box.appendChild(title); 
        box.appendChild(city); 
        box.appendChild(isp); 
        box.appendChild(footer); 

        document.body.appendChild(box); 

        requestAnimationFrame(function () { 
            box.style.opacity = '1'; 
            box.style.transform = 'translateX(-50%) translateY(0)'; 
        });

        setTimeout(function () { 
            box.style.opacity = '0'; 
            box.style.transform = 'translateX(-50%) translateY(20px)'; 
            setTimeout(function () { 
                box.remove(); 
            }, 400); 
        }, 6500); 
    }

    /* ============ logic ============ */ 
    function showInfoOnStart() {
        // Если окно уже показывалось в этой сессии, не показываем его снова
        if (sessionStorage.getItem('startup-info-shown')) return;

        fetch('https://ipapi.co/json/') 
            .then(function (r) { 
                return r.json(); 
            }) 
            .then(function (d) { 
                if (!d || !d.country) return;

                const code = d.country; 
                showStartupBanner({ 
                    country: countryTranslations[code] || d.country_name || code, 
                    flag: getCountryFlag(code), 
                    city: d.city || 'Неизвестный город', 
                    time: getLocalTime(), 
                    isp: d.org || d.org_name || 'Неизвестно' 
                });

                // Сохраняем информацию в sessionStorage, чтобы окно не показывалось снова в этой сессии
                sessionStorage.setItem('startup-info-shown', 'true');
            }) 
            .catch(function () {}); 
    }

    /* ============ init ============ */ 
    if (window.Lampa) { 
        showInfoOnStart(); 
    } 
})();
