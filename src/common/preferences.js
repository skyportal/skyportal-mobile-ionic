import { Preferences } from "@capacitor/preferences";

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
