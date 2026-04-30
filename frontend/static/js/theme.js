(() => {
    const STORAGE_KEY = "planyachop-theme";
    const THEME_DARK = "dark";
    const THEME_LIGHT = "light";

    function resolveInitialTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === THEME_DARK || stored === THEME_LIGHT) {
            return stored;
        }
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? THEME_DARK : THEME_LIGHT;
    }

    function applyTheme(theme) {
        const next = theme === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
        syncToggleLabel(next);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme") === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
        applyTheme(current === THEME_DARK ? THEME_LIGHT : THEME_DARK);
    }

    function ensureToggleButton() {
        if (document.getElementById("globalThemeToggle")) {
            return;
        }
        const button = document.createElement("button");
        button.id = "globalThemeToggle";
        button.type = "button";
        button.className = "theme-toggle-btn";
        button.addEventListener("click", toggleTheme);
        document.body.appendChild(button);
    }

    function syncToggleLabel(theme) {
        const button = document.getElementById("globalThemeToggle");
        if (!button) {
            return;
        }
        const next = theme === THEME_DARK ? "Light mode" : "Dark mode";
        const icon = theme === THEME_DARK ? "fa-sun" : "fa-moon";
        button.innerHTML = `<i class="fas ${icon}"></i> ${next}`;
        button.setAttribute("aria-label", `Switch to ${next}`);
        button.setAttribute("title", `Switch to ${next}`);
    }

    document.addEventListener("DOMContentLoaded", () => {
        ensureToggleButton();
        applyTheme(resolveInitialTheme());
    });
})();
