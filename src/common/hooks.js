import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { QUERY_KEYS } from "./constants.js";
import { fetchSources } from "../sources/sources.js";
import { getPreference, setPreference } from "./preferences.js";
import config from "../config.js";
import { checkTokenAndFetchUser } from "../onboarding/auth.js";
import { useState } from "react";
import { fetchConfig } from "./requests.js";
import { fetchGroups } from "../scanning/scanningRequests.js";

/**
 * @typedef {"success" | "error" | "pending"} QueryStatus
 */

/**
 * @template T
 * Custom hook to get a preference from the preferences
 * @param {string} key
 * @returns {{data:T|undefined, status: QueryStatus, error: any|undefined}}
 */
const usePreference = (key) => {
  return useSuspenseQuery({
    queryKey: [key],
    queryFn: () => getPreference({ key }),
  });
};

/**
 * Custom hook to get the user from the preferences
 * @returns {{user: import("../onboarding/auth.js").User|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUser = () => {
  const res = usePreference(QUERY_KEYS.USER);
  return {
    user: res.data,
    status: res.status,
    error: res.error,
  };
};

/**
 * Custom hook to get the user info from the preferences
 * @returns {{userInfo: import("../onboarding/auth.js").UserInfo|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserInfo = () => {
  const res = usePreference(QUERY_KEYS.USER_INFO);
  return {
    userInfo: res.data,
    status: res.status,
    error: res.error,
  };
};

/**
 * @param {Object} props
 * @param {number} props.page
 * @param {number} props.numPerPage
 * @returns {{sources: import("../sources/sources.js").Source[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useFetchSources = ({ page, numPerPage }) => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../sources/sources.js").Source[]} */ data: sources,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SOURCES, page, numPerPage],
    queryFn: () =>
      fetchSources({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
        page,
        numPerPage,
      }),
    enabled: !!userInfo,
    // @ts-ignore
    suspense: true,
  });
  return {
    sources,
    status,
    error,
  };
};

/** @typedef {{user: null|import("../onboarding/auth.js").User, status: QueryStatus, error: any}} SkipOnboardingState */

export const useAppStart = () => {
  const [state, setState] =
    /** @type {ReturnType<typeof useState<SkipOnboardingState>>} */ useState({
      user: null,
      status: "pending",
      error: undefined,
    });
  const queryClient = useQueryClient();
  const appStarted = async () => {
    if (config.CLEAR_AUTH) {
      await setPreference({ key: QUERY_KEYS.USER_INFO, value: null });
      await setPreference({ key: QUERY_KEYS.USER, value: null });
    }
    let user = await getPreference({ key: QUERY_KEYS.USER });
    if (user) {
      return user;
    }
    if (!config.SKIP_ONBOARDING) {
      return null;
    }
    if (
      config.SKIP_ONBOARDING &&
      (!config.INSTANCE_URL || !config.INSTANCE_NAME || !config.TOKEN)
    ) {
      return null;
    }
    user = await checkTokenAndFetchUser({
      token: config.TOKEN,
      instanceUrl: config.INSTANCE_URL,
    });
    queryClient.setQueryData([QUERY_KEYS.USER], user);
    await setPreference({ key: QUERY_KEYS.USER, value: user });
    const userInfo = {
      token: config.TOKEN,
      instance: { url: config.INSTANCE_URL, name: config.INSTANCE_NAME },
    };
    queryClient.setQueryData([QUERY_KEYS.USER_INFO], userInfo);
    await setPreference({ key: QUERY_KEYS.USER_INFO, value: userInfo });
    setState({ user, status: "success", error: state.error });
  };
  return useQuery({
    // @ts-ignore
    suspense: true,
    queryKey: [QUERY_KEYS.APP_START],
    queryFn: appStarted,
    enabled: true,
  });
};

/**
 * @returns {{userAccessibleGroups: import("../scanning/scanningLib.js").Group[]|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUserAccessibleGroups = () => {
  const { userInfo } = useUserInfo();
  const {
    /** @type {import("../scanning/scanningLib.js").GroupsResponse} */ data: groups,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: () =>
      fetchGroups({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
      }),
    enabled: !!userInfo,
    // @ts-ignore
    suspense: true,
  });
  return {
    userAccessibleGroups: groups?.user_accessible_groups,
    status,
    error,
  };
};

/**
 * @returns {{[key: string]: any}}
 */
export const useQueryParams = () => {
  const params = new URLSearchParams(location.search);
  const paramsObject = {};
  for (const [key, value] of params) {
    // @ts-ignore
    paramsObject[key] = value;
  }
  return paramsObject;
};

export const useBandpassesColors = () => {
  const { userInfo } = useUserInfo();
  const { data, status, error } = useQuery({
    queryKey: [QUERY_KEYS.BANDPASS_COLORS],
    queryFn: () =>
      fetchConfig({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
      }),
    enabled: !!userInfo,
  });
  return {
    bandpassesColors: data?.bandpassesColors,
    status,
    error,
  };
};
