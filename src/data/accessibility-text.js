export const ACCESSIBILITY_TEXT = {
    en: {
        info: 'Information and donations',
        closeInfo: 'Close information panel',
        selectCity: 'Select a world clock city',
        alarmHour: 'Select alarm hour',
        alarmMinute: 'Select alarm minute',
        enableAlarm: 'Enable alarm {time}',
        deleteAlarm: 'Delete alarm {time}',
        removeCity: 'Remove {city}'
    },
    hr: {
        info: 'Informacije i donacije',
        closeInfo: 'Zatvori panel informacija',
        selectCity: 'Odaberite grad svjetskog sata',
        alarmHour: 'Odaberite sat alarma',
        alarmMinute: 'Odaberite minute alarma',
        enableAlarm: 'Uključi alarm {time}',
        deleteAlarm: 'Obriši alarm {time}',
        removeCity: 'Ukloni grad {city}'
    },
    de: {
        info: 'Informationen und Spenden',
        closeInfo: 'Informationsfenster schließen',
        selectCity: 'Stadt für die Weltzeituhr auswählen',
        alarmHour: 'Alarmstunde auswählen',
        alarmMinute: 'Alarmminute auswählen',
        enableAlarm: 'Alarm {time} aktivieren',
        deleteAlarm: 'Alarm {time} löschen',
        removeCity: 'Stadt {city} entfernen'
    },
    it: {
        info: 'Informazioni e donazioni',
        closeInfo: 'Chiudi il pannello informazioni',
        selectCity: 'Seleziona una città per l’orologio mondiale',
        alarmHour: 'Seleziona l’ora della sveglia',
        alarmMinute: 'Seleziona i minuti della sveglia',
        enableAlarm: 'Attiva la sveglia {time}',
        deleteAlarm: 'Elimina la sveglia {time}',
        removeCity: 'Rimuovi la città {city}'
    },
    es: {
        info: 'Información y donaciones',
        closeInfo: 'Cerrar el panel de información',
        selectCity: 'Seleccionar una ciudad del reloj mundial',
        alarmHour: 'Seleccionar la hora de la alarma',
        alarmMinute: 'Seleccionar los minutos de la alarma',
        enableAlarm: 'Activar alarma {time}',
        deleteAlarm: 'Eliminar alarma {time}',
        removeCity: 'Eliminar ciudad {city}'
    }
};

export function formatAccessibilityText(template, value) {
    return template.replace(/\{(?:time|city)\}/, value);
}
