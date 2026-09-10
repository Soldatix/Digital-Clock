const BACKUP_APP_ID = 'digital-clock';
const BACKUP_FORMAT_VERSION = 1;

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidProfile(profile) {
    return isObject(profile)
        && typeof profile.name === 'string'
        && profile.name.trim().length > 0
        && profile.name.length <= 100
        && isObject(profile.settings);
}

function isValidAlarm(alarm) {
    return isObject(alarm)
        && (typeof alarm.id === 'number' || typeof alarm.id === 'string')
        && typeof alarm.time === 'string'
        && /^([01]\d|2[0-3]):[0-5]\d$/.test(alarm.time)
        && typeof alarm.isActive === 'boolean';
}

function validateData(data) {
    if (!isObject(data)) throw new Error('Invalid backup data.');
    if (!isObject(data.settings)) throw new Error('Invalid settings.');
    if (!Array.isArray(data.profiles) || !data.profiles.every(isValidProfile)) {
        throw new Error('Invalid profiles.');
    }
    if (!Array.isArray(data.cities) || !data.cities.every(city => typeof city === 'string' && city.length <= 100)) {
        throw new Error('Invalid world clock cities.');
    }
    if (!Array.isArray(data.alarms) || !data.alarms.every(isValidAlarm)) {
        throw new Error('Invalid alarms.');
    }

    return data;
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
