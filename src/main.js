import { translations } from './data/translations.js';
import { PAYPAL_LINK, STRIPE_LINK, CRYPTO_ADDRESSES } from './data/donations.js';
import { TIME_ZONES } from './data/timezones.js';
import { APP_INFO, APP_VERSION } from './data/app-info.js';
import { readStorage, writeStorage } from './js/storage.js';
import { setupEscapeHandling } from './js/accessibility.js';
import { downloadBackup, readBackupFile, BACKUP_TEXT } from './js/backup.js';
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.warn('Service worker registration failed.', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
            const elements = {
                sat: document.getElementById('sat'), datum: document.getElementById('datum'), clockContainer: document.querySelector('.clock-container'),
                settingsMenu: document.querySelector('.settings-menu'), settingsPanel: document.querySelector('.settings-panel'),
                brightness: document.getElementById('brightness'), contrast: document.getElementById('contrast'), showSecondsCheckbox: document.getElementById('showSecondsCheckbox'), showDateCheckbox: document.getElementById('showDateCheckbox'),
                timeFormatSelect: document.getElementById('timeFormat'), dateFormatSelect: document.getElementById('dateFormat'), languageSelect: document.getElementById('languageSelect'), fontSelect: document.getElementById('fontSelect'),
                satFontSize: document.getElementById('satFontSize'), datumFontSize: document.getElementById('datumFontSize'), satFontColor: document.getElementById('satFontColor'), datumFontColor: document.getElementById('datumFontColor'),
                backgroundColor: document.getElementById('backgroundColor'), resetButton: document.getElementById('resetButton'), nightModeToggle: document.getElementById('nightModeToggle'), nightModeIcon: document.getElementById('nightModeIcon'),
                autoSizeCheckbox: document.getElementById('autoSizeCheckbox'), autoSizeLabel: document.getElementById('autoSizeLabel'), autoSizeLabelSpan: document.getElementById('autoSizeLabelSpan'), satFontSizeLabel: document.getElementById('satFontSizeLabel'),
                datumFontSizeLabel: document.getElementById('datumFontSizeLabel'), infoButton: document.getElementById('infoButton'), infoSidePanel: document.getElementById('infoSidePanel'), infoSidePanelCloseButton: document.getElementById('infoSidePanelCloseButton'),
                infoSidePanelContent: document.getElementById('infoSidePanelContent'), settingsTitle: document.getElementById('settingsTitle'), languageLabelSpan: document.querySelector('#languageLabel span'),
                brightnessLabelSpan: document.querySelector('#brightnessLabel span'), contrastLabelSpan: document.querySelector('#contrastLabel span'), timeFormatLabelSpan: document.querySelector('#timeFormatLabel span'),
                showSecondsLabelSpan: document.querySelector('#showSecondsLabel span'), showDateLabelSpan: document.querySelector('#showDateLabel span'), fontLabelSpan: document.querySelector('#fontLabel span'),
                dateFormatLabelSpan: document.querySelector('#dateFormatLabel span'), satFontSizeLabelSpan: document.querySelector('#satFontSizeLabel span'), datumFontSizeLabelSpan: document.querySelector('#datumFontSizeLabel span'),
                satFontColorLabelSpan: document.querySelector('#satFontColorLabel span'), datumFontColorLabelSpan: document.querySelector('#datumFontColorLabel span'), backgroundColorLabelSpan: document.querySelector('#backgroundColorLabel span'),
                resetButtonText: document.getElementById('resetButtonText'), profilesHeaderLabel: document.getElementById('profilesHeaderLabel'), profileNameInput: document.getElementById('profileName'),
                profileNameLabel: document.getElementById('profileNameLabel'), saveProfileButton: document.getElementById('saveProfileButton'), saveProfileButtonText: document.getElementById('saveProfileButtonText'),
                profileSelect: document.getElementById('profileSelect'), profileSelectLabel: document.getElementById('profileSelectLabel'), loadProfileButton: document.getElementById('loadProfileButton'),
                loadProfileButtonText: document.getElementById('loadProfileButtonText'), deleteProfileButton: document.getElementById('deleteProfileButton'), deleteProfileButtonText: document.getElementById('deleteProfileButtonText'),
                fullscreenButton: document.querySelector('.fullscreen-toggle'), fullscreenIcon: document.getElementById('fullscreenIcon'),
                metaDescription: document.querySelector('meta[name="description"]'), metaKeywords: document.querySelector('meta[name="keywords"]'),
                
                // Timer elements
                timerAppButton: document.getElementById('timerAppButton'), timerContainer: document.getElementById('timerContainer'), closeTimerButton: document.getElementById('closeTimerButton'), timerTitle: document.getElementById('timerTitle'),
                timerDisplay: document.getElementById('timerDisplay'), timerHours: document.getElementById('timerHours'), timerMinutes: document.getElementById('timerMinutes'), timerSeconds: document.getElementById('timerSeconds'),
                timerHoursLabel: document.getElementById('timerHoursLabel'), timerMinutesLabel: document.getElementById('timerMinutesLabel'), timerSecondsLabel: document.getElementById('timerSecondsLabel'),
                startPauseTimer: document.getElementById('startPauseTimer'), resetTimer: document.getElementById('resetTimer'), timerStartLabel: document.getElementById('timerStartLabel'), timerResetLabel: document.getElementById('timerResetLabel'),

                // Stopwatch elements
                stopwatchAppButton: document.getElementById('stopwatchAppButton'), stopwatchContainer: document.getElementById('stopwatchContainer'), closeStopwatchButton: document.getElementById('closeStopwatchButton'),
                stopwatchTitle: document.getElementById('stopwatchTitle'), stopwatchDisplay: document.getElementById('stopwatchDisplay'), startPauseStopwatch: document.getElementById('startPauseStopwatch'),
                lapStopwatch: document.getElementById('lapStopwatch'), resetStopwatch: document.getElementById('resetStopwatch'), lapsContainer: document.getElementById('lapsContainer'), lapsTitle: document.getElementById('lapsTitle'),
                lapsList: document.getElementById('lapsList'), stopwatchStartLabel: document.getElementById('stopwatchStartLabel'), stopwatchLapLabel: document.getElementById('stopwatchLapLabel'), stopwatchResetLabel: document.getElementById('stopwatchResetLabel'),

                // World Clock elements
                worldClockAppButton: document.getElementById('worldClockAppButton'), worldClockContainer: document.getElementById('worldClockContainer'), closeWorldClockButton: document.getElementById('closeWorldClockButton'),
                worldClockTitle: document.getElementById('worldClockTitle'), worldClockCitySelect: document.getElementById('worldClockCitySelect'), addWorldClockCity: document.getElementById('addWorldClockCity'),
                worldClocksGrid: document.getElementById('worldClocksGrid'), worldClockAddBtn: document.getElementById('worldClockAddBtn'),
                
                // Alarm elements
                alarmAppButton: document.getElementById('alarmAppButton'), alarmContainer: document.getElementById('alarmContainer'), closeAlarmButton: document.getElementById('closeAlarmButton'),
                alarmTitle: document.getElementById('alarmTitle'), alarmHourSelect: document.getElementById('alarmHourSelect'), alarmMinuteSelect: document.getElementById('alarmMinuteSelect'),
                setAlarmButton: document.getElementById('setAlarmButton'), alarmsListContainer: document.getElementById('alarmsListContainer'), alarmsListTitle: document.getElementById('alarmsListTitle'),
                alarmsList: document.getElementById('alarmsList'), alarmSetBtn: document.getElementById('alarmSetBtn'),
                alarmRingingModal: document.getElementById('alarmRingingModal'), stopAlarmButton: document.getElementById('stopAlarmButton'),
                alarmRingingTitle: document.getElementById('alarmRingingTitle')
            };

            const backupElements = {
                title: document.getElementById('backupHeaderLabel'),
                exportButton: document.getElementById('exportBackupButton'),
                exportText: document.getElementById('exportBackupButtonText'),
                importButton: document.getElementById('importBackupButton'),
                importText: document.getElementById('importBackupButtonText'),
                fileInput: document.getElementById('backupImportInput')
            };

            function getBackupText() {
                const language = elements.languageSelect?.value || 'en';
                return BACKUP_TEXT[language] || BACKUP_TEXT.en;
            }

            function updateBackupUI() {
                const text = getBackupText();
                backupElements.title.lastChild.textContent = ` ${text.title}`;
                backupElements.exportText.textContent = text.export;
                backupElements.importText.textContent = text.import;
                backupElements.fileInput.setAttribute('aria-label', text.selectFile);
            }
            let isNightModeActive = false, currentTranslations = {};
            let timerInterval = null, timerSecondsRemaining = 0, initialTimerSeconds = 0, isTimerRunning = false;
            let audioContext = null;
            let stopwatchInterval = null, stopwatchStartTime = 0, stopwatchElapsedTime = 0, isStopwatchRunning = false, lapTimes = [];
            let worldClockInterval = null;
            const WORLD_CLOCK_KEY = 'worldClockCitiesList';
            let alarms = [];
            const ALARM_KEY = 'clockAlarmsList';
            let currentAlarmSound = { oscillator: null, timeoutId: null };

            const AUTO_SIZE_SAT_VW = 18, AUTO_SIZE_DATUM_VW = 8, DEFAULT_MANUAL_SAT_EM = 20, DEFAULT_MANUAL_DATUM_EM = 10;
            const CURRENT_SETTINGS_KEY = 'clockCurrentSettings', PROFILES_STORAGE_KEY = 'clockAppProfiles';

            const defaultSettings = { backgroundColor: "#ffffff", satFontColor: "#000000", datumFontColor: "#000000", fontSelect: "Arial, sans-serif", satFontSize: DEFAULT_MANUAL_SAT_EM.toString(), datumFontSize: DEFAULT_MANUAL_DATUM_EM.toString(), brightness: "1", contrast: "1", timeFormat: "24", dateFormat: "dd.mm.yyyy.", showSeconds: true, showDate: true, language: "en", isNightModeActive: false, isAutoSizeActive: true };

            function T(key) {
                const keys = key.split('.'); let result = currentTranslations;
                for (const k of keys) {
                    result = result?.[k];
                    if (result === undefined) { let fallbackResult = translations.en; for (const fk of keys) { fallbackResult = fallbackResult?.[fk]; if (fallbackResult === undefined) return key; } return fallbackResult; }
                } return result || key;
            }

            function applyNightModeStyles() {
                document.documentElement.style.setProperty('--bg-color', '#000000'); elements.sat.style.color = '#ffffff'; elements.datum.style.color = '#ffffff'; document.documentElement.style.setProperty('--brightness', '0.5');
                document.documentElement.style.setProperty('--button-bg', '#333'); document.documentElement.style.setProperty('--button-hover-bg', '#444'); document.documentElement.style.setProperty('--button-icon-color', '#fff');
                document.documentElement.style.setProperty('--button-border-color', '#555'); document.documentElement.style.setProperty('--button-shadow', '0 2px 4px rgba(0,0,0,0.3)');
            }

            function applyDayModeStyles() {
                document.documentElement.style.setProperty('--bg-color', elements.backgroundColor.value); elements.sat.style.color = elements.satFontColor.value; elements.datum.style.color = elements.datumFontColor.value;
                document.documentElement.style.setProperty('--brightness', elements.brightness.value); document.documentElement.style.setProperty('--button-bg', '#f0f0f0'); document.documentElement.style.setProperty('--button-hover-bg', '#e0e0e0');
                document.documentElement.style.setProperty('--button-icon-color', '#333'); document.documentElement.style.setProperty('--button-border-color', '#ccc'); document.documentElement.style.setProperty('--button-shadow', '0 2px 4px rgba(0,0,0,0.1)');
            }

            function updateNightModeIcon() {
                if (isNightModeActive) { elements.nightModeIcon.classList.replace('fa-moon', 'fa-sun'); elements.nightModeToggle.title = T('toggleDayMode'); } 
                else { elements.nightModeIcon.classList.replace('fa-sun', 'fa-moon'); elements.nightModeToggle.title = T('toggleNightMode'); }
            }

            function toggleNightMode() { isNightModeActive = !isNightModeActive; if (isNightModeActive) applyNightModeStyles(); else applyDayModeStyles(); updateNightModeIcon(); saveCurrentSettings(); }

            function updateSizingMode() {
                const autoSizeActive = elements.autoSizeCheckbox.checked;
                elements.satFontSize.disabled = autoSizeActive; elements.datumFontSize.disabled = autoSizeActive;
                elements.satFontSizeLabel.classList.toggle('disabled', autoSizeActive); elements.datumFontSizeLabel.classList.toggle('disabled', autoSizeActive);
                if (autoSizeActive) { elements.sat.style.fontSize = `${AUTO_SIZE_SAT_VW}vw`; elements.datum.style.fontSize = `${AUTO_SIZE_DATUM_VW}vw`; } 
                else { elements.sat.style.fontSize = `${elements.satFontSize.value}em`; elements.datum.style.fontSize = `${elements.datumFontSize.value}em`; }
            }

            function populateInfoPanel() {
                const tInfo = T('info');
                const lang = elements.languageSelect?.value || 'en';
                const appInfo = APP_INFO[lang] || APP_INFO.en;
                const uiMap = {
                    en: { paypalDesc: 'Pay securely with PayPal or other payment options offered by PayPal Checkout.', stripeDesc: 'Pay securely by card or with payment methods available through Stripe Checkout.', cards: 'Debit / Credit Card', wallets: 'Digital wallets', paypalBtn: 'Donate with PayPal ↗', stripeBtn: 'Donate with Stripe ↗', note: 'Available payment methods can vary by country, device and payment provider.', crypto: 'Crypto Wallet' },
                    hr: { paypalDesc: 'Platite sigurno putem PayPala ili drugim načinima plaćanja koje nudi PayPal Checkout.', stripeDesc: 'Platite sigurno karticom ili načinima plaćanja dostupnima putem Stripe Checkouta.', cards: 'Debitna / kreditna kartica', wallets: 'Digitalni novčanici', paypalBtn: 'Doniraj putem PayPala ↗', stripeBtn: 'Doniraj putem Stripea ↗', note: 'Dostupni načini plaćanja mogu se razlikovati ovisno o državi, uređaju i pružatelju plaćanja.', crypto: 'Kripto novčanik' },
                    de: { paypalDesc: 'Sicher mit PayPal oder weiteren von PayPal Checkout angebotenen Zahlungsmethoden bezahlen.', stripeDesc: 'Sicher per Karte oder mit den über Stripe Checkout verfügbaren Zahlungsmethoden bezahlen.', cards: 'Debit- / Kreditkarte', wallets: 'Digitale Wallets', paypalBtn: 'Mit PayPal spenden ↗', stripeBtn: 'Mit Stripe spenden ↗', note: 'Verfügbare Zahlungsmethoden können je nach Land, Gerät und Zahlungsanbieter variieren.', crypto: 'Krypto-Wallet' },
                    it: { paypalDesc: 'Paga in modo sicuro con PayPal o con gli altri metodi disponibili tramite PayPal Checkout.', stripeDesc: 'Paga in modo sicuro con carta o con i metodi disponibili tramite Stripe Checkout.', cards: 'Carta di debito / credito', wallets: 'Portafogli digitali', paypalBtn: 'Dona con PayPal ↗', stripeBtn: 'Dona con Stripe ↗', note: 'I metodi di pagamento disponibili possono variare in base al Paese, al dispositivo e al fornitore di pagamento.', crypto: 'Portafoglio crypto' },
                    es: { paypalDesc: 'Paga de forma segura con PayPal u otros métodos disponibles mediante PayPal Checkout.', stripeDesc: 'Paga de forma segura con tarjeta o con los métodos disponibles mediante Stripe Checkout.', cards: 'Tarjeta de débito / crédito', wallets: 'Carteras digitales', paypalBtn: 'Donar con PayPal ↗', stripeBtn: 'Donar con Stripe ↗', note: 'Los métodos de pago disponibles pueden variar según el país, el dispositivo y el proveedor de pago.', crypto: 'Cartera de criptomonedas' }
                };
                const ui = uiMap[lang] || uiMap.en;
                const copyMap = {
                    en: { copy: 'Copy', copied: 'Copied!' },
                    hr: { copy: 'Kopiraj', copied: 'Kopirano!' },
                    de: { copy: 'Kopieren', copied: 'Kopiert!' },
                    it: { copy: 'Copia', copied: 'Copiato!' },
                    es: { copy: 'Copiar', copied: '¡Copiado!' }
                };
                const copyUi = copyMap[lang] || copyMap.en;
                const cryptoRows = Object.entries(CRYPTO_ADDRESSES).map(([key, value]) => {
                    const label = tInfo[key.toLowerCase()] || key;
                    return `<div class="dc-wallet-row"><strong>${label}</strong><code>${value}</code><button type="button" class="dc-copy-wallet" data-address="${value}" title="${copyUi.copy}">${copyUi.copy}</button></div>`;
                }).join('');

                const contentHTML = `
                    <h4 class="info-title">${tInfo.title}</h4>
                    <section class="dc-app-overview">
                        <div class="dc-app-heading">
                            <div>
                                <span class="dc-app-brand">Apps & Games</span>
                                <h5>${appInfo.name}</h5>
                            </div>
                            <span class="dc-version">${appInfo.versionLabel} ${APP_VERSION}</span>
                        </div>
                        <p>${appInfo.description}</p>
                        <strong class="dc-features-title">${appInfo.featuresTitle}</strong>
                        <ul>${appInfo.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
                        <div class="dc-info-meta">
                            <span>${appInfo.freeLabel}</span>
                            <span>${appInfo.privacy}</span>
                        </div>
                        <a class="dc-portal-link" href="https://appsandgames.org/" target="_blank" rel="noopener noreferrer">${appInfo.portalLabel} ↗</a>
                    </section>
                    <div class="info-charity"><p>${tInfo.line1}</p><p>${tInfo.line2} ${tInfo.line3}</p></div>
                    <strong class="donation-header">${tInfo.donationHeader}</strong>
                    <div class="dc-payment-grid">
                        <article class="dc-payment-card">
                            <div class="dc-brand"><span class="dc-brand-icon">P</span><strong>PayPal</strong></div>
                            <p>${ui.paypalDesc}</p>
                            <div class="dc-badges"><span>PayPal</span><span>${ui.cards}</span><span>Apple Pay</span></div>
                            <a class="dc-payment-action" href="${PAYPAL_LINK}" target="_blank" rel="noopener noreferrer">${ui.paypalBtn}</a>
                        </article>
                        <article class="dc-payment-card stripe">
                            <div class="dc-brand"><span class="dc-brand-icon">S</span><strong>Stripe</strong></div>
                            <p>${ui.stripeDesc}</p>
                            <div class="dc-badges"><span>${ui.cards}</span><span>Link</span><span>${ui.wallets}</span></div>
                            <a class="dc-payment-action" href="${STRIPE_LINK}" target="_blank" rel="noopener noreferrer">${ui.stripeBtn}</a>
                        </article>
                    </div>
                    <p class="dc-payment-note">${ui.note}</p>
                    <div class="dc-crypto"><h5>${ui.crypto}</h5><div class="dc-wallet-list">${cryptoRows}</div></div>`;
                elements.infoSidePanelContent.innerHTML = contentHTML;
                elements.infoSidePanelContent.querySelectorAll('.dc-copy-wallet').forEach(button => {
                    button.addEventListener('click', async () => {
                        const originalText = button.textContent;
                        try {
                            await navigator.clipboard.writeText(button.dataset.address);
                            button.textContent = copyUi.copied;
                            button.classList.add('copied');
                            setTimeout(() => {
                                button.textContent = originalText;
                                button.classList.remove('copied');
                            }, 1500);
                        } catch {
                            button.textContent = originalText;
                        }
                    });
                });
            }
            
            function showInfoPanel() { populateInfoPanel(); elements.infoSidePanel.classList.add('info-panel-visible'); }
            function hideInfoPanel() { elements.infoSidePanel.classList.remove('info-panel-visible'); }
            function toggleInfoPanel() { if (elements.infoSidePanel.classList.contains('info-panel-visible')) { hideInfoPanel(); } else { showInfoPanel(); } }
            
            function getProfiles() { return readStorage(PROFILES_STORAGE_KEY, []); }
            function saveProfiles(profiles) { writeStorage(PROFILES_STORAGE_KEY, profiles); }

            function populateProfileDropdown() {
                const profiles = getProfiles(); elements.profileSelect.innerHTML = '';
                if (profiles.length === 0) {
                    elements.profileSelect.innerHTML = `<option value="" disabled>${T('noProfiles')}</option>`;
                    elements.loadProfileButton.disabled = true; elements.deleteProfileButton.disabled = true;
                } else {
                    profiles.forEach(p => { const o = document.createElement('option'); o.value = p.name; o.textContent = p.name; elements.profileSelect.appendChild(o); });
                    elements.loadProfileButton.disabled = false; elements.deleteProfileButton.disabled = false;
                }
            }

            function getCurrentSettingsObject() { return { backgroundColor: elements.backgroundColor.value, satFontColor: elements.satFontColor.value, datumFontColor: elements.datumFontColor.value, fontSelect: elements.fontSelect.value, satFontSize: elements.satFontSize.value, datumFontSize: elements.datumFontSize.value, brightness: elements.brightness.value, contrast: elements.contrast.value, timeFormat: elements.timeFormatSelect.value, dateFormat: elements.dateFormatSelect.value, showSeconds: elements.showSecondsCheckbox.checked, showDate: elements.showDateCheckbox.checked, language: elements.languageSelect.value, isNightModeActive: isNightModeActive, isAutoSizeActive: elements.autoSizeCheckbox.checked }; }

            function applySettingsFromObject(settingsObj) {
                elements.backgroundColor.value = settingsObj.backgroundColor; elements.satFontColor.value = settingsObj.satFontColor; elements.datumFontColor.value = settingsObj.datumFontColor;
                elements.fontSelect.value = settingsObj.fontSelect; elements.satFontSize.value = settingsObj.satFontSize; elements.datumFontSize.value = settingsObj.datumFontSize;
                elements.brightness.value = settingsObj.brightness; elements.contrast.value = settingsObj.contrast; elements.timeFormatSelect.value = settingsObj.timeFormat;
                elements.dateFormatSelect.value = settingsObj.dateFormat; elements.showSecondsCheckbox.checked = settingsObj.showSeconds; elements.showDateCheckbox.checked = settingsObj.showDate;
                elements.languageSelect.value = settingsObj.language; elements.autoSizeCheckbox.checked = settingsObj.isAutoSizeActive;
                isNightModeActive = settingsObj.isNightModeActive;

                currentTranslations = translations[settingsObj.language] || translations.en;
                updateLanguageUI();
                applyBasicVisualSettings(); updateSizingMode();
                if (isNightModeActive) applyNightModeStyles(); else applyDayModeStyles();
                updateNightModeIcon();
            }
            
            function saveCurrentSettings() { writeStorage(CURRENT_SETTINGS_KEY, getCurrentSettingsObject()); }

            function loadSettings() { const stored = readStorage(CURRENT_SETTINGS_KEY, {}); applySettingsFromObject({ ...defaultSettings, ...stored }); populateProfileDropdown(); }

            function updateLanguageUI() {
                const textMap = {
                    settingsTitle: 'settings', languageLabelSpan: 'language', brightnessLabelSpan: 'brightness', contrastLabelSpan: 'contrast', timeFormatLabelSpan: 'timeFormat', showSecondsLabelSpan: 'showSeconds',
                    showDateLabelSpan: 'showDate', fontLabelSpan: 'font', dateFormatLabelSpan: 'dateFormat', satFontSizeLabelSpan: 'satSize', datumFontSizeLabelSpan: 'datumSize', satFontColorLabelSpan: 'satColor',
                    datumColorLabelSpan: 'datumColor', backgroundColorLabelSpan: 'bgColor', resetButtonText: 'reset', autoSizeLabelSpan: 'autoSize', profilesHeaderLabel: 'profileHeader', profileNameLabel: 'profileName',
                    saveProfileButtonText: 'saveProfile', profileSelectLabel: 'manageProfiles', loadProfileButtonText: 'loadProfile', deleteProfileButtonText: 'deleteProfile'
                };
                for (const [elKey, transKey] of Object.entries(textMap)) { if (elements[elKey]) elements[elKey].textContent = T(transKey); }
                
                elements.infoButton.title = T('info.title'); elements.settingsMenu.title = T('settings');
                elements.timeFormatSelect.options[0].textContent = T('time24'); elements.timeFormatSelect.options[1].textContent = T('time12');
                const tDateFormats = T('dateFormats');
                for (const option of elements.dateFormatSelect.options) option.textContent = tDateFormats[option.value] || option.value;
                if (elements.profileSelect.options.length > 0 && elements.profileSelect.options[0].disabled) elements.profileSelect.options[0].textContent = T('noProfiles');

                document.documentElement.lang = elements.languageSelect.value;
                document.title = T('title');
                elements.metaDescription.setAttribute('content', T('description'));
                elements.metaKeywords.setAttribute('content', T('keywords'));

                // App translations
                elements.timerAppButton.title = T('timer.title');
                elements.closeTimerButton.title = T('timer.close');
                elements.timerTitle.textContent = T('timer.title');
                elements.timerHoursLabel.textContent = T('timer.hours');
                elements.timerMinutesLabel.textContent = T('timer.minutes');
                elements.timerSecondsLabel.textContent = T('timer.seconds');
                elements.timerResetLabel.textContent = T('timer.reset');
                if (isTimerRunning) { elements.timerStartLabel.textContent = T('timer.pause'); } 
                else if (timerSecondsRemaining > 0 && timerSecondsRemaining < initialTimerSeconds) { elements.timerStartLabel.textContent = T('timer.resume'); } 
                else { elements.timerStartLabel.textContent = T('timer.start'); }

                elements.stopwatchAppButton.title = T('stopwatch.title');
                elements.closeStopwatchButton.title = T('stopwatch.close');
                elements.stopwatchTitle.textContent = T('stopwatch.title');
                elements.lapsTitle.textContent = T('stopwatch.laps');
                elements.stopwatchLapLabel.textContent = T('stopwatch.lap');
                elements.stopwatchResetLabel.textContent = T('stopwatch.reset');
                elements.stopwatchStartLabel.textContent = isStopwatchRunning ? T('stopwatch.pause') : T('stopwatch.start');
                
                elements.worldClockAppButton.title = T('worldClock.title');
                elements.worldClockTitle.textContent = T('worldClock.title');
                elements.closeWorldClockButton.title = T('worldClock.close');
                elements.worldClockAddBtn.textContent = T('worldClock.add');

                elements.alarmAppButton.title = T('alarm.title');
                elements.alarmTitle.textContent = T('alarm.title');
                elements.closeAlarmButton.title = T('alarm.close');
                elements.alarmSetBtn.textContent = T('alarm.set');
                elements.alarmsListTitle.textContent = T('alarm.active');
                elements.alarmRingingTitle.textContent = T('alarm.ringing');
                elements.stopAlarmButton.textContent = T('alarm.stop');


                updateBackupUI();
                updateNightModeIcon(); updateFullscreenIcon(); updateTime(); updateDate(true);
            }

            function updateTime() {
                const now = new Date(); let hours = now.getHours(); const minutes = now.getMinutes().toString().padStart(2, '0'); const seconds = now.getSeconds().toString().padStart(2, '0'); let timeString;
                if (elements.timeFormatSelect.value === '12') { const ampm = hours >= 12 ? 'PM' : 'AM'; hours = hours % 12 || 12; timeString = `${hours}:${minutes}${elements.showSecondsCheckbox.checked ? `:${seconds} ${ampm}` : ` ${ampm}`}`; }
                else { hours = hours.toString().padStart(2, '0'); timeString = `${hours}:${minutes}${elements.showSecondsCheckbox.checked ? `:${seconds}` : ''}`; }
                if (elements.sat.textContent !== timeString) elements.sat.textContent = timeString;
            }
            
            function updateDate(forceUpdate = false) {
                if (!elements.showDateCheckbox.checked) { elements.datum.style.display = 'none'; return; }
                elements.datum.style.display = 'block';
                const now = new Date(), tDays = T('days'), tMonths = T('months'); let dateString;
                switch(elements.dateFormatSelect.value) {
                    case 'mm.dd.yyyy.': dateString = `${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getFullYear()}.`; break;
                    case 'dd.mmm.yyyy.': dateString = `${now.getDate()}. ${tMonths[now.getMonth()]} ${now.getFullYear()}.`; break;
                    case 'ddd dd.mm.yyyy.': dateString = `${tDays[now.getDay()].substring(0,3)} ${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}.`; break;
                    case 'day dd.mm.yyyy.': dateString = `${tDays[now.getDay()]}, ${now.getDate()}. ${tMonths[now.getMonth()]} ${now.getFullYear()}.`; break;
                    default: dateString = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}.`;
                }
                if (elements.datum.textContent !== dateString || forceUpdate) elements.datum.textContent = dateString;
            }

            function applyBasicVisualSettings() {
                document.documentElement.style.setProperty('--font-family', elements.fontSelect.value); document.documentElement.style.setProperty('--contrast', elements.contrast.value);
                if (!isNightModeActive) applyDayModeStyles();
                elements.satFontColor.style.backgroundColor = elements.satFontColor.value; elements.datumFontColor.style.backgroundColor = elements.datumFontColor.value; elements.backgroundColor.style.backgroundColor = elements.backgroundColor.value;
            }
            
            function resetSettings() { if (confirm(T('resetConfirm'))) { applySettingsFromObject(defaultSettings); saveCurrentSettings(); hideInfoPanel(); } }
            
            function updateFullscreenIcon() {
                if (document.fullscreenElement) { elements.fullscreenIcon.classList.replace('fa-expand', 'fa-compress'); elements.fullscreenButton.title = T('exitFullscreen'); }
                else { elements.fullscreenIcon.classList.replace('fa-compress', 'fa-expand'); elements.fullscreenButton.title = T('enterFullscreen'); }
            }

            // --- App Logic ---
            function playSound(freq = 440, duration = 0.5) {
                if (!audioContext) { try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.error("Web Audio API is not supported."); return; } }
                if (audioContext.state === 'suspended') { audioContext.resume(); }
                const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain();
                oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
                oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
                oscillator.stop(audioContext.currentTime + duration);
            }

            // Timer Logic
            function formatTimerTime(totalSeconds) { const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0'); const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0'); const s = (totalSeconds % 60).toString().padStart(2, '0'); return `${h}:${m}:${s}`; }
            function updateTimerDisplay() { elements.timerDisplay.textContent = formatTimerTime(timerSecondsRemaining); }
            function startPauseTimer() {
                if (!audioContext) { try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.error("Could not create audio context"); } }
                if (isTimerRunning) { clearInterval(timerInterval); isTimerRunning = false; elements.timerStartLabel.textContent = T('timer.resume'); elements.startPauseTimer.classList.remove('running'); } 
                else {
                    if (timerSecondsRemaining <= 0 || timerSecondsRemaining === initialTimerSeconds) {
                         const h = parseInt(elements.timerHours.value) || 0; 
                         const m = parseInt(elements.timerMinutes.value) || 0; 
                         const s = parseInt(elements.timerSeconds.value) || 0; 
                         initialTimerSeconds = (h * 3600) + (m * 60) + s; 
                         timerSecondsRemaining = initialTimerSeconds; 
                    }
                    if (timerSecondsRemaining <= 0) return;
                    isTimerRunning = true; elements.timerStartLabel.textContent = T('timer.pause'); elements.startPauseTimer.classList.add('running'); [elements.timerHours, elements.timerMinutes, elements.timerSeconds].forEach(inp => inp.disabled = true);
                    timerInterval = setInterval(() => {
                        timerSecondsRemaining--; updateTimerDisplay();
                        if (timerSecondsRemaining <= 0) { clearInterval(timerInterval); isTimerRunning = false; playSound(880, 0.5); resetTimer(); }
                    }, 1000);
                }
            }
            function resetTimer() { clearInterval(timerInterval); isTimerRunning = false; timerSecondsRemaining = initialTimerSeconds; updateTimerDisplay(); elements.timerStartLabel.textContent = T('timer.start'); elements.startPauseTimer.classList.remove('running'); [elements.timerHours, elements.timerMinutes, elements.timerSeconds].forEach(inp => inp.disabled = false); }
            function openTimer() { elements.timerContainer.style.display = 'flex'; elements.clockContainer.style.display = 'none'; elements.stopwatchContainer.style.display = 'none'; elements.worldClockContainer.style.display = 'none'; elements.alarmContainer.style.display = 'none'; }
            function closeTimer() { elements.timerContainer.style.display = 'none'; elements.clockContainer.style.display = 'flex'; clearInterval(timerInterval); isTimerRunning = false; }

            // Stopwatch Logic
            function formatStopwatchTime(ms) { const date = new Date(ms); const minutes = date.getUTCMinutes().toString().padStart(2, '0'); const seconds = date.getUTCSeconds().toString().padStart(2, '0'); const milliseconds = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0'); return `${minutes}:${seconds}.${milliseconds}`; }
            function stopwatchLoop(timestamp) { if (!isStopwatchRunning) return; stopwatchElapsedTime = timestamp - stopwatchStartTime; elements.stopwatchDisplay.textContent = formatStopwatchTime(stopwatchElapsedTime); stopwatchInterval = requestAnimationFrame(stopwatchLoop); }
            function startPauseStopwatch() {
                if (isStopwatchRunning) { isStopwatchRunning = false; cancelAnimationFrame(stopwatchInterval); stopwatchElapsedTime = performance.now() - stopwatchStartTime; elements.stopwatchStartLabel.textContent = T('stopwatch.resume'); elements.startPauseStopwatch.classList.remove('running'); } 
                else { isStopwatchRunning = true; stopwatchStartTime = performance.now() - stopwatchElapsedTime; requestAnimationFrame(stopwatchLoop); elements.stopwatchStartLabel.textContent = T('stopwatch.pause'); elements.startPauseStopwatch.classList.add('running'); }
            }
            function resetStopwatch() { cancelAnimationFrame(stopwatchInterval); isStopwatchRunning = false; stopwatchElapsedTime = 0; lapTimes = []; elements.stopwatchDisplay.textContent = formatStopwatchTime(0); elements.lapsList.innerHTML = ''; elements.stopwatchStartLabel.textContent = T('stopwatch.start'); elements.startPauseStopwatch.classList.remove('running'); }
            function recordLap() { if (!isStopwatchRunning) return; const lapTime = formatStopwatchTime(stopwatchElapsedTime); lapTimes.push(lapTime); const li = document.createElement('li'); li.innerHTML = `<span class="lap-number">${T('stopwatch.lap')} ${lapTimes.length}</span><span>${lapTime}</span>`; elements.lapsList.prepend(li); }
            function openStopwatch() { elements.stopwatchContainer.style.display = 'flex'; elements.clockContainer.style.display = 'none'; elements.timerContainer.style.display = 'none'; elements.worldClockContainer.style.display = 'none'; elements.alarmContainer.style.display = 'none'; }
            function closeStopwatch() { elements.stopwatchContainer.style.display = 'none'; elements.clockContainer.style.display = 'flex'; cancelAnimationFrame(stopwatchInterval); }

            // World Clock Logic
            function getSavedCities() { return readStorage(WORLD_CLOCK_KEY, ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Moscow', 'Europe/Zagreb']); }
            function saveCities(cities) { writeStorage(WORLD_CLOCK_KEY, cities); }
            
            function renderWorldClocks() {
                const cities = getSavedCities();
                elements.worldClocksGrid.innerHTML = '';
                cities.forEach(timeZone => {
                    const card = document.createElement('div');
                    card.className = 'world-clock-card';
                    card.dataset.timezone = timeZone;
                    
                    const cityName = timeZone.split('/').pop().replace(/_/g, ' ');
                    
                    const removeButton = document.createElement('button');
                    removeButton.className = 'remove-city-btn';
                    removeButton.type = 'button';
                    removeButton.title = 'Remove';
                    removeButton.textContent = '×';

                    const cityElement = document.createElement('div');
                    cityElement.className = 'world-clock-city';
                    cityElement.textContent = cityName;

                    const timeElement = document.createElement('div');
                    timeElement.className = 'world-clock-time';
                    timeElement.textContent = '--:--:--';

                    const dateElement = document.createElement('div');
                    dateElement.className = 'world-clock-date';
                    dateElement.textContent = '----------';

                    card.append(removeButton, cityElement, timeElement, dateElement);
                    elements.worldClocksGrid.appendChild(card);
                    removeButton.addEventListener('click', () => removeWorldClockCity(timeZone));
                });
                updateWorldClocks();
            }

            function updateWorldClocks() {
                const now = new Date();
                document.querySelectorAll('.world-clock-card').forEach(card => {
                    const timeZone = card.dataset.timezone;
                    const timeEl = card.querySelector('.world-clock-time');
                    const dateEl = card.querySelector('.world-clock-date');
                    
                    try {
                        timeEl.textContent = now.toLocaleTimeString(elements.languageSelect.value, { timeZone, hour12: elements.timeFormatSelect.value === '12' });
                        dateEl.textContent = now.toLocaleDateString(elements.languageSelect.value, { timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    } catch (e) {
                        console.error(`Invalid time zone: ${timeZone}`);
                        timeEl.textContent = "Invalid Zone";
                        dateEl.textContent = "";
                    }
                });
            }

            function addWorldClockCity() {
                const selectedTimeZone = elements.worldClockCitySelect.value;
                let cities = getSavedCities();
                if (selectedTimeZone && !cities.includes(selectedTimeZone)) {
                    cities.push(selectedTimeZone);
                    saveCities(cities);
                    renderWorldClocks();
                }
            }

            function removeWorldClockCity(timeZoneToRemove) {
                let cities = getSavedCities();
                cities = cities.filter(city => city !== timeZoneToRemove);
                saveCities(cities);
                renderWorldClocks();
            }
            
            function populateTimeZoneSelect() {
                elements.worldClockCitySelect.innerHTML = '';
                TIME_ZONES.forEach(tz => {
                    const option = document.createElement('option');
                    option.value = tz;
                    option.textContent = tz.replace(/_/g, ' ');
                    elements.worldClockCitySelect.appendChild(option);
                });
            }

            function openWorldClock() {
                elements.worldClockContainer.style.display = 'flex';
                elements.clockContainer.style.display = 'none';
                elements.timerContainer.style.display = 'none';
                elements.stopwatchContainer.style.display = 'none';
                elements.alarmContainer.style.display = 'none';
                renderWorldClocks();
                worldClockInterval = setInterval(updateWorldClocks, 1000);
            }

            function closeWorldClock() {
                elements.worldClockContainer.style.display = 'none';
                elements.clockContainer.style.display = 'flex';
                clearInterval(worldClockInterval);
            }

            // Alarm Logic
            function loadAlarms() { alarms = readStorage(ALARM_KEY, []); }
            function saveAlarms() { writeStorage(ALARM_KEY, alarms); }
            
            function renderAlarms() {
                elements.alarmsList.innerHTML = '';
                alarms.sort((a, b) => a.time.localeCompare(b.time)).forEach(alarm => {
                    const alarmItem = document.createElement('div');
                    alarmItem.className = 'alarm-item';
                    alarmItem.dataset.id = alarm.id;
                    alarmItem.innerHTML = `
                        <span class="alarm-item-time">${alarm.time}</span>
                        <div class="alarm-item-controls">
                            <label class="toggle-switch">
                                <input type="checkbox" class="toggle-alarm" ${alarm.isActive ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <button class="delete-alarm-btn"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    `;
                    elements.alarmsList.appendChild(alarmItem);
                });
            }

            function setAlarm() {
                const hour = elements.alarmHourSelect.value;
                const minute = elements.alarmMinuteSelect.value;
                const time = `${hour}:${minute}`;

                if (!alarms.some(a => a.time === time)) {
                    const newAlarm = { id: Date.now(), time: time, isActive: true, isRinging: false };
                    alarms.push(newAlarm);
                    saveAlarms();
                    renderAlarms();
                }
            }

            function toggleAlarm(id) {
                const alarm = alarms.find(a => a.id == id);
                if(alarm) {
                    alarm.isActive = !alarm.isActive;
                    saveAlarms();
                }
            }
            
            function deleteAlarm(id) {
                alarms = alarms.filter(a => a.id != id);
                saveAlarms();
                renderAlarms();
            }

            function checkAlarms() {
                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                alarms.forEach(alarm => {
                    if (alarm.isActive && alarm.time === currentTime && !alarm.isRinging) {
                        triggerAlarm(alarm);
                    }
                });
            }

            function triggerAlarm(alarm) {
                if (!audioContext) { try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.error("Could not create audio context"); return; } }
                
                alarm.isRinging = true;
                elements.alarmRingingModal.style.display = 'flex';
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
                oscillator.loop = true;
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                oscillator.start();
                currentAlarmSound.oscillator = oscillator;

                currentAlarmSound.timeoutId = setTimeout(() => {
                    stopAlarmSound(alarm);
                }, 20000);
            }

            function stopAlarmSound(alarm = null) {
                elements.alarmRingingModal.style.display = 'none';
                if (currentAlarmSound.oscillator) {
                    currentAlarmSound.oscillator.stop();
                    currentAlarmSound.oscillator = null;
                }
                if (currentAlarmSound.timeoutId) {
                    clearTimeout(currentAlarmSound.timeoutId);
                    currentAlarmSound.timeoutId = null;
                }
                
                const ringingAlarm = alarm || alarms.find(a => a.isRinging);
                if (ringingAlarm) {
                    ringingAlarm.isRinging = false;
                    ringingAlarm.isActive = false; // Deactivate after it has rung
                    saveAlarms();
                    renderAlarms(); // Re-render to show it's deactivated
                }
            }

            function populateAlarmSelectors() {
                for (let i = 0; i < 24; i++) {
                    const option = document.createElement('option');
                    option.value = i.toString().padStart(2, '0');
                    option.textContent = i.toString().padStart(2, '0');
                    elements.alarmHourSelect.appendChild(option);
                }
                for (let i = 0; i < 60; i++) {
                    const option = document.createElement('option');
                    option.value = i.toString().padStart(2, '0');
                    option.textContent = i.toString().padStart(2, '0');
                    elements.alarmMinuteSelect.appendChild(option);
                }
            }

            function openAlarm() {
                elements.alarmContainer.style.display = 'flex';
                elements.clockContainer.style.display = 'none';
                elements.timerContainer.style.display = 'none';
                elements.stopwatchContainer.style.display = 'none';
                elements.worldClockContainer.style.display = 'none';
                renderAlarms();
            }

            function closeAlarm() {
                elements.alarmContainer.style.display = 'none';
                elements.clockContainer.style.display = 'flex';
            }

            elements.alarmsList.addEventListener('click', e => {
                if(e.target.closest('.delete-alarm-btn')) {
                    const id = e.target.closest('.alarm-item').dataset.id;
                    deleteAlarm(id);
                } else if (e.target.classList.contains('toggle-alarm')) {
                    const id = e.target.closest('.alarm-item').dataset.id;
                    toggleAlarm(id);
                }
            });


            // --- Event Listeners ---
            elements.settingsMenu.addEventListener('click', () => { const isVisible = elements.settingsPanel.style.display === 'block'; elements.settingsPanel.style.display = isVisible ? 'none' : 'block'; if (!isVisible) hideInfoPanel(); });
            elements.infoButton.addEventListener('click', () => { toggleInfoPanel(); if (elements.infoSidePanel.classList.contains('info-panel-visible')) elements.settingsPanel.style.display = 'none'; });
            elements.languageSelect.addEventListener('change', (e) => { currentTranslations = translations[e.target.value] || translations.en; updateLanguageUI(); if (elements.infoSidePanel.classList.contains('info-panel-visible')) populateInfoPanel(); saveCurrentSettings(); });
            ['showSecondsCheckbox', 'timeFormatSelect'].forEach(id => elements[id].addEventListener('change', () => { updateTime(); saveCurrentSettings(); }));
            ['showDateCheckbox', 'dateFormatSelect'].forEach(id => elements[id].addEventListener('change', () => { updateDate(true); saveCurrentSettings(); }));
            elements.autoSizeCheckbox.addEventListener('change', () => { updateSizingMode(); saveCurrentSettings(); });
            [elements.satFontSize, elements.datumFontSize].forEach(slider => {
                slider.addEventListener('input', () => { if (elements.autoSizeCheckbox.checked) elements.autoSizeCheckbox.checked = false; updateSizingMode(); });
                slider.addEventListener('change', saveCurrentSettings);
            });
            [elements.brightness, elements.contrast, elements.fontSelect, elements.satFontColor, elements.datumFontColor, elements.backgroundColor].forEach(input => {
                const eventType = (input.type === 'range' || input.type === 'color') ? 'input' : 'change';
                input.addEventListener(eventType, (e) => { if (isNightModeActive && ['backgroundColor', 'satFontColor', 'datumFontColor', 'brightness'].includes(e.target.id)) { isNightModeActive = false; updateNightModeIcon(); } applyBasicVisualSettings(); });
                input.addEventListener('change', saveCurrentSettings);
            });
            elements.nightModeToggle.addEventListener('click', toggleNightMode);
            elements.infoSidePanelCloseButton.addEventListener('click', hideInfoPanel);
            elements.resetButton.addEventListener('click', resetSettings);
            elements.fullscreenButton.addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => console.warn(`FS error: ${err.message}`)); else if (document.exitFullscreen) document.exitFullscreen(); });
            document.addEventListener('fullscreenchange', updateFullscreenIcon);
            elements.saveProfileButton.addEventListener('click', () => {
                const profileName = elements.profileNameInput.value.trim(); if (!profileName) { alert(T('enterProfileName')); return; }
                const profiles = getProfiles(); const i = profiles.findIndex(p => p.name === profileName); const settings = getCurrentSettingsObject();
                if (i > -1) { if (confirm(T('overwriteProfileConfirm') + profileName + T('overwriteProfileConfirm2'))) profiles[i].settings = settings; else return; } else profiles.push({ name: profileName, settings: settings });
                saveProfiles(profiles); populateProfileDropdown(); elements.profileNameInput.value = ''; alert(T('profileSaved') + profileName + T('profileSaved2'));
            });
            elements.loadProfileButton.addEventListener('click', () => {
                const profileName = elements.profileSelect.value; if (!profileName) return;
                const profile = getProfiles().find(p => p.name === profileName); if (profile) { applySettingsFromObject(profile.settings); saveCurrentSettings(); alert(T('profileLoaded') + profileName + T('profileLoaded2')); }
            });
            elements.deleteProfileButton.addEventListener('click', () => {
                const profileName = elements.profileSelect.value; if (!profileName) return;
                if (confirm(T('deleteProfileConfirm') + profileName + "'?")) { saveProfiles(getProfiles().filter(p => p.name !== profileName)); populateProfileDropdown(); alert(T('profileDeleted') + profileName + T('profileDeleted2')); }
            });

            backupElements.exportButton.addEventListener('click', () => {
                downloadBackup({
                    settings: getCurrentSettingsObject(),
                    profiles: getProfiles(),
                    cities: getSavedCities(),
                    alarms
                });
            });

            backupElements.importButton.addEventListener('click', () => {
                backupElements.fileInput.click();
            });

            backupElements.fileInput.addEventListener('change', async () => {
                const file = backupElements.fileInput.files?.[0];
                if (!file) return;

                try {
                    const importedData = await readBackupFile(file);
                    const text = getBackupText();

                    if (!window.confirm(text.importConfirm)) return;

                    const saved = [
                        writeStorage(CURRENT_SETTINGS_KEY, importedData.settings),
                        writeStorage(PROFILES_STORAGE_KEY, importedData.profiles),
                        writeStorage(WORLD_CLOCK_KEY, importedData.cities),
                        writeStorage(ALARM_KEY, importedData.alarms)
                    ];

                    if (saved.includes(false)) {
                        throw new Error('Could not save imported backup.');
                    }

                    loadAlarms();
                    loadSettings();
                    renderAlarms();
                    renderWorldClocks();

                    window.alert(getBackupText().importSuccess);
                } catch (error) {
                    console.warn('Backup import failed.', error);
                    window.alert(getBackupText().importError);
                } finally {
                    backupElements.fileInput.value = '';
                }
            });
            // App Event Listeners
            elements.timerAppButton.addEventListener('click', openTimer);
            elements.closeTimerButton.addEventListener('click', closeTimer);
            elements.startPauseTimer.addEventListener('click', startPauseTimer);
            elements.resetTimer.addEventListener('click', resetTimer);
            elements.stopwatchAppButton.addEventListener('click', openStopwatch);
            elements.closeStopwatchButton.addEventListener('click', closeStopwatch);
            elements.startPauseStopwatch.addEventListener('click', startPauseStopwatch);
            elements.lapStopwatch.addEventListener('click', recordLap);
            elements.resetStopwatch.addEventListener('click', resetStopwatch);
            elements.worldClockAppButton.addEventListener('click', openWorldClock);
            elements.closeWorldClockButton.addEventListener('click', closeWorldClock);
            elements.addWorldClockCity.addEventListener('click', addWorldClockCity);
            elements.alarmAppButton.addEventListener('click', openAlarm);
            elements.closeAlarmButton.addEventListener('click', closeAlarm);
            elements.setAlarmButton.addEventListener('click', setAlarm);
            elements.stopAlarmButton.addEventListener('click', () => {
                const ringingAlarm = alarms.find(a => a.isRinging);
                stopAlarmSound(ringingAlarm);
            });


            setupEscapeHandling({
                infoPanel: elements.infoSidePanel,
                settingsPanel: elements.settingsPanel,
                infoButton: elements.infoButton,
                settingsButton: elements.settingsMenu,
                closeInfo: hideInfoPanel,
                views: [
                    { panel: elements.timerContainer, close: closeTimer, trigger: elements.timerAppButton },
                    { panel: elements.stopwatchContainer, close: closeStopwatch, trigger: elements.stopwatchAppButton },
                    { panel: elements.worldClockContainer, close: closeWorldClock, trigger: elements.worldClockAppButton },
                    { panel: elements.alarmContainer, close: closeAlarm, trigger: elements.alarmAppButton }
                ]
            });
            // --- Initialization ---
            function init() {
                function populateLanguageOptions() { const langSelect = elements.languageSelect; const current = langSelect.value || 'en'; langSelect.innerHTML = ''; Object.entries(translations.en.languageNames).forEach(([code, name]) => { const opt = document.createElement('option'); opt.value = code; opt.textContent = name; langSelect.appendChild(opt); }); langSelect.value = current; }
                populateLanguageOptions();
                populateTimeZoneSelect();
                populateAlarmSelectors();
                loadAlarms();
                loadSettings();
                setInterval(() => { updateTime(); updateDate(); checkAlarms(); }, 1000);
                updateTimerDisplay();
                elements.stopwatchDisplay.textContent = formatStopwatchTime(0);
            }
            init();
        });