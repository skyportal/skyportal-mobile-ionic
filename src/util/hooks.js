import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PREFERENCES, QUERY_KEYS } from "./constants.js";
import { fetchGroups, searchCandidates } from "../scanning/scanning.js";
import { fetchSources } from "../sources/sources.js";
import { getPreference, setPreference } from "./preferences.js";
import config from "../config.js";
import { checkTokenAndFetchUser } from "../onboarding/auth.js";
import { useEffect, useState } from "react";

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
  return useQuery({
    queryKey: [key],
    queryFn: () => getPreference({ key }),
  });
};

/**
 * Custom hook to get the user from the preferences
 * @returns {{user: import("../onboarding/auth.js").User|undefined, status: QueryStatus, error: any|undefined}}
 */
export const useUser = () => {
  const res = usePreference(PREFERENCES.USER);
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
  const res = usePreference(PREFERENCES.USER_INFO);
  return {
    userInfo: res.data,
    status: res.status,
    error: res.error,
  };
};

/**
 * @returns {{candidates: import("../scanning/scanning.js").Candidate[]|undefined, status: QueryStatus, error: any}}
 */
export const useSearchCandidates = () => {
  const { userInfo } = useUserInfo();
  const {
    data: candidates,
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES],
    queryFn: () =>
      searchCandidates({
        instanceUrl: userInfo?.instance.url ?? "",
        token: userInfo?.token ?? "",
      }),
    enabled: !!userInfo,
  });
  return {
    candidates,
    status,
    error,
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
    data: sources,
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
  });
  return {
    sources,
    status,
    error,
  };
};

export const useSkipOnboarding = () => {
  /** @type {[{skipOnboarding: boolean, status: QueryStatus, error: any}, Function]} */
  const [state, setState] = useState({
    skipOnboarding: false,
    status: "pending",
    error: undefined,
  });
  const queryClient = useQueryClient();
  let mutation = useMutation({
    mutationFn: () => {
      if (!config.SKIP_ONBOARDING) {
        throw new Error("Onboarding is not skipped");
      }
      if (
        config.SKIP_ONBOARDING &&
        (!config.INSTANCE_URL || !config.INSTANCE_NAME || !config.TOKEN)
      ) {
        throw new Error("Missing configuration");
      }
      return checkTokenAndFetchUser({
        token: config.TOKEN,
        instanceUrl: config.INSTANCE_URL,
      });
    },
    onSuccess: async (user) => {
      queryClient.setQueryData([QUERY_KEYS.USER], user);
      await setPreference({ key: PREFERENCES.USER, value: user });
      const userInfo = {
        token: config.TOKEN,
        instance: { url: config.INSTANCE_URL, name: config.INSTANCE_NAME },
      };
      queryClient.setQueryData([QUERY_KEYS.USER_INFO], userInfo);
      await setPreference({ key: PREFERENCES.USER_INFO, value: userInfo });
      setState({ skipOnboarding: true, status: "success", error: state.error });
    },
    onError: (error) => {
      setState({ skipOnboarding: false, status: "error", error });
    },
  });
  useEffect(() => {
    mutation.mutate();
  }, []);
  return state;
};

export const useUserAccessibleGroups = () => {
  const { userInfo } = useUserInfo();
  const {
    data: groups,
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
  });
  return {
    userAccessibleGroups: groups?.user_accessible_groups,
    status,
    error,
  };
};
