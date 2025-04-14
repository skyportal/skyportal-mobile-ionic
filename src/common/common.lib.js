import { Preferences } from "@capacitor/preferences";

/**
 *
 * @typedef {Object} SkyPortalInstance
 * @property {string} name - The name of the instance
 * @property {string} url - The URL of the instance
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 */

/**
 * @typedef {Object} Allocation
 * @property {string} id - Allocation ID
 * @property {string} pi - Principal investigator
 * @property {Group} group - Group details
 * @property {string[]} types - Types of the allocation
 * @property {Instrument} instrument - Instrument details
 */

/**
 * @typedef {Object} AllocationApiClassname
 * @property {string} id - Allocation ID
 * @property {Instrument} instrument - Instrument details
 * @property {string} pi - Principal investigator
 * @property {number} group_id - Group ID
 * @property {number[]} default_share_group_ids - Default share group IDs
 * @property {string} instrument_id - Instrument ID
 * @property {string[]} types - Types of the allocation
 */

/**
 * @typedef {Object} Instrument
 * @property {string} id - Instrument ID
 * @property {string} name - Instrument name
 * @property {Telescope} telescope - Telescope details
 */

/**
 * @typedef {Object} Telescope
 * @property {string} id - Telescope ID
 * @property {string} name - Telescope name
 */

/**
 * @typedef {Object} Group
 * @property {number} id - Group ID
 * @property {string|null} [nickname] - Group nickname
 * @property {string} name - Group name
 * @property {string|null} [description] - Group description
 * @property {boolean} private - Is the group private
 * @property {boolean} single_user_group - Is the group a single user group
 */

/**
 * @typedef {Object} GroupsResponse - Response from the /groups endpoint
 * @property {Group[]} user_groups - User groups
 * @property {Group[]} user_accessible_groups - User accessible groups
 * @property {Group[]} all_groups - All groups
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
 * Formats a date and time string into a more readable format.
 * @param {string} dateTime - The date and time string to format.
 * @returns {string} The formatted date and time string.
 */
export const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  });
};

/**
 * @param {Date} dateTime
 * @param {"date"|"datetime"} format
 */
export const formatIsoDateString = (dateTime, format="datetime") => {
  const date = dateTime.toISOString()
  if (format === "date") {
    return date.split("T")[0]

  }
  return date.replace("Z", "")
    .replace("T", " ")
    .split(".")[0];
}

/**
 * @param {string} stringUTCDate
 * @returns {string}
 */
export const getDateDiff = (/** @type {string} */stringUTCDate) => {
  const date = new Date(stringUTCDate + "Z"); // Add 'Z' to indicate that the date is in UTC
  if (isNaN(date.getTime())) {
    return "...";
  }
  const diff = new Date().getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / (1000 * 60));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 365) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
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
  SOURCE_SPECTRA: "sourceSpectra",
  ALLOCATIONS: "allocations",
  ALLOCATIONS_API_CLASSNAME: "allocationsApiClassname",
  FOLLOWUP_APIS: "followupApis",
  INSTRUMENT_FORMS: "instrumentForms",
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
