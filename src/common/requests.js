import { CapacitorHttp } from "@capacitor/core";

/**
 * @typedef {[r:number, g:number, b:number]} BandpassColors
 */

/**
 * @typedef {{[bandpass: string]: BandpassColors}} BandpassesColors
 */

/**
 * @typedef {Object} SkyPortalConfig
 * @property {BandpassesColors} bandpassesColors
 */

/**
 * Fetch the configuration from the server
 * @param {Object} options
 * @param {string} options.instanceUrl
 * @param {string} options.token
 * @returns {Promise<SkyPortalConfig>}
 */
export const fetchConfig = async ({ instanceUrl, token }) => {
  const response = await CapacitorHttp.get({
    url: `${instanceUrl}/api/config`,
    headers: {
      Authorization: `token ${token}`,
    },
  });
  return response.data.data;
};
