import { CapacitorHttp } from "@capacitor/core";

/**
 * @template T
 * @typedef {Object} SkyPortalResponse
 * @property {string} status - The status of the response
 * @property {T} data - The data from the response
 */

/**
 * @typedef {Object} ScanningProfile
 * @property {string} name - The name of the scanning profile
 * @property {boolean} default - Whether the profile is the default one
 * @property {number[]} groupIDs - The IDs of the groups that the profile is associated with
 * @property {string} timeRange - The time range of the profile
 * @property {string} [sortingKey] - The key to use to sort the profile
 * @property {import("../common/common.lib.js").SavedStatus} savedStatus - The status of the profile
 * @property {string} [sortingOrder] - The order to use to sort the profile
 * @property {string} [sortingOrigin] - The origin of the sorting
 * @property {string} rejectedStatus - The status of the rejected
 * @property {string} [redshiftMaximum] - The maximum redshift
 * @property {string} [redshiftMinimum] - The minimum redshift
 */

/**
 * @typedef {Object} UserPreferences
 * @property {ScanningProfile[]} scanningProfiles - The scanning profiles of the user
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
 * Check the token and fetch the user from the API
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
  return response.data.data;
};
