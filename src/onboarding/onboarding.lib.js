import { CapacitorHttp } from "@capacitor/core";

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

/**
 * @typedef {Object} UserInfo
 * @property {string} token - The token of the user
 * @property {import("../common/common.lib.js").SkyPortalInstance} instance - The instance of the user
 */

/**
 * @typedef {"welcome"|"login"|"type_token"} OnboardingPage
 */

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
