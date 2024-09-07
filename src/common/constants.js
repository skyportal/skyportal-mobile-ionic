/**
 *
 * @typedef {Object} SkyPortalInstance
 * @property {string} name - The name of the instance
 * @property {string} url - The URL of the instance
 */

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
};

/**
 * @typedef {"all" | "savedToAllSelected" | "savedToAnySelected" | "savedToAnyAccessible" | "notSavedToAnyAccessible" | "notSavedToAnySelected" | "notSavedToAllSelected"} SavedStatus
 */

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
