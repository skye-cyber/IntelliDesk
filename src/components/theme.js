// Initialize theme based on user's previous preference or system preference
const userTheme = localStorage.getItem("theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const currentTheme = userTheme || systemTheme;
const themeSwitch = document.getElementById("themeSwitch");
const rootElement = document.documentElement;
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');

// Set the initial theme
setTheme(currentTheme);
//Set code these styleSheet
window.electron.addCodeThemeSheet(currentTheme);


// Function to set the theme
function setTheme(theme) {

    if (theme === "dark") {
        rootElement.classList.add("dark");
        themeSwitch.checked = true;
        window.isDark = true;

        //change canvas icons
        iconSun.classList.remove('hidden');
        iconMoon.classList.add('hidden');
    } else {
        rootElement.classList.remove("dark");
        window.isDark = false;

        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
    }

    window.electron.ThemeChangeDispatch()

    localStorage.setItem("theme", theme);
}

// Toggle theme on switch click
themeSwitch.addEventListener("click", () => {
    const newTheme = rootElement.classList.contains("dark") ? "light" : "dark";
    setTheme(newTheme);
    window.electron.addCodeThemeSheet(newTheme);
});
