function isDisplayed(element) {
    return element && getComputedStyle(element).display !== 'none';
}

export function setupEscapeHandling(options) {
    const {
        infoPanel,
        settingsPanel,
        infoButton,
        settingsButton,
        closeInfo,
        views
    } = options;

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;

        if (infoPanel.classList.contains('info-panel-visible')) {
            closeInfo();
            infoButton.focus();
            return;
        }

        if (isDisplayed(settingsPanel)) {
            settingsPanel.style.display = 'none';
            settingsButton.focus();
            return;
        }

        const activeView = views.find(view => isDisplayed(view.panel));
        if (activeView) {
            activeView.close();
            activeView.trigger.focus();
        }
    });
}
