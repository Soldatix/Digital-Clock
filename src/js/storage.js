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
