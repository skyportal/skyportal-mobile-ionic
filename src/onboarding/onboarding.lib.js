import { CapacitorHttp } from "@capacitor/core";
import { INSTANCES, QUERY_KEYS, setPreference } from "../common/common.lib.js";

/**
 * @template T
 * @typedef {Object} SkyPortalResponse
 * @property {string} status - The status of the response
 * @property {T} data - The data from the response
 */

/**
 * @typedef {Object} UserPreferences
 * @property {import("../scanning/scanning.lib.js").ScanningProfile[]} scanningProfiles - The scanning profiles of the user
 * @property {number} followupDefault - The default allocation ID for follow-up
 * @property {boolean} [invertThumbnails] - Whether to invert grayscale thumbnails
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} username - The username of the user
 * @property {string} first_name - The first name of the user
 * @property {string} last_name - The last name of the user
 * @property {string|null} contact_email - The email of the user
 * @property {string|null} contact_phone - The phone number of the user
 * @property {string} gravatar_url - The url for the gravatar profile of the user
 * @property {UserPreferences} preferences - The preferences of the user
 */

/** * @typedef {import("../common/common.lib.js").SkyPortalInstance} SkyPortalInstance */

/**
 * @typedef {Object} UserInfo
 * @property {string} token - The token of the user
 * @property {SkyPortalInstance} instance - The instance of the user
 */

/**
 * @typedef {"welcome"|"login"|"type_token"} OnboardingPage
 */

/**
 * Try to log in to the SkyPortal instance with the provided token.
 * @param {SkyPortalInstance} instance - The SkyPortal instance to log in to
 * @param {string} token - The token to use for logging in
 * @param {import("history").History} history - The history object to redirect after login
 * @param {(userInfo: UserInfo) => void} updateUserInfo - Function to update the user info in context
 */
export const login = async (instance, token, history, updateUserInfo) => {
  const userInfo = {token, instance};
  await fetchUserProfile(userInfo);
  await setPreference(QUERY_KEYS.USER_INFO, userInfo);
  saveTokenToLocalStorage(instance, token);
  updateUserInfo(userInfo);
  history.replace("/login-ok");
}

/**
 * Fetch the user from the API and throw an error if
 * the token is invalid or the instance URL is not found.
 * @param {UserInfo} userInfo - The user info
 * @returns {Promise<UserProfile>} - The user from the API
 */
export const fetchUserProfile = async (userInfo) => {
  const response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/internal/profile`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });

  let error;
  if (response.status === 401) {
    error = new Error("Invalid token");
    throw error;
  }

  if (response.status === 404) {
    error = new Error("Instance URL not found");
    throw error;
  }

  if (response.status >= 400) {
    error = new Error(`Unexpected API error: ${response.status}`);
    throw error;
  }

  return response.data.data;
};

/** @returns {SkyPortalInstance[]} */
export const getInstancesFromLocalStorage = () =>
  JSON.parse(localStorage.getItem("instances") || "[]");

/**
 * Get all SkyPortal instances sorted, including those stored in localStorage and default ones.
 * @returns {SkyPortalInstance[]}
 */
export const getAllInstances = () => {
  const storedInstances = getInstancesFromLocalStorage()
  return [
    ...storedInstances,
    ...INSTANCES.filter(
      (defaultInstance) =>
        !storedInstances.some((i) => i.name === defaultInstance.name)
    ),
  ].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Save a new instance to the localStorage or update an existing one
 * @param {SkyPortalInstance} instance - The instance to save
 */
export const saveInstanceToLocalStorage = (instance) => {
  const instances = getInstancesFromLocalStorage().filter(i => i.name !== instance.name);
  instances.push(instance);
  localStorage.setItem("instances", JSON.stringify(instances));
};

/**
 * Remove an instance from the localStorage
 * @param {string} name - The name of the instance to remove
 */
export const removeInstanceFromLocalStorage = (name) => {
  const instances = getInstancesFromLocalStorage().filter((i) => i.name !== name);
  localStorage.setItem("instances", JSON.stringify(instances));
};

/**
 * Save instance token to the localStorage
 * @param {SkyPortalInstance} instance - The instance to save the token for
 * @param {string} token - The token to save
 */
export const saveTokenToLocalStorage = (instance, token) =>
  saveInstanceToLocalStorage({ ...instance, token });
