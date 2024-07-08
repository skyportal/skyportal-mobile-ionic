import { Preferences } from "@capacitor/preferences";

/**
 * @typedef {Object} SetOptions
 * @property {string} key - The key to associate with the value being set in preferences.
 * @property {any} value - The value to set in preferences with the associated key.
 */

/**
 * @typedef {Object} GetOptions
 * @property {string} key - The key to retrieve the value from preferences.
 */

/**
 * @typedef {Object} GetResult
 * @property {string|null} value - The value from preferences associated with the given key.
 * If a value was not previously set or was removed, value will be `null`
 */

/**
 * Set a preference in the app
 * @param {SetOptions} options - The options to set the preference.
 * @returns {Promise<void>}
 */
export async function setPreference({ key, value }) {
  return await Preferences.set({ key, value: JSON.stringify(value) });
}

/**
 * Get a preference in the app
 * @param {GetOptions} options - The options to get the preference.
 * @returns {Promise<any>}
 */
export async function getPreference({ key }) {
  const pref = await Preferences.get({ key });
  if (pref.value !== null) {
    return JSON.parse(pref.value);
  }
  return null;
}
