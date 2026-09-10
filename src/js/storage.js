export function readStorage(key, fallbackValue) {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue === null) return fallbackValue;

        const parsedValue = JSON.parse(storedValue);
        return parsedValue ?? fallbackValue;
    } catch (error) {
        console.warn(`Could not read localStorage key "${key}".`, error);
        return fallbackValue;
    }
}

export function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Could not save localStorage key "${key}".`, error);
        return false;
    }
}
export function writeStorageAtomically(entries) {
    const previousValues = new Map();

    try {
        for (const [key] of entries) {
            previousValues.set(key, localStorage.getItem(key));
        }

        for (const [key, value] of entries) {
            localStorage.setItem(key, JSON.stringify(value));
        }

        return true;
    } catch (error) {
        console.warn('Could not complete atomic localStorage update.', error);

        // Remove imported values first to free space for the original data.
        for (const [key] of previousValues) {
            try {
                localStorage.removeItem(key);
            } catch (removeError) {
                console.warn(`Could not remove imported localStorage key "${key}".`, removeError);
            }
        }

        // Restore the complete state that existed before the import.
        for (const [key, previousValue] of previousValues) {
            if (previousValue === null) continue;

            try {
                localStorage.setItem(key, previousValue);
            } catch (rollbackError) {
                console.warn(`Could not restore localStorage key "${key}".`, rollbackError);
            }
        }
        return false;
    }
}
