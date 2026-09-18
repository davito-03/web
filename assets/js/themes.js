// Apply theme immediately to prevent flashing of default theme
const savedTheme = localStorage.getItem('site-theme') || 'dark';
applyTheme(savedTheme);

document.addEventListener('DOMContentLoaded', () => {
    const themeSelector = document.getElementById('main-theme-selector');
    if (!themeSelector) return;

    // Update the dropdown to match the current theme
    themeSelector.value = savedTheme;

    // Listen for changes from the user
    themeSelector.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        applyTheme(selectedTheme);
        localStorage.setItem('site-theme', selectedTheme);
    });
});

function applyTheme(themeName) {
    // We use data-theme on the html element to apply CSS variables
    if (themeName === 'dark') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }
}
