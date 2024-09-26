import { Preferences } from "@capacitor/preferences";

/**
 *
 * @typedef {Object} SkyPortalInstance
 * @property {string} name - The name of the instance
 * @property {string} url - The URL of the instance
 */

/**
 * @typedef {"all" | "savedToAllSelected" | "savedToAnySelected" | "savedToAnyAccessible" | "notSavedToAnyAccessible" | "notSavedToAnySelected" | "notSavedToAllSelected"} SavedStatus
 */

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

/**
 * Set a preference in the app
 * @param {string} key - The key to associate with the value being set in preferences.
 * @param {any} value - The value to set in preferences with the associated key.
 * @returns {Promise<void>}
 */
export async function setPreference(key, value) {
  return await Preferences.set({ key, value: JSON.stringify(value) });
}

/**
 * Get a preference in the app
 * @param {string} key - The key to retrieve the value from preferences.
 * @returns {Promise<any|null>}
 */
export async function getPreference(key) {
  const pref = await Preferences.get({ key });
  if (pref.value !== null) {
    return JSON.parse(pref.value);
  }
  return null;
}

/**
 * Clear a preference in the app
 * @param {string} key - The key to clear from preferences.
 * @returns {Promise<void>}
 */
export async function clearPreference(key) {
  return await Preferences.remove({ key });
}

/**
 * The instances that are available for login
 * @type {SkyPortalInstance[]}
 */
export const INSTANCES = [
  { name: "ICARE", url: "https://skyportal-icare.ijclab.in2p3.fr" },
  { name: "FRITZ", url: "https://fritz.science" },
  { name: "FRITZ preview", url: "https://preview.fritz.science" },
];
export const QUERY_PARAMS = {
  TOKEN: "token",
  INSTANCE: "instance",
};
export const QUERY_KEYS = {
  CANDIDATES: "candidates",
  SOURCES: "sources",
  USER_PROFILE: "user",
  USER_INFO: "userInfo",
  GROUPS: "groups",
  SOURCE_PHOTOMETRY: "sourcePhotometry",
  CONFIG: "config",
  APP_START: "appStart",
  BANDPASS_COLORS: "bandpassColors",
  SCANNING_PROFILES: "scanningProfiles",
  ANNOTATIONS_INFO: "annotationsInfo",
  APP_PREFERENCES: "appPreferences",
};
/**
 * @type {Object.<SavedStatus, string>}
 */
export const SAVED_STATUS = {
  ALL: "all",
  SAVED_TO_ALL_SELECTED: "savedToAllSelected",
  SAVED_TO_ANY_SELECTED: "savedToAnySelected",
  SAVED_TO_ANY_ACCESSIBLE: "savedToAnyAccessible",
  NOT_SAVED_TO_ANY_ACCESSIBLE: "notSavedToAnyAccessible",
  NOT_SAVED_TO_ANY_SELECTED: "notSavedToAnySelected",
  NOT_SAVED_TO_ALL_SELECTED: "notSavedToAllSelected",
};
export const CANDIDATES_PER_PAGE = 50;
