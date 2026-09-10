import { TIME_ZONES } from '../data/timezones.js';

const BACKUP_APP_ID = 'digital-clock';
const BACKUP_FORMAT_VERSION = 1;

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const ALLOWED_LANGUAGES = new Set(['en', 'hr', 'de', 'it', 'es']);
const ALLOWED_FONTS = new Set([
    'Arial, sans-serif',
    "'Orbitron', sans-serif",
    "'Roboto Mono', monospace",
    "'Digital Numbers', sans-serif",
    'Times New Roman, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    "'Segment7Standard', monospace",
    'monospace'
]);
const ALLOWED_TIME_FORMATS = new Set(['12', '24']);
const ALLOWED_DATE_FORMATS = new Set([
    'dd.mm.yyyy.',
    'mm.dd.yyyy.',
    'dd.mmm.yyyy.',
    'ddd dd.mm.yyyy.',
    'day dd.mm.yyyy.'
]);
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function requireString(value, allowedValues, fieldName) {
    if (typeof value !== 'string' || !allowedValues.has(value)) {
        throw new Error(`Invalid setting: ${fieldName}.`);
    }
    return value;
}

function requireRangeString(value, minimum, maximum, fieldName) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Invalid setting: ${fieldName}.`);
    }

    const number = Number(value);
    if (!Number.isFinite(number) || number < minimum || number > maximum) {
        throw new Error(`Invalid setting: ${fieldName}.`);
    }

    return value;
}

function requireBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
        throw new Error(`Invalid setting: ${fieldName}.`);
    }
    return value;
}

function normalizeSettings(settings) {
    if (!isObject(settings)) throw new Error('Invalid settings.');

    if (typeof settings.backgroundColor !== 'string' || !COLOR_PATTERN.test(settings.backgroundColor)
        || typeof settings.satFontColor !== 'string' || !COLOR_PATTERN.test(settings.satFontColor)
        || typeof settings.datumFontColor !== 'string' || !COLOR_PATTERN.test(settings.datumFontColor)) {
        throw new Error('Invalid color settings.');
    }

    return {
        backgroundColor: settings.backgroundColor,
        satFontColor: settings.satFontColor,
        datumFontColor: settings.datumFontColor,
        fontSelect: requireString(settings.fontSelect, ALLOWED_FONTS, 'fontSelect'),
        satFontSize: requireRangeString(settings.satFontSize, 5, 40, 'satFontSize'),
        datumFontSize: requireRangeString(settings.datumFontSize, 3, 25, 'datumFontSize'),
        brightness: requireRangeString(settings.brightness, 0, 1, 'brightness'),
        contrast: requireRangeString(settings.contrast, 0, 1, 'contrast'),
        timeFormat: requireString(settings.timeFormat, ALLOWED_TIME_FORMATS, 'timeFormat'),
        dateFormat: requireString(settings.dateFormat, ALLOWED_DATE_FORMATS, 'dateFormat'),
        showSeconds: requireBoolean(settings.showSeconds, 'showSeconds'),
        showDate: requireBoolean(settings.showDate, 'showDate'),
        language: requireString(settings.language, ALLOWED_LANGUAGES, 'language'),
        isNightModeActive: requireBoolean(settings.isNightModeActive, 'isNightModeActive'),
        isAutoSizeActive: requireBoolean(settings.isAutoSizeActive, 'isAutoSizeActive')
    };
}

function normalizeProfile(profile) {
    if (!isObject(profile)
        || typeof profile.name !== 'string'
        || profile.name.trim().length === 0
        || profile.name.length > 100) {
        throw new Error('Invalid profile.');
    }

    return {
        name: profile.name.trim(),
        settings: normalizeSettings(profile.settings)
    };
}

function normalizeAlarm(alarm) {
    const validId = (typeof alarm?.id === 'number' && Number.isFinite(alarm.id))
        || (typeof alarm?.id === 'string' && alarm.id.length > 0 && alarm.id.length <= 100);

    if (!isObject(alarm)
        || !validId
        || typeof alarm.time !== 'string'
        || !/^([01]\d|2[0-3]):[0-5]\d$/.test(alarm.time)
        || typeof alarm.isActive !== 'boolean') {
        throw new Error('Invalid alarm.');
    }

    return {
        id: alarm.id,
        time: alarm.time,
        isActive: alarm.isActive,
        isRinging: false
    };
}

function validateData(data) {
    if (!isObject(data)) throw new Error('Invalid backup data.');
    if (!Array.isArray(data.profiles) || data.profiles.length > 100) {
        throw new Error('Invalid profiles.');
    }
    if (!Array.isArray(data.cities)
        || data.cities.length > TIME_ZONES.length
        || !data.cities.every(city => TIME_ZONES.includes(city))
        || new Set(data.cities).size !== data.cities.length) {
        throw new Error('Invalid world clock cities.');
    }
    if (!Array.isArray(data.alarms) || data.alarms.length > 100) {
        throw new Error('Invalid alarms.');
    }

    const profiles = data.profiles.map(normalizeProfile);
    const alarms = data.alarms.map(normalizeAlarm);

    if (new Set(profiles.map(profile => profile.name)).size !== profiles.length
        || new Set(alarms.map(alarm => String(alarm.id))).size !== alarms.length) {
        throw new Error('Duplicate profile or alarm identifiers.');
    }

    return {
        settings: normalizeSettings(data.settings),
        profiles,
        cities: [...data.cities],
        alarms
    };
}
export function downloadBackup(data) {
    const payload = {
        app: BACKUP_APP_ID,
        formatVersion: BACKUP_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        data: validateData(data)
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `digital-clock-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export async function readBackupFile(file) {
    if (!file || file.type !== 'application/json') {
        throw new Error('Please select a JSON backup file.');
    }

    const text = await file.text();
    const payload = JSON.parse(text);

    if (!isObject(payload)
        || payload.app !== BACKUP_APP_ID
        || payload.formatVersion !== BACKUP_FORMAT_VERSION) {
        throw new Error('This is not a supported Digital Clock backup.');
    }

    return validateData(payload.data);
}
export const BACKUP_TEXT = {
    en: {
        title: 'Backup',
        export: 'Export backup',
        import: 'Import backup',
        selectFile: 'Select Digital Clock backup',
        importConfirm: 'Importing will replace current settings, profiles, alarms and world clock cities. Continue?',
        importSuccess: 'Backup imported successfully.',
        importError: 'The selected backup could not be imported.'
    },
    hr: {
        title: 'Sigurnosna kopija',
        export: 'Izvezi sigurnosnu kopiju',
        import: 'Uvezi sigurnosnu kopiju',
        selectFile: 'Odaberite sigurnosnu kopiju Digital Clocka',
        importConfirm: 'Uvoz će zamijeniti trenutačne postavke, profile, alarme i gradove svjetskog sata. Želite li nastaviti?',
        importSuccess: 'Sigurnosna kopija uspješno je uvezena.',
        importError: 'Odabranu sigurnosnu kopiju nije moguće uvesti.'
    },
    de: {
        title: 'Sicherung',
        export: 'Sicherung exportieren',
        import: 'Sicherung importieren',
        selectFile: 'Digital-Clock-Sicherung auswählen',
        importConfirm: 'Der Import ersetzt die aktuellen Einstellungen, Profile, Alarme und Weltzeituhr-Städte. Fortfahren?',
        importSuccess: 'Sicherung erfolgreich importiert.',
        importError: 'Die ausgewählte Sicherung konnte nicht importiert werden.'
    },
    it: {
        title: 'Backup',
        export: 'Esporta backup',
        import: 'Importa backup',
        selectFile: 'Seleziona il backup di Digital Clock',
        importConfirm: 'L’importazione sostituirà impostazioni, profili, sveglie e città dell’orologio mondiale. Continuare?',
        importSuccess: 'Backup importato correttamente.',
        importError: 'Impossibile importare il backup selezionato.'
    },
    es: {
        title: 'Copia de seguridad',
        export: 'Exportar copia',
        import: 'Importar copia',
        selectFile: 'Seleccionar copia de Digital Clock',
        importConfirm: 'La importación sustituirá los ajustes, perfiles, alarmas y ciudades del reloj mundial. ¿Continuar?',
        importSuccess: 'Copia importada correctamente.',
        importError: 'No se pudo importar la copia seleccionada.'
    }
};
