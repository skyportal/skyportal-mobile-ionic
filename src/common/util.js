/**
 * Navigate to a new path with params
 * @param {import("history").History} history
 * @param {string} path
 * @param {Object} options
 * @param {Record<string, string>} [options.params]
 * @param {any} [options.state]
 * @param {boolean} [options.replace]
 */
export const navigateWithParams = (
  history,
  path,
  { params, state, replace = false },
) => {
  history[replace ? "replace" : "push"](
    `${path}?${new URLSearchParams(params).toString()}`,
    state,
  );
};

/**
 * @typedef {"auto"|"light"|"dark"} DarkMode
 */

/**
 * @param {DarkMode} darkModePreference
 * @param {boolean} [systemIsDark]
 * @returns {boolean}
 */
export const isActuallyDarkMode = (
  darkModePreference,
  systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches,
) => {
  return (
    darkModePreference === "dark" ||
    (systemIsDark && darkModePreference === "auto")
  );
};

/**
 * @param {DarkMode} darkModePreference
 * @param {boolean} [systemIsDark]
 */
export const setDarkModeInDocument = (
  darkModePreference,
  systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches,
) => {
  document.documentElement.classList.toggle(
    "ion-palette-dark",
    isActuallyDarkMode(darkModePreference, systemIsDark),
  );
};
