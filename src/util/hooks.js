import { useQuery } from "@tanstack/react-query";
import { PREFERENCES } from "./constants.js";
import { getPreference } from "./preferences.js";

/**
 * @template T
 * Custom hook to get a preference from the preferences
 * @param {string} key
 * @returns {T|undefined}
 */
const usePreference = (key) => {
  const { data: value, status } = useQuery({
    queryKey: [key],
    queryFn: () => getPreference({ key }),
  });
  if (status === "pending" || status === "error") {
    return undefined;
  }
  return value;
};

/**
 * Custom hook to get the user from the preferences
 * @returns {import("../onboarding/auth.js").User|undefined}
 */
export const useUser = () => {
  return usePreference(PREFERENCES.USER);
};

/**
 * Custom hook to get the user info from the preferences
 * @returns {{token: string, instance: import("./constants.js").SkyPortalInstance}|undefined}
 */
export const useUserInfo = () => {
  return usePreference(PREFERENCES.USER_INFO);
};
