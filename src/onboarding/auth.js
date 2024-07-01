import { Capacitor, CapacitorHttp } from "@capacitor/core";
import mockUser from "../../mock/user.json";

/**
 * @template T
 * @typedef {Object} SkyPortalResponse
 * @property {string} status - The status of the response
 * @property {T} data - The data from the response
 */

/**
 * @typedef {Object} User
 * @property {string} username - The username of the user
 * @property {string} first_name - The first name of the user
 * @property {string} last_name - The last name of the user
 * @property {string|null} contact_email - The email of the user
 * @property {string|null} contact_phone - The phone number of the user
 */

/**
 * @typedef {Object} UserInfo
 * @property {string} token - The token of the user
 * @property {import("../common/constants.js").SkyPortalInstance} instance - The instance of the user
 */

/**
 * Check the token and fetch the user from the API
 * @param {Object} params
 * @param {string} params.token - The token to use to fetch the user
 * @param {string} params.instanceUrl - The url of the instance to use to fetch the user
 * @returns {Promise<User>} - The user from the API
 */
export const checkTokenAndFetchUser = async ({ token, instanceUrl }) => {
  if (Capacitor.getPlatform() === "web") {
    return mockUser.data;
  }
  const response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/internal/profile`,
    headers: {
      Authorization: `token ${token}`,
    },
  });
  return response.data.data;
};
