(() => {
    const consultForm = document.querySelector('[data-consult-form]');
    const langToggle = document.querySelector('[data-lang-toggle]');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    const STORAGE_KEY = 'hyts_lang';
    const COOKIE_NAME = 'googtrans';
    const COOKIE_DOMAIN = `;domain=${window.location.hostname}`;

    if (consultForm) {
        consultForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(consultForm);
            const name = String(formData.get('name') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const message = String(formData.get('message') || '').trim();

            const subject = encodeURIComponent('[\uc785\ud559 \uc0c1\ub2f4 \uc694\uccad] \ud648\ud398\uc774\uc9c0 \ubb38\uc758');
            const body = encodeURIComponent(
                `\uc774\ub984: ${name}\n\uc5f0\ub77d\ucc98: ${phone}\n\uc774\uba54\uc77c \uc8fc\uc18c: ${email}\n\ubb38\uc758\uc0ac\ud56d:\n${message}`
            );

            window.location.href = `mailto:yjisc@naver.com?subject=${subject}&body=${body}`;
        });
    }

    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener('toggle', () => {
            if (!dropdown.open) return;
            dropdowns.forEach((otherDropdown) => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.open = false;
                }
            });
        });
    });

    document.addEventListener('click', (event) => {
        dropdowns.forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                dropdown.open = false;
            }
        });
    });

    function setTranslateCookie(value) {
        const cookieValue = `${COOKIE_NAME}=${value};path=/`;
        document.cookie = cookieValue;
        document.cookie = cookieValue + COOKIE_DOMAIN;
    }

    function clearTranslateCookie() {
        document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/` + COOKIE_DOMAIN;
    }

    function loadGoogleTranslate() {
        if (window.google && window.google.translate) return;
        if (document.querySelector('script[data-google-translate]')) return;

        window.googleTranslateElementInit = function () {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'ko',
                    includedLanguages: 'en,ko',
                    autoDisplay: false,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                },
                'google_translate_element'
            );
        };

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.dataset.googleTranslate = 'true';
        document.head.appendChild(script);
    }

    function waitForTranslateCombo(callback, attempts = 0) {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            callback(combo);
            return;
        }
        if (attempts > 40) return;
        window.setTimeout(() => waitForTranslateCombo(callback, attempts + 1), 250);
    }

    function updateToggleLabel(lang) {
        if (!langToggle) return;
        langToggle.textContent = lang === 'en' ? 'KOR' : 'ENG';
    }

    function applyLanguage(lang) {
        if (lang === 'en') {
            setTranslateCookie('/ko/en');
        } else {
            clearTranslateCookie();
        }

        localStorage.setItem(STORAGE_KEY, lang);
        updateToggleLabel(lang);
        loadGoogleTranslate();

        waitForTranslateCombo((combo) => {
            if (combo.value !== lang) {
                combo.value = lang;
                combo.dispatchEvent(new Event('change'));
            }
        });

        window.setTimeout(() => {
            window.location.reload();
        }, 250);
    }

    const savedLang = localStorage.getItem(STORAGE_KEY) || 'ko';
    updateToggleLabel(savedLang);
    loadGoogleTranslate();

    window.addEventListener('load', () => {
        if (savedLang === 'en') {
            setTranslateCookie('/ko/en');
            waitForTranslateCombo((combo) => {
                if (combo.value !== 'en') {
                    combo.value = 'en';
                    combo.dispatchEvent(new Event('change'));
                }
            });
        } else {
            clearTranslateCookie();
        }
    });

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const nextLang = (localStorage.getItem(STORAGE_KEY) || 'ko') === 'en' ? 'ko' : 'en';
            applyLanguage(nextLang);
        });
    }
})();
