import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '@fortawesome/fontawesome-free/css/regular.min.css';
import '@fontsource/orbitron/latin-400.css';
import '@fontsource/orbitron/latin-500.css';
import '@fontsource/orbitron/latin-600.css';
import '@fontsource/orbitron/latin-700.css';
import '@fontsource/roboto-mono/latin-300.css';
import '@fontsource/roboto-mono/latin-ext-300.css';
import '@fontsource/roboto-mono/latin-400.css';
import '@fontsource/roboto-mono/latin-ext-400.css';
import '@fontsource/roboto-mono/latin-500.css';
import '@fontsource/roboto-mono/latin-ext-500.css';
import '@fontsource/rajdhani/latin-400.css';
import '@fontsource/rajdhani/latin-ext-400.css';
import '@fontsource/play/latin-400.css';
import '@fontsource/play/latin-ext-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-ext-400.css';
import { translations } from './data/translations.js';
import { ACCESSIBILITY_TEXT, formatAccessibilityText } from './data/accessibility-text.js';
import { PAYPAL_LINK, STRIPE_LINK, CRYPTO_ADDRESSES } from './data/donations.js';
import { TIME_ZONES } from './data/timezones.js';
import { APP_INFO, APP_VERSION } from './data/app-info.js';
import { readStorage, writeStorage, writeStorageAtomically } from './js/storage.js';
import { setupEscapeHandling } from './js/accessibility.js';
import { downloadBackup, readBackupFile, BACKUP_TEXT } from './js/backup.js';

const digitalClockQuery = new URLSearchParams(window.location.search);
const isScreenSaverWindow = digitalClockQuery.has('screenSaver');
const isScreenSaverConfig = digitalClockQuery.has('screenSaverConfig');
const isScreenSaverContext = isScreenSaverWindow || isScreenSaverConfig;

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
                brightness: document.getElementById('brightness'), contrast: document.getElementById('contrast'), brightnessValue: document.getElementById('brightnessValue'), contrastValue: document.getElementById('contrastValue'), showSecondsCheckbox: document.getElementById('showSecondsCheckbox'), showDateCheckbox: document.getElementById('showDateCheckbox'),
                timeFormatSelect: document.getElementById('timeFormat'), dateFormatSelect: document.getElementById('dateFormat'), languageSelect: document.getElementById('languageSelect'), fontSelect: document.getElementById('fontSelect'),
                windowsHostSettings: document.getElementById('windowsHostSettings'), windowsSettingsTitle: document.getElementById('windowsSettingsTitle'), startWithWindowsCheckbox: document.getElementById('startWithWindowsCheckbox'), startWithWindowsLabel: document.getElementById('startWithWindowsLabel'), keepDisplayAwakeCheckbox: document.getElementById('keepDisplayAwakeCheckbox'), keepDisplayAwakeLabel: document.getElementById('keepDisplayAwakeLabel'), bedsideModeButton: document.getElementById('bedsideModeButton'),
                screenSaverAppearanceSync: document.getElementById('screenSaverAppearanceSync'), copyAppearanceFromAppButton: document.getElementById('copyAppearanceFromAppButton'), copyAppearanceFromAppButtonText: document.getElementById('copyAppearanceFromAppButtonText'), copyAppearanceFromAppStatus: document.getElementById('copyAppearanceFromAppStatus'), screenSaverAutoSaveNote: document.getElementById('screenSaverAutoSaveNote'),
                satFontSize: document.getElementById('satFontSize'), datumFontSize: document.getElementById('datumFontSize'), satFontSizeValue: document.getElementById('satFontSizeValue'), datumFontSizeValue: document.getElementById('datumFontSizeValue'), satFontColor: document.getElementById('satFontColor'), datumFontColor: document.getElementById('datumFontColor'),
                backgroundColor: document.getElementById('backgroundColor'), resetButton: document.getElementById('resetButton'), bedsideBrightness: document.getElementById('bedsideBrightness'), bedsideBrightnessLabel: document.getElementById('bedsideBrightnessLabel'), bedsideBrightnessValue: document.getElementById('bedsideBrightnessValue'), bedsideBrightnessControl: document.getElementById('bedsideBrightnessControl'), bedsideExitButton: document.getElementById('bedsideExitButton'), bedsideExitButtonText: document.getElementById('bedsideExitButtonText'), bedsideModeHint: document.getElementById('bedsideModeHint'), bedsideModeHintText: document.getElementById('bedsideModeHintText'), nightModeToggle: document.getElementById('nightModeToggle'), nightModeIcon: document.getElementById('nightModeIcon'),
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
                installAppButton: document.getElementById('installAppButton'), screenSaverButton: document.getElementById('screenSaverButton'),
                metaDescription: document.querySelector('meta[name="description"]'), metaKeywords: document.querySelector('meta[name="keywords"]'),
                
                // Timer elements
                timerAppButton: document.getElementById('timerAppButton'), timerContainer: document.getElementById('timerContainer'), closeTimerButton: document.getElementById('closeTimerButton'), timerTitle: document.getElementById('timerTitle'),
                timerDisplay: document.getElementById('timerDisplay'), timerHours: document.getElementById('timerHours'), timerMinutes: document.getElementById('timerMinutes'), timerSeconds: document.getElementById('timerSeconds'),
                timerHoursLabel: document.getElementById('timerHoursLabel'), timerMinutesLabel: document.getElementById('timerMinutesLabel'), timerSecondsLabel: document.getElementById('timerSecondsLabel'),
                startPauseTimer: document.getElementById('startPauseTimer'), resetTimer: document.getElementById('resetTimer'), timerStartLabel: document.getElementById('timerStartLabel'), timerResetLabel: document.getElementById('timerResetLabel'),
                timerCompleteModal: document.getElementById('timerCompleteModal'), timerFinishedTitle: document.getElementById('timerFinishedTitle'), stopTimerSoundButton: document.getElementById('stopTimerSoundButton'),
                timerSoundSettings: document.getElementById('timerSoundSettings'), timerSoundSelect: document.getElementById('timerSoundSelect'), chooseTimerSoundButton: document.getElementById('chooseTimerSoundButton'), previewTimerSoundButton: document.getElementById('previewTimerSoundButton'), timerCustomSoundName: document.getElementById('timerCustomSoundName'),

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
                alarmTitle: document.getElementById('alarmTitle'), alarmTimeLabel: document.getElementById('alarmTimeLabel'), alarmHourLabel: document.getElementById('alarmHourLabel'), alarmMinuteLabel: document.getElementById('alarmMinuteLabel'),
                alarmHourSelect: document.getElementById('alarmHourSelect'), alarmMinuteSelect: document.getElementById('alarmMinuteSelect'),
                setAlarmButton: document.getElementById('setAlarmButton'), alarmsListContainer: document.getElementById('alarmsListContainer'), alarmsListTitle: document.getElementById('alarmsListTitle'),
                alarmsList: document.getElementById('alarmsList'), alarmSetBtn: document.getElementById('alarmSetBtn'),
                alarmRingingModal: document.getElementById('alarmRingingModal'), stopAlarmButton: document.getElementById('stopAlarmButton'),
                alarmRingingTitle: document.getElementById('alarmRingingTitle'),
                alarmSoundSettings: document.getElementById('alarmSoundSettings'), alarmSoundSelect: document.getElementById('alarmSoundSelect'), chooseAlarmSoundButton: document.getElementById('chooseAlarmSoundButton'), previewAlarmSoundButton: document.getElementById('previewAlarmSoundButton'), alarmCustomSoundName: document.getElementById('alarmCustomSoundName')
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

            function getAccessibilityText() {
                const language = elements.languageSelect?.value || 'en';
                return ACCESSIBILITY_TEXT[language] || ACCESSIBILITY_TEXT.en;
            }

            function setAccessibleName(element, text) {
                element.title = text;
                element.setAttribute('aria-label', text);
            }

            function updateAccessibilityLabels() {
                const text = getAccessibilityText();

                setAccessibleName(elements.infoButton, text.info);
                setAccessibleName(elements.infoSidePanelCloseButton, text.closeInfo);
                setAccessibleName(elements.settingsMenu, T('settings'));
                setAccessibleName(elements.timerAppButton, T('timer.title'));
                setAccessibleName(elements.stopwatchAppButton, T('stopwatch.title'));
                setAccessibleName(elements.worldClockAppButton, T('worldClock.title'));
                setAccessibleName(elements.alarmAppButton, T('alarm.title'));
                setAccessibleName(elements.installAppButton, text.install);
                setAccessibleName(elements.screenSaverButton, screenSaverActive ? text.exitScreenSaver : text.screenSaver);
                setAccessibleName(elements.closeTimerButton, T('timer.close'));
                setAccessibleName(elements.stopTimerSoundButton, T('timer.stopSound'));
                setAccessibleName(elements.closeStopwatchButton, T('stopwatch.close'));
                setAccessibleName(elements.closeWorldClockButton, T('worldClock.close'));
                setAccessibleName(elements.closeAlarmButton, T('alarm.close'));

                elements.worldClockCitySelect.setAttribute('aria-label', text.selectCity);
                elements.alarmHourSelect.setAttribute('aria-label', text.alarmHour);
                elements.alarmMinuteSelect.setAttribute('aria-label', text.alarmMinute);

                setAccessibleName(
                    elements.nightModeToggle,
                    isNightModeActive ? T('toggleDayMode') : T('toggleNightMode')
                );
                setAccessibleName(
                    elements.fullscreenButton,
                    document.fullscreenElement ? T('exitFullscreen') : T('enterFullscreen')
                );
            }
            function updateDynamicAccessibilityLabels() {
                const text = getAccessibilityText();

                elements.worldClocksGrid.querySelectorAll('.world-clock-card').forEach(card => {
                    const cityName = card.querySelector('.world-clock-city')?.textContent;
                    const removeButton = card.querySelector('.remove-city-btn');

                    if (cityName && removeButton) {
                        setAccessibleName(
                            removeButton,
                            formatAccessibilityText(text.removeCity, cityName)
                        );
                    }
                });

                elements.alarmsList.querySelectorAll('.alarm-item').forEach(alarmItem => {
                    const time = alarmItem.querySelector('.alarm-item-time')?.textContent;
                    const toggleButton = alarmItem.querySelector('.toggle-alarm');
                    const deleteButton = alarmItem.querySelector('.delete-alarm-btn');

                    if (time && toggleButton && deleteButton) {
                        setAccessibleName(
                            toggleButton,
                            formatAccessibilityText(text.enableAlarm, time)
                        );
                        setAccessibleName(
                            deleteButton,
                            formatAccessibilityText(text.deleteAlarm, time)
                        );
                    }
                });
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
            let currentAlarmSound = { intervalId: null, oscillators: [] };
            let currentTimerSound = { timeoutId: null, oscillators: [] };

            const AUTO_SIZE_SAT_VW = 18, AUTO_SIZE_DATUM_VW = 8, DEFAULT_MANUAL_SAT_EM = 20, DEFAULT_MANUAL_DATUM_EM = 10;
            const NORMAL_SETTINGS_KEY = 'clockCurrentSettings';
            const SCREEN_SAVER_SETTINGS_KEY = 'clockScreenSaverSettings';
            const CURRENT_SETTINGS_KEY = isScreenSaverContext ? SCREEN_SAVER_SETTINGS_KEY : NORMAL_SETTINGS_KEY;
            const PROFILES_STORAGE_KEY = isScreenSaverContext ? 'clockScreenSaverProfiles' : 'clockAppProfiles';

            const defaultSettings = { backgroundColor: "#ffffff", satFontColor: "#000000", datumFontColor: "#000000", fontSelect: "Arial, sans-serif", satFontSize: DEFAULT_MANUAL_SAT_EM.toString(), datumFontSize: DEFAULT_MANUAL_DATUM_EM.toString(), brightness: "1", contrast: "1", timeFormat: "24", dateFormat: "dd.mm.yyyy.", showSeconds: true, showDate: true, language: "en", isNightModeActive: false, isAutoSizeActive: true, bedsideBrightness: "35", alarmSound: { kind: "builtin", value: "chime", name: "" }, timerSound: { kind: "builtin", value: "chime", name: "" } };

            function sliderValueToPercent(slider) {
                const min = Number(slider.min);
                const max = Number(slider.max);
                const value = Number(slider.value);
                if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 100;
                return Math.round(10 + ((value - min) / (max - min)) * 90);
            }

            function updateSliderValueDisplays() {
                elements.brightnessValue.value = `${Math.round(Number(elements.brightness.value) * 100)}%`;
                elements.contrastValue.value = `${Math.round(Number(elements.contrast.value) * 100)}%`;
                elements.satFontSizeValue.value = `${sliderValueToPercent(elements.satFontSize)}%`;
                elements.datumFontSizeValue.value = `${sliderValueToPercent(elements.datumFontSize)}%`;
            }

            function measureTextWidthAt100(element, sampleText) {
                const canvas = measureTextWidthAt100.canvas || (measureTextWidthAt100.canvas = document.createElement('canvas'));
                const context = canvas.getContext('2d');
                const style = getComputedStyle(element);
                context.font = `${style.fontStyle} ${style.fontWeight} 100px ${style.fontFamily}`;
                return Math.max(context.measureText(sampleText).width, 1);
            }

            function sliderPercentToValue(slider, percent) {
                const min = Number(slider.min);
                const max = Number(slider.max);
                const step = Number(slider.step) || 1;
                const clampedPercent = Math.min(100, Math.max(10, Number(percent) || 10));
                const rawValue = min + ((clampedPercent - 10) / 90) * (max - min);
                const steppedValue = min + Math.round((rawValue - min) / step) * step;
                return Math.min(max, Math.max(min, steppedValue));
            }

            function getSafeManualFontSizes(viewportWidth = window.innerWidth, viewportHeight = window.innerHeight) {
                const usableWidth = Math.max(240, viewportWidth - 48);
                const usableHeight = Math.max(180, viewportHeight - 100);
                const showSeconds = elements.showSecondsCheckbox.checked;
                const is12Hour = elements.timeFormatSelect.value === '12';
                const clockSample = is12Hour
                    ? (showSeconds ? '88:88:88 PM' : '88:88 PM')
                    : (showSeconds ? '88:88:88' : '88:88');
                const dateSample = (elements.datum.textContent || 'Wednesday 30 September 2026').trim();

                const clockWidthAt100 = measureTextWidthAt100(elements.sat, clockSample);
                const dateWidthAt100 = measureTextWidthAt100(elements.datum, dateSample);

                let clockMaxPx = (usableWidth * 0.92 / clockWidthAt100) * 100;
                let dateMaxPx = (usableWidth * 0.90 / dateWidthAt100) * 100;

                const estimatedCombinedHeight =
                    (clockMaxPx * 1.12) +
                    (elements.showDateCheckbox.checked ? dateMaxPx * 1.20 : 0) +
                    20;

                if (estimatedCombinedHeight > usableHeight) {
                    const scale = usableHeight / estimatedCombinedHeight;
                    clockMaxPx *= scale;
                    dateMaxPx *= scale;
                }

                return {
                    clockMaxPx: Math.max(24, clockMaxPx),
                    dateMaxPx: Math.max(14, dateMaxPx)
                };
            }

            const WINDOWS_SOUND_TEXT = {
                hr: { label: "Zvuk", choose: "Odaberi datoteku", preview: "Testiraj zvuk", chime: "Melodija", bell: "Zvono", pulse: "Puls", custom: "Vlastita datoteka…", customPrefix: "Vlastito: " },
                en: { label: "Sound", choose: "Choose file", preview: "Test sound", chime: "Chime", bell: "Bell", pulse: "Pulse", custom: "Custom file…", customPrefix: "Custom: " },
                de: { label: "Klang", choose: "Datei auswählen", preview: "Klang testen", chime: "Melodie", bell: "Glocke", pulse: "Signalton", custom: "Eigene Datei…", customPrefix: "Eigene: " },
                it: { label: "Suono", choose: "Scegli file", preview: "Prova suono", chime: "Melodia", bell: "Campanella", pulse: "Impulso", custom: "File personale…", customPrefix: "Personale: " },
                es: { label: "Sonido", choose: "Elegir archivo", preview: "Probar sonido", chime: "Melodía", bell: "Campana", pulse: "Pulso", custom: "Archivo propio…", customPrefix: "Propio: " }
            };

            const WINDOWS_UPDATE_TEXT = {
                hr: { title: "Windows nadogradnja", check: "Provjeri nadogradnje", checking: "Provjera...", ready: "Provjeri postoji li novija Windows verzija.", latest: "Imaš najnoviju verziju ({version}).", available: "Dostupna je verzija {version}.", install: "Preuzmi i instaliraj {version}", downloading: "Preuzimanje i provjera...", starting: "Pokrećem instalaciju...", failed: "Provjera nadogradnje nije uspjela.", installFailed: "Nadogradnju nije moguće pokrenuti.", confirm: "Preuzeti i instalirati verziju {version}? Digital Clock će se automatski zatvoriti.", checkAgain: "Provjeri ponovno" },
                en: { title: "Windows update", check: "Check for updates", checking: "Checking...", ready: "Check whether a newer Windows version is available.", latest: "You have the latest version ({version}).", available: "Version {version} is available.", install: "Download and install {version}", downloading: "Downloading and verifying...", starting: "Starting the installer...", failed: "Update check failed.", installFailed: "The update could not be started.", confirm: "Download and install version {version}? Digital Clock will close automatically.", checkAgain: "Check again" },
                de: { title: "Windows-Update", check: "Nach Updates suchen", checking: "Wird geprüft...", ready: "Prüfe, ob eine neuere Windows-Version verfügbar ist.", latest: "Du hast die neueste Version ({version}).", available: "Version {version} ist verfügbar.", install: "{version} herunterladen und installieren", downloading: "Download und Prüfung...", starting: "Installationsprogramm wird gestartet...", failed: "Update-Prüfung fehlgeschlagen.", installFailed: "Das Update konnte nicht gestartet werden.", confirm: "Version {version} herunterladen und installieren? Digital Clock wird automatisch geschlossen.", checkAgain: "Erneut prüfen" },
                it: { title: "Aggiornamento Windows", check: "Controlla aggiornamenti", checking: "Controllo...", ready: "Controlla se è disponibile una versione Windows più recente.", latest: "Hai la versione più recente ({version}).", available: "È disponibile la versione {version}.", install: "Scarica e installa {version}", downloading: "Download e verifica...", starting: "Avvio del programma di installazione...", failed: "Controllo aggiornamenti non riuscito.", installFailed: "Impossibile avviare l'aggiornamento.", confirm: "Scaricare e installare la versione {version}? Digital Clock si chiuderà automaticamente.", checkAgain: "Controlla di nuovo" },
                es: { title: "Actualización de Windows", check: "Buscar actualizaciones", checking: "Comprobando...", ready: "Comprueba si hay una versión de Windows más reciente.", latest: "Tienes la versión más reciente ({version}).", available: "La versión {version} está disponible.", install: "Descargar e instalar {version}", downloading: "Descargando y verificando...", starting: "Iniciando el instalador...", failed: "No se pudo comprobar la actualización.", installFailed: "No se pudo iniciar la actualización.", confirm: "¿Descargar e instalar la versión {version}? Digital Clock se cerrará automáticamente.", checkAgain: "Comprobar de nuevo" }
            };

            const SCREEN_SAVER_SYNC_TEXT = {
                hr: { button: "Preuzmi izgled iz aplikacije", copied: "Izgled glavne aplikacije je preuzet.", unavailable: "Izgled glavne aplikacije nije dostupan.", autoSave: "Promjene se spremaju automatski." },
                en: { button: "Copy appearance from app", copied: "The main app appearance was copied.", unavailable: "The main app appearance is not available.", autoSave: "Changes are saved automatically." },
                de: { button: "Darstellung aus der App übernehmen", copied: "Die Darstellung der Haupt-App wurde übernommen.", unavailable: "Die Darstellung der Haupt-App ist nicht verfügbar.", autoSave: "Änderungen werden automatisch gespeichert." },
                it: { button: "Copia aspetto dall'app", copied: "L'aspetto dell'app principale è stato copiato.", unavailable: "L'aspetto dell'app principale non è disponibile.", autoSave: "Le modifiche vengono salvate automaticamente." },
                es: { button: "Copiar apariencia de la app", copied: "Se copió la apariencia de la aplicación principal.", unavailable: "La apariencia de la aplicación principal no está disponible.", autoSave: "Los cambios se guardan automáticamente." }
            };
            let selectedSounds = {
                alarm: { ...defaultSettings.alarmSound },
                timer: { ...defaultSettings.timerSound }
            };
            let windowsHostReady = false;
            let windowsAppVersion = APP_VERSION;
            let latestWindowsUpdateInfo = null;
            let windowsFullscreenActive = false;
            let languageWasSelectedByUser = false;
            let bridgeRequestSequence = 0;
            let bedsideControlsTimer = null;
            let bedsideHintTimer = null;
            const bridgeRequests = new Map();

            function isWindowsHost() {
                return Boolean(window.chrome?.webview);
            }

            function normaliseSoundSelection(value, fallback) {
                if (!value || typeof value !== 'object') return { ...fallback };
                if (value.kind === 'custom' && value.name) return { kind: 'custom', value: 'custom', name: value.name };
                return { kind: 'builtin', value: ['chime', 'bell', 'pulse'].includes(value.value) ? value.value : fallback.value, name: '' };
            }

            function postWindowsMessage(action, payload = {}, timeoutMs = 8000) {
                if (!isWindowsHost()) return Promise.resolve(null);
                const requestId = 'dc-' + (++bridgeRequestSequence);
                return new Promise(resolve => {
                    const timeout = window.setTimeout(() => {
                        bridgeRequests.delete(requestId);
                        resolve(null);
                    }, timeoutMs);
                    bridgeRequests.set(requestId, response => {
                        window.clearTimeout(timeout);
                        resolve(response);
                    });
                    window.chrome.webview.postMessage({ action, requestId, ...payload });
                });
            }

            async function initialiseWindowsBridge() {
                if (!isWindowsHost()) return null;
                window.chrome.webview.addEventListener('message', event => {
                    const message = event.data;
                    if (message?.type === 'windowsHostEvent' && message.eventName === 'bedsideModeChanged') {
                        applyBedsideMode(message.payload?.enabled === true);
                        return;
                    }
                    if (message?.type === 'windowsHostEvent' && message.eventName === 'fullscreenChanged') {
                        windowsFullscreenActive = message.payload?.enabled === true;
                        updateFullscreenIcon();
                        updateSizingMode();
                        return;
                    }
                    if (message?.type !== 'windowsBridgeResponse' || !message.requestId) return;
                    const complete = bridgeRequests.get(message.requestId);
                    if (complete) {
                        bridgeRequests.delete(message.requestId);
                        complete(message);
                    }
                });
                const response = await postWindowsMessage('getHostInfo');
                if (!response?.ok) return null;
                windowsHostReady = true;
                windowsAppVersion = response.payload?.appVersion || APP_VERSION;
                document.querySelectorAll('.windows-host-only').forEach(element => element.classList.add('windows-feature-enabled'));
                return response.payload || null;
            }

            function updateWindowsHostText() {
                const text = {
                    hr: { title: 'Windows', start: 'Pokreni sa sustavom Windows', awake: 'Drži zaslon uključenim', bedside: 'Noćni način uz krevet', exitBedside: 'Izađi iz noćnog načina', bedsideBrightness: 'Svjetlina', bedsideHint: 'Izlaz iz noćnog načina: pritisni Esc ili klikni „Izađi iz noćnog načina”.' },
                    en: { title: 'Windows', start: 'Start with Windows', awake: 'Keep display awake', bedside: 'Bedside mode', exitBedside: 'Exit bedside mode', bedsideBrightness: 'Brightness', bedsideHint: 'Exit bedside mode: press Esc or click “Exit bedside mode”.' },
                    de: { title: 'Windows', start: 'Mit Windows starten', awake: 'Bildschirm eingeschaltet lassen', bedside: 'Nachttischmodus', exitBedside: 'Nachttischmodus beenden', bedsideBrightness: 'Helligkeit', bedsideHint: 'Nachttischmodus beenden: Esc drücken oder auf „Nachttischmodus beenden“ klicken.' },
                    it: { title: 'Windows', start: 'Avvia con Windows', awake: 'Mantieni lo schermo acceso', bedside: 'Modalità comodino', exitBedside: 'Esci dalla modalità comodino', bedsideBrightness: 'Luminosità', bedsideHint: 'Per uscire dalla modalità comodino: premi Esc o fai clic su “Esci dalla modalità comodino”.' },
                    es: { title: 'Windows', start: 'Iniciar con Windows', awake: 'Mantener la pantalla activa', bedside: 'Modo de mesita de noche', exitBedside: 'Salir del modo de mesita', bedsideBrightness: 'Brillo', bedsideHint: 'Para salir del modo de mesita: pulsa Esc o haz clic en “Salir del modo de mesita”.' }
                }[elements.languageSelect.value] || { title: 'Windows', start: 'Start with Windows', awake: 'Keep display awake', bedside: 'Bedside mode', exitBedside: 'Exit bedside mode', bedsideBrightness: 'Brightness', bedsideHint: 'Exit bedside mode: press Esc or click “Exit bedside mode”.' };

                elements.windowsSettingsTitle.textContent = text.title;
                elements.startWithWindowsLabel.textContent = text.start;
                elements.keepDisplayAwakeLabel.textContent = text.awake;
                elements.bedsideBrightnessLabel.textContent = text.bedsideBrightness;
                elements.bedsideExitButtonText.textContent = text.exitBedside;
                elements.bedsideModeHintText.textContent = text.bedsideHint;
                setAccessibleName(elements.bedsideExitButton, text.exitBedside);
                setAccessibleName(elements.bedsideModeButton, document.body.classList.contains('bedside-mode') ? text.exitBedside : text.bedside);
            }

            function updateBedsideBrightness() {
                const value = Number(elements.bedsideBrightness.value);
                document.documentElement.style.setProperty('--bedside-brightness', (value / 100).toString());
                elements.bedsideBrightnessValue.textContent = value + '%';
            }

            function revealBedsideBrightnessControl() {
                if (!document.body.classList.contains('bedside-mode')) return;
                elements.bedsideBrightnessControl.classList.add('bedside-controls-visible');
                if (bedsideControlsTimer) clearTimeout(bedsideControlsTimer);
                bedsideControlsTimer = setTimeout(() => {
                    elements.bedsideBrightnessControl.classList.remove('bedside-controls-visible');
                    bedsideControlsTimer = null;
                }, 4500);
            }

            function showBedsideModeHint() {
                elements.bedsideModeHint.classList.add('bedside-hint-visible');
                if (bedsideHintTimer) clearTimeout(bedsideHintTimer);
                bedsideHintTimer = setTimeout(() => {
                    elements.bedsideModeHint.classList.remove('bedside-hint-visible');
                    bedsideHintTimer = null;
                }, 2200);
            }

            function applyBedsideMode(enabled) {
                document.body.classList.toggle('bedside-mode', enabled);
                elements.bedsideModeButton.classList.toggle('active', enabled);
                elements.bedsideModeButton.setAttribute('aria-pressed', enabled ? 'true' : 'false');
                if (enabled) {
                    revealBedsideBrightnessControl();
                    showBedsideModeHint();
                } else {
                    elements.bedsideBrightnessControl.classList.remove('bedside-controls-visible');
                    elements.bedsideModeHint.classList.remove('bedside-hint-visible');
                    if (bedsideControlsTimer) clearTimeout(bedsideControlsTimer);
                    if (bedsideHintTimer) clearTimeout(bedsideHintTimer);
                    bedsideControlsTimer = null;
                    bedsideHintTimer = null;
                }
                updateBedsideBrightness();
                updateWindowsHostText();
            }

            function applyWindowsHostPreferences(preferences) {
                if (!preferences) return;
                elements.startWithWindowsCheckbox.checked = preferences.startWithWindows === true;
                elements.keepDisplayAwakeCheckbox.checked = preferences.keepDisplayAwake === true;
                applyBedsideMode(preferences.bedsideMode === true);
            }

            async function updateWindowsHostPreference(action, checkbox) {
                const previousValue = !checkbox.checked;
                const response = await postWindowsMessage(action, { enabled: checkbox.checked });
                if (!response?.ok || typeof response.payload?.enabled !== 'boolean') {
                    checkbox.checked = previousValue;
                    return;
                }
                checkbox.checked = response.payload.enabled;
            }

            async function updateBedsideMode() {
                const wasEnabled = document.body.classList.contains('bedside-mode');
                const response = await postWindowsMessage('setBedsideMode', { enabled: !wasEnabled });
                if (!response?.ok || typeof response.payload?.enabled !== 'boolean') {
                    applyBedsideMode(wasEnabled);
                    return;
                }
                applyBedsideMode(response.payload.enabled);
            }

            function updateWindowsSoundText() {
                const text = WINDOWS_SOUND_TEXT[elements.languageSelect.value] || WINDOWS_SOUND_TEXT.en;
                for (const channel of ['alarm', 'timer']) {
                    const prefix = channel === 'alarm' ? 'alarm' : 'timer';
                    const select = elements[prefix + 'SoundSelect'];
                    if (!select) continue;
                    const label = elements[prefix + 'SoundSettings']?.querySelector('.sound-label');
                    if (label) label.textContent = text.label;
                    select.options[0].textContent = text.chime;
                    select.options[1].textContent = text.bell;
                    select.options[2].textContent = text.pulse;
                    select.options[3].textContent = text.custom;
                    elements['choose' + (channel === 'alarm' ? 'Alarm' : 'Timer') + 'SoundButton'].textContent = text.choose;
                    elements['preview' + (channel === 'alarm' ? 'Alarm' : 'Timer') + 'SoundButton'].textContent = text.preview;
                    const nameElement = elements[prefix + 'CustomSoundName'];
                    if (nameElement) nameElement.textContent = selectedSounds[channel].kind === 'custom' ? text.customPrefix + selectedSounds[channel].name : '';
                }
            }

            function updateSoundControls() {
                for (const channel of ['alarm', 'timer']) {
                    const prefix = channel === 'alarm' ? 'alarm' : 'timer';
                    const select = elements[prefix + 'SoundSelect'];
                    const nameElement = elements[prefix + 'CustomSoundName'];
                    if (!select) continue;
                    const selected = selectedSounds[channel];
                    select.value = selected.kind === 'custom' ? 'custom' : selected.value;
                    if (nameElement) nameElement.hidden = selected.kind !== 'custom';
                }
                updateWindowsSoundText();
            }

            async function chooseCustomSound(channel) {
                const response = await postWindowsMessage('pickCustomSound', { channel });
                if (!response?.ok || !response.payload?.name) {
                    updateSoundControls();
                    return;
                }
                selectedSounds[channel] = { kind: 'custom', value: 'custom', name: response.payload.name };
                updateSoundControls();
                saveCurrentSettings();
            }

            async function changeSound(channel) {
                const select = elements[channel + 'SoundSelect'];
                if (select.value === 'custom') {
                    await chooseCustomSound(channel);
                    return;
                }
                selectedSounds[channel] = { kind: 'builtin', value: select.value, name: '' };
                updateSoundControls();
                saveCurrentSettings();
            }

            function getBuiltInPattern(kind, sound) {
                const patterns = {
                    chime: kind === 'alarm'
                        ? [[659.25, 0.00, 0.30], [783.99, 0.36, 0.30], [987.77, 0.72, 0.34], [783.99, 1.12, 0.30], [659.25, 1.48, 0.48]]
                        : [[523.25, 0.00, 0.34], [659.25, 0.32, 0.34], [783.99, 0.64, 0.38], [1046.50, 1.02, 0.70]],
                    bell: [[880, 0.00, 0.20], [880, 0.30, 0.20], [1174.66, 0.62, 0.36], [880, 1.08, 0.24]],
                    pulse: [[440, 0.00, 0.16], [440, 0.32, 0.16], [554.37, 0.64, 0.16], [659.25, 0.96, 0.26]]
                };
                return patterns[sound] || patterns.chime;
            }

            function previewBuiltInSound(channel) {
                const state = channel === 'alarm' ? currentAlarmSound : currentTimerSound;
                if (state.intervalId) clearInterval(state.intervalId);
                if (state.timeoutId) clearTimeout(state.timeoutId);
                stopOscillators(state);
                const pattern = getBuiltInPattern(channel, selectedSounds[channel].value);
                pattern.forEach(([frequency, offset, duration]) => scheduleChimeNote(state, frequency, offset, duration, 0.16, 'triangle'));
                state.timeoutId = setTimeout(() => {
                    stopOscillators(state);
                    state.timeoutId = null;
                }, 2400);
            }

            function previewSelectedSound(channel) {
                if (selectedSounds[channel].kind === 'custom') {
                    postWindowsMessage('playCustomSound', { channel, preview: true });
                    return;
                }
                previewBuiltInSound(channel);
            }

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

            let copiedScreenSaverRenderedSizes = null;

            function updateSizingMode() {
                const autoSizeActive = elements.autoSizeCheckbox.checked;
                elements.satFontSize.disabled = autoSizeActive; elements.datumFontSize.disabled = autoSizeActive;
                elements.satFontSizeLabel.classList.toggle('disabled', autoSizeActive); elements.datumFontSizeLabel.classList.toggle('disabled', autoSizeActive);

                if (autoSizeActive) {
                    copiedScreenSaverRenderedSizes = null;
                    elements.sat.style.fontSize = `${AUTO_SIZE_SAT_VW}vw`;
                    elements.datum.style.fontSize = `${AUTO_SIZE_DATUM_VW}vw`;
                } else if (isScreenSaverContext && copiedScreenSaverRenderedSizes) {
                    const copiedClockPx = Number(copiedScreenSaverRenderedSizes.clock);
                    const copiedDatePx = Number(copiedScreenSaverRenderedSizes.date);

                    if (Number.isFinite(copiedClockPx) && copiedClockPx > 0) {
                        elements.sat.style.fontSize = `${Math.round(copiedClockPx)}px`;
                    }
                    if (Number.isFinite(copiedDatePx) && copiedDatePx > 0) {
                        elements.datum.style.fontSize = `${Math.round(copiedDatePx)}px`;
                    }
                } else {
                    const { clockMaxPx, dateMaxPx } = getSafeManualFontSizes();
                    const clockPercent = sliderValueToPercent(elements.satFontSize) / 100;
                    const datePercent = sliderValueToPercent(elements.datumFontSize) / 100;
                    elements.sat.style.fontSize = `${Math.round(clockMaxPx * clockPercent)}px`;
                    elements.datum.style.fontSize = `${Math.round(dateMaxPx * datePercent)}px`;
                }

                updateSliderValueDisplays();
            }

            function screenSaverSyncText() {
                const lang = elements.languageSelect?.value || 'en';
                return SCREEN_SAVER_SYNC_TEXT[lang] || SCREEN_SAVER_SYNC_TEXT.en;
            }

            function updateScreenSaverSyncText() {
                if (!elements.copyAppearanceFromAppButtonText) return;
                const ui = screenSaverSyncText();
                elements.copyAppearanceFromAppButtonText.textContent = ui.button;
                if (elements.screenSaverAutoSaveNote) elements.screenSaverAutoSaveNote.textContent = ui.autoSave;
            }

            function copyAppearanceFromMainApp() {
                if (!isScreenSaverConfig) return;

                const seed = window.__digitalClockScreenSaverSeed;
                const ui = screenSaverSyncText();

                if (!seed || typeof seed !== 'object') {
                    elements.copyAppearanceFromAppStatus.textContent = ui.unavailable;
                    return;
                }

                const copiedSettings = {
                    ...defaultSettings,
                    ...seed,
                    copiedRenderedSatFontPx: !seed.isAutoSizeActive ? Number(seed.renderedSatFontPx) || null : null,
                    copiedRenderedDatumFontPx: !seed.isAutoSizeActive ? Number(seed.renderedDatumFontPx) || null : null
                };

                applySettingsFromObject(copiedSettings);
                saveCurrentSettings();
                elements.copyAppearanceFromAppStatus.textContent = ui.copied;
            }

            function windowsUpdateText() {
                const lang = elements.languageSelect?.value || 'en';
                return WINDOWS_UPDATE_TEXT[lang] || WINDOWS_UPDATE_TEXT.en;
            }

            function formatWindowsUpdateText(value, version) {
                return value.replace('{version}', version || windowsAppVersion || APP_VERSION);
            }

            async function handleWindowsUpdateButton() {
                const button = elements.infoSidePanelContent.querySelector('#windowsUpdateButton');
                const status = elements.infoSidePanelContent.querySelector('#windowsUpdateStatus');
                if (!button || !status || !windowsHostReady) return;

                const ui = windowsUpdateText();

                if (button.dataset.mode === 'install' && latestWindowsUpdateInfo?.updateAvailable) {
                    const latestVersion = latestWindowsUpdateInfo.latestVersion;
                    if (!window.confirm(formatWindowsUpdateText(ui.confirm, latestVersion))) return;

                    button.disabled = true;
                    button.textContent = ui.downloading;
                    status.textContent = ui.downloading;

                    const response = await postWindowsMessage('installUpdate', {}, 300000);
                    if (!response?.ok) {
                        button.disabled = false;
                        button.textContent = formatWindowsUpdateText(ui.install, latestVersion);
                        status.textContent = ui.installFailed;
                        return;
                    }

                    status.textContent = ui.starting;
                    return;
                }

                button.disabled = true;
                button.textContent = ui.checking;
                status.textContent = ui.checking;

                const response = await postWindowsMessage('checkForUpdates', {}, 20000);
                button.disabled = false;

                if (!response?.ok || !response.payload) {
                    latestWindowsUpdateInfo = null;
                    button.dataset.mode = 'check';
                    button.textContent = ui.checkAgain;
                    status.textContent = ui.failed;
                    return;
                }

                latestWindowsUpdateInfo = response.payload;
                if (latestWindowsUpdateInfo.updateAvailable) {
                    button.dataset.mode = 'install';
                    button.textContent = formatWindowsUpdateText(ui.install, latestWindowsUpdateInfo.latestVersion);
                    status.textContent = formatWindowsUpdateText(ui.available, latestWindowsUpdateInfo.latestVersion);
                } else {
                    button.dataset.mode = 'check';
                    button.textContent = ui.checkAgain;
                    status.textContent = formatWindowsUpdateText(ui.latest, latestWindowsUpdateInfo.currentVersion || windowsAppVersion);
                }
            }

            function populateInfoPanel() {
                const tInfo = T('info');
                const lang = elements.languageSelect?.value || 'en';
                const appInfo = APP_INFO[lang] || APP_INFO.en;
                const updateUi = WINDOWS_UPDATE_TEXT[lang] || WINDOWS_UPDATE_TEXT.en;
                const displayedVersion = windowsHostReady ? windowsAppVersion : APP_VERSION;
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
                            <span class="dc-version">${appInfo.versionLabel} ${displayedVersion}</span>
                        </div>
                        <p>${appInfo.description}</p>
                        <strong class="dc-features-title">${appInfo.featuresTitle}</strong>
                        <ul>${appInfo.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
                        <div class="dc-info-meta">
                            <span>${appInfo.freeLabel}</span>
                            <span>${appInfo.privacy}</span>
                        </div>
                        <a class="dc-portal-link" href="https://appsandgames.org/" target="_blank" rel="noopener noreferrer">${appInfo.portalLabel} ↗</a>
                        ${windowsHostReady ? `
                            <div class="dc-windows-update">
                                <div class="dc-update-heading">
                                    <strong>${updateUi.title}</strong>
                                    <span>${appInfo.versionLabel} ${displayedVersion}</span>
                                </div>
                                <button id="windowsUpdateButton" type="button" data-mode="check">${updateUi.check}</button>
                                <p id="windowsUpdateStatus" class="dc-update-status" role="status" aria-live="polite">${updateUi.ready}</p>
                            </div>
                        ` : ''}
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
                const windowsUpdateButton = elements.infoSidePanelContent.querySelector('#windowsUpdateButton');
                if (windowsUpdateButton) windowsUpdateButton.addEventListener('click', handleWindowsUpdateButton);
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
            
            function showInfoPanel() {
                populateInfoPanel();
                elements.infoSidePanel.inert = false;
                elements.infoSidePanel.setAttribute('aria-hidden', 'false');
                elements.infoSidePanel.classList.add('info-panel-visible');
                elements.infoSidePanelCloseButton.focus();
            }

            function hideInfoPanel() {
                elements.infoSidePanel.classList.remove('info-panel-visible');
                elements.infoSidePanel.inert = true;
                elements.infoSidePanel.setAttribute('aria-hidden', 'true');
                elements.infoButton.focus();
            }
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

            function getCurrentSettingsObject() {
                const renderedSatFontPx = Number.parseFloat(getComputedStyle(elements.sat).fontSize);
                const renderedDatumFontPx = Number.parseFloat(getComputedStyle(elements.datum).fontSize);
                return {
                    backgroundColor: elements.backgroundColor.value,
                    satFontColor: elements.satFontColor.value,
                    datumFontColor: elements.datumFontColor.value,
                    fontSelect: elements.fontSelect.value,
                    satFontSize: elements.satFontSize.value,
                    datumFontSize: elements.datumFontSize.value,
                    renderedSatFontPx: Number.isFinite(renderedSatFontPx) ? renderedSatFontPx : null,
                    renderedDatumFontPx: Number.isFinite(renderedDatumFontPx) ? renderedDatumFontPx : null,
                    copiedRenderedSatFontPx: isScreenSaverContext && copiedScreenSaverRenderedSizes
                        ? Number(copiedScreenSaverRenderedSizes.clock) || null
                        : null,
                    copiedRenderedDatumFontPx: isScreenSaverContext && copiedScreenSaverRenderedSizes
                        ? Number(copiedScreenSaverRenderedSizes.date) || null
                        : null,
                    brightness: elements.brightness.value,
                    contrast: elements.contrast.value,
                    timeFormat: elements.timeFormatSelect.value,
                    dateFormat: elements.dateFormatSelect.value,
                    showSeconds: elements.showSecondsCheckbox.checked,
                    showDate: elements.showDateCheckbox.checked,
                    language: elements.languageSelect.value,
                    isNightModeActive: isNightModeActive,
                    isAutoSizeActive: elements.autoSizeCheckbox.checked,
                    bedsideBrightness: elements.bedsideBrightness.value,
                    languageWasSelectedByUser,
                    alarmSound: { ...selectedSounds.alarm },
                    timerSound: { ...selectedSounds.timer }
                };
            }

            function applySettingsFromObject(settingsObj) {
                elements.backgroundColor.value = settingsObj.backgroundColor; elements.satFontColor.value = settingsObj.satFontColor; elements.datumFontColor.value = settingsObj.datumFontColor;
                elements.fontSelect.value = settingsObj.fontSelect; elements.satFontSize.value = settingsObj.satFontSize; elements.datumFontSize.value = settingsObj.datumFontSize;
                elements.brightness.value = settingsObj.brightness; elements.contrast.value = settingsObj.contrast; elements.timeFormatSelect.value = settingsObj.timeFormat;
                elements.dateFormatSelect.value = settingsObj.dateFormat; elements.showSecondsCheckbox.checked = settingsObj.showSeconds; elements.showDateCheckbox.checked = settingsObj.showDate;
                elements.languageSelect.value = settingsObj.language; elements.autoSizeCheckbox.checked = settingsObj.isAutoSizeActive;
                copiedScreenSaverRenderedSizes = isScreenSaverContext && !settingsObj.isAutoSizeActive &&
                    (Number(settingsObj.copiedRenderedSatFontPx) > 0 || Number(settingsObj.copiedRenderedDatumFontPx) > 0)
                    ? {
                        clock: Number(settingsObj.copiedRenderedSatFontPx) || null,
                        date: Number(settingsObj.copiedRenderedDatumFontPx) || null
                    }
                    : null;
                elements.bedsideBrightness.value = settingsObj.bedsideBrightness || defaultSettings.bedsideBrightness;
                isNightModeActive = settingsObj.isNightModeActive;
                languageWasSelectedByUser = settingsObj.languageWasSelectedByUser === true;
                selectedSounds.alarm = normaliseSoundSelection(settingsObj.alarmSound, defaultSettings.alarmSound);
                selectedSounds.timer = normaliseSoundSelection(settingsObj.timerSound, defaultSettings.timerSound);

                currentTranslations = translations[settingsObj.language] || translations.en;
                updateLanguageUI();
                updateScreenSaverSyncText();
                applyBasicVisualSettings(); updateSizingMode();
                if (isNightModeActive) applyNightModeStyles(); else applyDayModeStyles();
                updateNightModeIcon();
                updateBedsideBrightness();
                updateSoundControls();
            }
            
            function saveCurrentSettings(persistScreenSaver = true) {
                const settings = getCurrentSettingsObject();
                writeStorage(CURRENT_SETTINGS_KEY, settings);
                if (!isScreenSaverContext && isWindowsHost()) {
                    postWindowsMessage('saveClockAppearance', { settings });
                }
                if (isScreenSaverConfig && isWindowsHost() && persistScreenSaver) {
                    window.chrome.webview.postMessage({ action: 'saveScreenSaverAppearance', settings });
                }
            }

            function loadSettings(preferredLanguage = null) {
                const stored = window.__digitalClockIsolatedScreenSaver === true ? null : readStorage(CURRENT_SETTINGS_KEY, null);
                const screenSaverSeed = isScreenSaverContext && !stored && window.__digitalClockScreenSaverSeed && typeof window.__digitalClockScreenSaverSeed === 'object'
                    ? window.__digitalClockScreenSaverSeed
                    : null;
                const snapshot = isScreenSaverContext && window.__digitalClockScreenSaverAppearance;
                const authoritativeSettings = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) ? snapshot : null;
                const inheritedSettings = authoritativeSettings || (isScreenSaverContext && !stored
                    ? (screenSaverSeed || readStorage(NORMAL_SETTINGS_KEY, null))
                    : stored);
                const shouldUseHostLanguage = !inheritedSettings?.languageWasSelectedByUser && ['hr', 'en', 'de', 'it', 'es'].includes(preferredLanguage);
                const initialLanguage = shouldUseHostLanguage ? preferredLanguage : defaultSettings.language;
                applySettingsFromObject({ ...defaultSettings, ...(inheritedSettings || {}), language: shouldUseHostLanguage ? initialLanguage : (inheritedSettings?.language || initialLanguage) });
                if (isScreenSaverContext && !stored) saveCurrentSettings(false);
                populateProfileDropdown();
            }

            function configureScreenSaverContext() {
                if (isScreenSaverWindow) {
                    document.body.classList.add('screen-saver-active', 'screen-saver-window');
                    // Native Windows Screen Saver mode monitors real user input in the WPF host.
                    // Do not exit from DOM pointer/key events because WebView2 can emit synthetic events
                    // while the full-screen saver is starting.
                }

                if (isScreenSaverConfig) {
                    document.body.classList.add('screen-saver-config');
                    elements.settingsPanel.style.display = 'block';
                }
            }

            function updateLanguageUI() {
                const textMap = {
                    settingsTitle: 'settings', languageLabelSpan: 'language', brightnessLabelSpan: 'brightness', contrastLabelSpan: 'contrast', timeFormatLabelSpan: 'timeFormat', showSecondsLabelSpan: 'showSeconds',
                    showDateLabelSpan: 'showDate', fontLabelSpan: 'font', dateFormatLabelSpan: 'dateFormat', satFontSizeLabelSpan: 'satSize', datumFontSizeLabelSpan: 'datumSize', satFontColorLabelSpan: 'satColor',
                    datumFontColorLabelSpan: 'datumColor', backgroundColorLabelSpan: 'bgColor', resetButtonText: 'reset', autoSizeLabelSpan: 'autoSize', profilesHeaderLabel: 'profileHeader', profileNameLabel: 'profileName',
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
                elements.timerFinishedTitle.textContent = T('timer.finished');
                elements.stopTimerSoundButton.textContent = T('timer.stopSound');
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
                elements.alarmTimeLabel.textContent = T('alarm.time');
                elements.alarmHourLabel.textContent = T('alarm.hour');
                elements.alarmMinuteLabel.textContent = T('alarm.minute');
                elements.closeAlarmButton.title = T('alarm.close');
                elements.alarmSetBtn.textContent = T('alarm.set');
                elements.alarmsListTitle.textContent = T('alarm.active');
                elements.alarmRingingTitle.textContent = T('alarm.ringing');
                elements.stopAlarmButton.textContent = T('alarm.stop');


                updateAccessibilityLabels();
                updateDynamicAccessibilityLabels();
                updateBackupUI();
                updateWindowsHostText();
                updateWindowsSoundText();
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
                updateSliderValueDisplays();
            }
            
            function resetSettings() { if (confirm(T('resetConfirm'))) { applySettingsFromObject(defaultSettings); saveCurrentSettings(); hideInfoPanel(); } }
            
            function updateFullscreenIcon() {
                const fullscreenActive = isWindowsHost() ? windowsFullscreenActive : Boolean(document.fullscreenElement);
                if (fullscreenActive) { elements.fullscreenIcon.classList.replace('fa-expand', 'fa-compress'); elements.fullscreenButton.title = T('exitFullscreen'); }
                else { elements.fullscreenIcon.classList.replace('fa-compress', 'fa-expand'); elements.fullscreenButton.title = T('enterFullscreen'); }
            }

            async function toggleFullscreen() {
                if (isWindowsHost()) {
                    const response = await postWindowsMessage('setFullscreen', { enabled: !windowsFullscreenActive });
                    if (response?.ok && typeof response.payload?.enabled === 'boolean') {
                        windowsFullscreenActive = response.payload.enabled;
                        updateFullscreenIcon();
                    }
                    return;
                }

                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => console.warn(`FS error: ${err.message}`));
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }

            let deferredInstallPrompt = null;
            let screenSaverActive = false;
            let screenSaverRequestedFullscreen = false;

            window.addEventListener('beforeinstallprompt', event => {
                event.preventDefault();
                deferredInstallPrompt = event;
                elements.installAppButton.hidden = false;
            });

            window.addEventListener('appinstalled', () => {
                deferredInstallPrompt = null;
                elements.installAppButton.hidden = true;
            });

            async function installApplication() {
                if (!deferredInstallPrompt) return;

                deferredInstallPrompt.prompt();
                await deferredInstallPrompt.userChoice;
                deferredInstallPrompt = null;
                elements.installAppButton.hidden = true;
            }

            async function startScreenSaver() {
                if (screenSaverActive) return;

                screenSaverActive = true;
                screenSaverRequestedFullscreen = isWindowsHost()
                    ? !windowsFullscreenActive
                    : !document.fullscreenElement;
                document.body.classList.add('screen-saver-active');
                elements.screenSaverButton.setAttribute('aria-pressed', 'true');
                setAccessibleName(elements.screenSaverButton, getAccessibilityText().exitScreenSaver);

                if (screenSaverRequestedFullscreen) {
                    try {
                        if (isWindowsHost()) {
                            const response = await postWindowsMessage('setFullscreen', { enabled: true });
                            if (response?.ok && typeof response.payload?.enabled === 'boolean') {
                                windowsFullscreenActive = response.payload.enabled;
                                updateFullscreenIcon();
                            }
                        } else {
                            await document.documentElement.requestFullscreen();
                        }
                    } catch (error) {
                        screenSaverRequestedFullscreen = false;
                        console.warn('Screen saver fullscreen request failed.', error);
                    }
                }
            }

            async function exitScreenSaver() {
                if (!screenSaverActive) return;

                screenSaverActive = false;
                document.body.classList.remove('screen-saver-active');
                elements.screenSaverButton.setAttribute('aria-pressed', 'false');
                setAccessibleName(elements.screenSaverButton, getAccessibilityText().screenSaver);

                if (screenSaverRequestedFullscreen) {
                    try {
                        if (isWindowsHost() && windowsFullscreenActive) {
                            const response = await postWindowsMessage('setFullscreen', { enabled: false });
                            if (response?.ok && typeof response.payload?.enabled === 'boolean') {
                                windowsFullscreenActive = response.payload.enabled;
                                updateFullscreenIcon();
                            }
                        } else if (document.fullscreenElement && document.exitFullscreen) {
                            await document.exitFullscreen();
                        }
                    } catch (error) {
                        console.warn('Could not exit screen saver fullscreen mode.', error);
                    }
                }

                screenSaverRequestedFullscreen = false;
                elements.screenSaverButton.focus();
            }

            // --- App Logic ---
            function ensureAudioContext() {
                if (!audioContext) {
                    try {
                        audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    } catch (e) {
                        console.error("Web Audio API is not supported.");
                        return null;
                    }
                }

                if (audioContext.state === 'suspended') {
                    const resumePromise = audioContext.resume();
                    if (resumePromise?.catch) {
                        resumePromise.catch(error => console.warn('Could not resume audio context.', error));
                    }
                }

                return audioContext;
            }

            function stopOscillators(soundState) {
                soundState.oscillators.forEach(oscillator => {
                    try { oscillator.stop(); } catch (_) { /* already stopped */ }
                });
                soundState.oscillators = [];
            }

            function scheduleChimeNote(soundState, frequency, startOffset, duration, volume = 0.16, type = 'sine') {
                const context = ensureAudioContext();
                if (!context) return;

                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                const startTime = context.currentTime + startOffset;
                const endTime = startTime + duration;

                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, startTime);

                gainNode.gain.setValueAtTime(0.0001, startTime);
                gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.03);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

                oscillator.start(startTime);
                oscillator.stop(endTime + 0.05);
                soundState.oscillators.push(oscillator);
            }

            function stopTimerCompletionSound(hideModal = true) {
                if (selectedSounds.timer.kind === 'custom') postWindowsMessage('stopCustomSound', { channel: 'timer' });
                if (currentTimerSound.timeoutId) {
                    clearTimeout(currentTimerSound.timeoutId);
                    currentTimerSound.timeoutId = null;
                }
                stopOscillators(currentTimerSound);
                if (hideModal) elements.timerCompleteModal.style.display = 'none';
            }

            function playTimerCompletionSound() {
                stopTimerCompletionSound(false);
                elements.timerCompleteModal.style.display = 'flex';

                if (selectedSounds.timer.kind === 'custom') {
                    postWindowsMessage('playCustomSound', { channel: 'timer', preview: false });
                    return;
                }

                const pattern = getBuiltInPattern('timer', selectedSounds.timer.value);

                for (let cycle = 0; cycle < 3; cycle++) {
                    const offset = cycle * 2.55;
                    pattern.forEach(([frequency, noteOffset, duration]) => {
                        scheduleChimeNote(currentTimerSound, frequency, offset + noteOffset, duration, 0.15, 'triangle');
                    });
                }

                currentTimerSound.timeoutId = setTimeout(() => {
                    stopOscillators(currentTimerSound);
                    currentTimerSound.timeoutId = null;
                    elements.timerCompleteModal.style.display = 'none';
                }, 8200);
            }

            // Timer Logic
            function formatTimerTime(totalSeconds) { const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0'); const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0'); const s = (totalSeconds % 60).toString().padStart(2, '0'); return `${h}:${m}:${s}`; }
            function updateTimerDisplay() { elements.timerDisplay.textContent = formatTimerTime(timerSecondsRemaining); }
            function readTimerValue(input, maximum) {
                if (input.value.trim() === '') {
                    input.value = '0';
                    return 0;
                }

                const value = Number(input.value);

                if (!Number.isInteger(value) || value < 0 || value > maximum) {
                    input.focus();
                    input.reportValidity();
                    return null;
                }

                return value;
            }
            function startPauseTimer() {
                ensureAudioContext();
                if (isTimerRunning) { clearInterval(timerInterval); isTimerRunning = false; elements.timerStartLabel.textContent = T('timer.resume'); elements.startPauseTimer.classList.remove('running'); } 
                else {
                    if (timerSecondsRemaining <= 0 || timerSecondsRemaining === initialTimerSeconds) {
                         const h = readTimerValue(elements.timerHours, 99);
                         const m = readTimerValue(elements.timerMinutes, 59);
                         const s = readTimerValue(elements.timerSeconds, 59);

                         if (h === null || m === null || s === null) return; 
                         initialTimerSeconds = (h * 3600) + (m * 60) + s; 
                         timerSecondsRemaining = initialTimerSeconds; 
                    }
                    if (timerSecondsRemaining <= 0) return;
                    isTimerRunning = true; elements.timerStartLabel.textContent = T('timer.pause'); elements.startPauseTimer.classList.add('running'); [elements.timerHours, elements.timerMinutes, elements.timerSeconds].forEach(inp => inp.disabled = true);
                    timerInterval = setInterval(() => {
                        timerSecondsRemaining--; updateTimerDisplay();
                        if (timerSecondsRemaining <= 0) {
                            clearInterval(timerInterval);
                            timerInterval = null;
                            isTimerRunning = false;
                            timerSecondsRemaining = 0;
                            updateTimerDisplay();
                            elements.timerStartLabel.textContent = T('timer.start');
                            elements.startPauseTimer.classList.remove('running');
                            [elements.timerHours, elements.timerMinutes, elements.timerSeconds]
                                .forEach(input => input.disabled = false);
                            playTimerCompletionSound();
                        }
                    }, 1000);
                }
            }
            function resetTimer() {
                stopTimerCompletionSound();
                clearInterval(timerInterval);
                timerInterval = null;
                isTimerRunning = false;
                initialTimerSeconds = 0;
                timerSecondsRemaining = 0;

                elements.timerHours.value = '0';
                elements.timerMinutes.value = '0';
                elements.timerSeconds.value = '0';

                updateTimerDisplay();
                elements.timerStartLabel.textContent = T('timer.start');
                elements.startPauseTimer.classList.remove('running');

                [elements.timerHours, elements.timerMinutes, elements.timerSeconds]
                    .forEach(input => input.disabled = false);
            }
            function openTimer() { elements.timerContainer.style.display = 'flex'; elements.clockContainer.style.display = 'none'; elements.stopwatchContainer.style.display = 'none'; elements.worldClockContainer.style.display = 'none'; elements.alarmContainer.style.display = 'none'; }
            function closeTimer() {
                elements.timerContainer.style.display = 'none';
                elements.clockContainer.style.display = 'flex';
                clearInterval(timerInterval);
                timerInterval = null;
                isTimerRunning = false;
                stopTimerCompletionSound();
                elements.startPauseTimer.classList.remove('running');
                elements.timerStartLabel.textContent = timerSecondsRemaining > 0 ? T('timer.resume') : T('timer.start');
                [elements.timerHours, elements.timerMinutes, elements.timerSeconds].forEach(input => input.disabled = false);
            }

            // Stopwatch Logic
            function formatStopwatchTime(ms) {
                const totalCentiseconds = Math.floor(ms / 10);
                const centiseconds = (totalCentiseconds % 100).toString().padStart(2, '0');
                const totalSeconds = Math.floor(totalCentiseconds / 100);
                const seconds = (totalSeconds % 60).toString().padStart(2, '0');
                const totalMinutes = Math.floor(totalSeconds / 60);
                const minutes = (totalMinutes % 60).toString().padStart(2, '0');
                const hours = Math.floor(totalMinutes / 60);

                return hours > 0
                    ? `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}.${centiseconds}`
                    : `${minutes}:${seconds}.${centiseconds}`;
            }
            function stopwatchLoop(timestamp) { if (!isStopwatchRunning) return; stopwatchElapsedTime = timestamp - stopwatchStartTime; elements.stopwatchDisplay.textContent = formatStopwatchTime(stopwatchElapsedTime); stopwatchInterval = requestAnimationFrame(stopwatchLoop); }
            function startPauseStopwatch() {
                if (isStopwatchRunning) { isStopwatchRunning = false; cancelAnimationFrame(stopwatchInterval); stopwatchElapsedTime = performance.now() - stopwatchStartTime; elements.stopwatchStartLabel.textContent = T('stopwatch.resume'); elements.startPauseStopwatch.classList.remove('running'); } 
                else { isStopwatchRunning = true; stopwatchStartTime = performance.now() - stopwatchElapsedTime; requestAnimationFrame(stopwatchLoop); elements.stopwatchStartLabel.textContent = T('stopwatch.pause'); elements.startPauseStopwatch.classList.add('running'); }
            }
            function resetStopwatch() { cancelAnimationFrame(stopwatchInterval); isStopwatchRunning = false; stopwatchElapsedTime = 0; lapTimes = []; elements.stopwatchDisplay.textContent = formatStopwatchTime(0); elements.lapsList.innerHTML = ''; elements.stopwatchStartLabel.textContent = T('stopwatch.start'); elements.startPauseStopwatch.classList.remove('running'); }
            function recordLap() { if (!isStopwatchRunning) return; const lapTime = formatStopwatchTime(stopwatchElapsedTime); lapTimes.push(lapTime); const li = document.createElement('li'); li.innerHTML = `<span class="lap-number">${T('stopwatch.lap')} ${lapTimes.length}</span><span>${lapTime}</span>`; elements.lapsList.prepend(li); }
            function openStopwatch() { elements.stopwatchContainer.style.display = 'flex'; elements.clockContainer.style.display = 'none'; elements.timerContainer.style.display = 'none'; elements.worldClockContainer.style.display = 'none'; elements.alarmContainer.style.display = 'none'; }
function closeStopwatch() {
                if (isStopwatchRunning) startPauseStopwatch();
                elements.stopwatchContainer.style.display = 'none';
                elements.clockContainer.style.display = 'flex';
            }

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
                    const removeCityLabel = formatAccessibilityText(
                        getAccessibilityText().removeCity,
                        cityName
                    );
                    setAccessibleName(removeButton, removeCityLabel);
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
                    const toggleButton = alarmItem.querySelector('.toggle-alarm');
                    const deleteButton = alarmItem.querySelector('.delete-alarm-btn');
                    const accessibilityText = getAccessibilityText();

                    setAccessibleName(
                        toggleButton,
                        formatAccessibilityText(accessibilityText.enableAlarm, alarm.time)
                    );
                    setAccessibleName(
                        deleteButton,
                        formatAccessibilityText(accessibilityText.deleteAlarm, alarm.time)
                    );

                    elements.alarmsList.appendChild(alarmItem);
                });
            }

            function setAlarm() {
                ensureAudioContext();
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

            function playAlarmChimeCycle() {
                stopOscillators(currentAlarmSound);
                const pattern = getBuiltInPattern('alarm', selectedSounds.alarm.value);

                pattern.forEach(([frequency, offset, duration]) => {
                    scheduleChimeNote(currentAlarmSound, frequency, offset, duration, 0.18, 'triangle');
                });
            }

            function triggerAlarm(alarm) {
                if (selectedSounds.alarm.kind !== 'custom' && !ensureAudioContext()) return;

                alarm.isRinging = true;
                elements.alarmRingingModal.style.display = 'flex';

                if (currentAlarmSound.intervalId) clearInterval(currentAlarmSound.intervalId);
                stopOscillators(currentAlarmSound);
                if (selectedSounds.alarm.kind === 'custom') {
                    postWindowsMessage('playCustomSound', { channel: 'alarm', preview: false });
                } else {
                    playAlarmChimeCycle();
                    currentAlarmSound.intervalId = setInterval(playAlarmChimeCycle, 2800);
                }
            }

            function stopAlarmSound(alarm = null) {
                elements.alarmRingingModal.style.display = 'none';

                if (currentAlarmSound.intervalId) {
                    clearInterval(currentAlarmSound.intervalId);
                    currentAlarmSound.intervalId = null;
                }
                stopOscillators(currentAlarmSound);
                if (selectedSounds.alarm.kind === 'custom') postWindowsMessage('stopCustomSound', { channel: 'alarm' });

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
            elements.copyAppearanceFromAppButton?.addEventListener('click', copyAppearanceFromMainApp);
            elements.settingsMenu.addEventListener('click', () => { const isVisible = elements.settingsPanel.style.display === 'block'; elements.settingsPanel.style.display = isVisible ? 'none' : 'block'; if (!isVisible) hideInfoPanel(); });
            elements.infoButton.addEventListener('click', () => { toggleInfoPanel(); if (elements.infoSidePanel.classList.contains('info-panel-visible')) elements.settingsPanel.style.display = 'none'; });
            elements.languageSelect.addEventListener('change', (e) => { languageWasSelectedByUser = true; currentTranslations = translations[e.target.value] || translations.en; updateLanguageUI(); if (elements.infoSidePanel.classList.contains('info-panel-visible')) populateInfoPanel(); saveCurrentSettings(); });
            ['showSecondsCheckbox', 'timeFormatSelect'].forEach(id => elements[id].addEventListener('change', () => { updateTime(); updateSizingMode(); saveCurrentSettings(); }));
            ['showDateCheckbox', 'dateFormatSelect'].forEach(id => elements[id].addEventListener('change', () => { updateDate(true); updateSizingMode(); saveCurrentSettings(); }));
            elements.autoSizeCheckbox.addEventListener('change', () => { updateSizingMode(); saveCurrentSettings(); });
            [elements.satFontSize, elements.datumFontSize].forEach(slider => {
                slider.addEventListener('input', () => {
                    if (elements.autoSizeCheckbox.checked) elements.autoSizeCheckbox.checked = false;
                    if (isScreenSaverContext) copiedScreenSaverRenderedSizes = null;
                    updateSizingMode();
                });
                slider.addEventListener('change', saveCurrentSettings);
            });
            [elements.brightness, elements.contrast, elements.fontSelect, elements.satFontColor, elements.datumFontColor, elements.backgroundColor].forEach(input => {
                const eventType = (input.type === 'range' || input.type === 'color') ? 'input' : 'change';
                input.addEventListener(eventType, (e) => {
                    if (isNightModeActive && ['backgroundColor', 'satFontColor', 'datumFontColor', 'brightness'].includes(e.target.id)) { isNightModeActive = false; updateNightModeIcon(); }
                    applyBasicVisualSettings();
                    if (e.target.id === 'fontSelect') updateSizingMode();
                });
                input.addEventListener('change', saveCurrentSettings);
            });
            elements.nightModeToggle.addEventListener('click', toggleNightMode);
            elements.infoSidePanelCloseButton.addEventListener('click', hideInfoPanel);
            elements.resetButton.addEventListener('click', resetSettings);
            elements.fullscreenButton.addEventListener('click', toggleFullscreen);
            elements.installAppButton.addEventListener('click', installApplication);
            elements.screenSaverButton.addEventListener('click', startScreenSaver);
            document.addEventListener('pointerdown', () => {
                if (screenSaverActive) exitScreenSaver();
            });
            document.addEventListener('keydown', event => {
                if (!screenSaverActive) return;
                event.preventDefault();
                event.stopImmediatePropagation();
                exitScreenSaver();
            });
            document.addEventListener('fullscreenchange', () => { updateFullscreenIcon(); updateSizingMode(); });
            let resizeAppearanceSaveTimer = null;
            window.addEventListener('resize', () => {
                updateSizingMode();
                if (!isScreenSaverContext && isWindowsHost()) {
                    if (resizeAppearanceSaveTimer) clearTimeout(resizeAppearanceSaveTimer);
                    resizeAppearanceSaveTimer = setTimeout(() => {
                        resizeAppearanceSaveTimer = null;
                        saveCurrentSettings();
                    }, 250);
                }
            });
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

                    const saved = writeStorageAtomically([
                        [CURRENT_SETTINGS_KEY, importedData.settings],
                        [PROFILES_STORAGE_KEY, importedData.profiles],
                        [WORLD_CLOCK_KEY, importedData.cities],
                        [ALARM_KEY, importedData.alarms]
                    ]);

                    if (!saved) {
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
            elements.stopTimerSoundButton.addEventListener('click', stopTimerCompletionSound);
            elements.timerSoundSelect.addEventListener('change', () => changeSound('timer'));
            elements.alarmSoundSelect.addEventListener('change', () => changeSound('alarm'));
            elements.chooseTimerSoundButton.addEventListener('click', () => chooseCustomSound('timer'));
            elements.chooseAlarmSoundButton.addEventListener('click', () => chooseCustomSound('alarm'));
            elements.previewTimerSoundButton.addEventListener('click', () => previewSelectedSound('timer'));
            elements.previewAlarmSoundButton.addEventListener('click', () => previewSelectedSound('alarm'));
            elements.startWithWindowsCheckbox.addEventListener('change', () => updateWindowsHostPreference('setStartWithWindows', elements.startWithWindowsCheckbox));
            elements.keepDisplayAwakeCheckbox.addEventListener('change', () => updateWindowsHostPreference('setKeepDisplayAwake', elements.keepDisplayAwakeCheckbox));
            elements.bedsideModeButton.addEventListener('click', updateBedsideMode);
            elements.bedsideExitButton.addEventListener('click', updateBedsideMode);
            elements.bedsideBrightness.addEventListener('input', updateBedsideBrightness);
            elements.bedsideBrightness.addEventListener('change', saveCurrentSettings);
            document.addEventListener('pointermove', revealBedsideBrightnessControl);
            elements.bedsideBrightnessControl.addEventListener('pointerenter', () => {
                if (bedsideControlsTimer) clearTimeout(bedsideControlsTimer);
            });
            elements.bedsideBrightnessControl.addEventListener('pointerleave', revealBedsideBrightnessControl);
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
            async function init() {
                function populateLanguageOptions() { const langSelect = elements.languageSelect; const current = langSelect.value || 'en'; langSelect.innerHTML = ''; Object.entries(translations.en.languageNames).forEach(([code, name]) => { const opt = document.createElement('option'); opt.value = code; opt.textContent = name; langSelect.appendChild(opt); }); langSelect.value = current; }
                populateLanguageOptions();
                populateTimeZoneSelect();
                populateAlarmSelectors();
                loadAlarms();
                const hostInfo = isScreenSaverContext ? null : await initialiseWindowsBridge();
                // Export only actual legacy settings; the native store never replaces a valid snapshot during migration.
                if (isWindowsHost() && (!isScreenSaverContext || isScreenSaverConfig)) {
                    const legacy = readStorage(SCREEN_SAVER_SETTINGS_KEY, null);
                    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
                        if (isScreenSaverConfig) {
                            window.chrome.webview.postMessage({ action: 'migrateScreenSaverAppearance', settings: legacy });
                        } else {
                            await postWindowsMessage('migrateScreenSaverAppearance', { settings: legacy });
                        }
                    }
                }
                windowsFullscreenActive = hostInfo?.hostPreferences?.fullscreenMode === true;
                applyWindowsHostPreferences(hostInfo?.hostPreferences);
                loadSettings(hostInfo?.language || null);
                if (!isScreenSaverContext) saveCurrentSettings();
                configureScreenSaverContext();
                setInterval(() => { updateTime(); updateDate(); checkAlarms(); }, 1000);
                updateTimerDisplay();
                elements.stopwatchDisplay.textContent = formatStopwatchTime(0);
            }
            init().catch(error => console.warn('Digital Clock initialisation failed.', error));
        });