import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./constants.js";
import { fetchSources } from "../sources/sources.js";
import {
  clearPreference,
  getPreference,
  setPreference,
} from "./preferences.js";
import config from "../config.js";
import { fetchUserProfile } from "../onboarding/auth.js";
import { fetchConfig } from "./requests.js";
import { fetchGroups } from "../scanning/scanningRequests.js";
import { useContext } from "react";
import { UserContext } from "./context.js";

/**
 * @typedef {"success" | "error" | "pending"} QueryStatus
 */

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.numPerPage
 * @returns {{sources: import("../sources/sources.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSources = ({ page, numPerPage }) => {
  const { userInfo } = useContext(UserContext);

  const {
    /** @type {import("../sources/sources.js").Source[]} */ data: sources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCES, page, numPerPage],
    queryFn: () =>
      fetchSources({
        userInfo,
        page,
        numPerPage,
      }),
    // @ts-ignore
    suspense: true,
  });
  return {
    sources,
    status,
    error,
  };
};

/**
 * @typedef {Object} AppPreferences
 * @property {"auto"|"light"|"dark"} darkMode
 */

/**
 * @returns {{data: {userInfo: import("../onboarding/auth.js").UserInfo|null, userProfile: import("../onboarding/auth.js").UserProfile|null}, status: QueryStatus, error: any|undefined}}
 */
export const useAppStart = () => {
  const queryClient = useQueryClient();

  const appStarted = async () => {
    // Clear saved credentials if needed
    if (config.CLEAR_AUTH) {
      await clearPreference(QUERY_KEYS.USER_INFO);
    }

    // Try getting user info from preferences
    let userInfo = await getPreference(QUERY_KEYS.USER_INFO);
    // If user info is found, fetch user profile and login
    if (userInfo) {
      try {
        const userProfile = await fetchUserProfile(userInfo);
        return { userInfo, userProfile };
      } catch (error) {
        // If an error occurs, clear the user info and go to onboarding
        await clearPreference(QUERY_KEYS.USER_INFO);
        return { userInfo: null, userProfile: null };
      }
    }

    // If no user info is found and onboarding is not skipped, go to onboarding
    if (!config.SKIP_ONBOARDING) {
      return { userInfo: null, userProfile: null };
    }
    // If onboarding is skipped, but some credentials are missing, go to onboarding anyway
    if (
      config.SKIP_ONBOARDING &&
      (!config.INSTANCE_URL || !config.INSTANCE_NAME || !config.TOKEN)
    ) {
      return { userInfo: null, userProfile: null };
    }

    // If onboarding is skipped and all credentials are present, fetch user profile and login
    userInfo = {
      token: config.TOKEN,
      instance: { url: config.INSTANCE_URL, name: config.INSTANCE_NAME },
    };
    try {
      let userProfile = await fetchUserProfile(userInfo);
      // Persist user info
      queryClient.setQueryData([QUERY_KEYS.USER_INFO], userInfo);
      await setPreference(QUERY_KEYS.USER_INFO, userInfo);
      return { userInfo, userProfile };
    } catch (error) {
      // If an error occurs, clear the user info and go to onboarding
      await setPreference(QUERY_KEYS.USER_INFO, null);
      return { userInfo: null, userProfile: null };
    }
  };
  return useQuery({
    // @ts-ignore
    suspense: true,
    queryKey: [QUERY_KEYS.APP_START],
    queryFn: appStarted,
  });
};

/**
 * @returns {{userAccessibleGroups: import("../scanning/scanningLib.js").Group[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserAccessibleGroups = () => {
  const { userInfo } = useContext(UserContext);
  const {
    /** @type {import("../scanning/scanningLib.js").GroupsResponse} */ data: groups,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: () => fetchGroups(userInfo),
  });
  return {
    userAccessibleGroups: groups?.user_accessible_groups,
    status,
    error,
  };
};

/**
 *
 * @returns {{bandpassesColors: import("./requests.js").BandpassesColors|undefined,status: QueryStatus, error: any|undefined}}
 */
export const useBandpassesColors = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.BANDPASS_COLORS],
    queryFn: () => fetchConfig(userInfo),
  });
  return {
    bandpassesColors: data?.bandpassesColors,
    status,
    error,
  };
};

/**
 * @returns {{userProfile: import("../onboarding/auth.js").UserProfile|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserProfile = () => {
  const { userInfo } = useContext(UserContext);
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: () => fetchUserProfile(userInfo),
  });
  return {
    userProfile: data,
    status,
    error,
  };
};
