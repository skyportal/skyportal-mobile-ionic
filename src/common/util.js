/**
 * Navigate to a new path with params
 * @param {import("history").History} history
 * @param {string} path
 * @param {Object} options
 * @param {Record<string, string>} [options.params]
 * @param {any} [options.state]
 * @param {boolean} [options.replace]
 */
export const navigateWithParams = (
  history,
  path,
  { params, state, replace = false },
) => {
  history[replace ? "replace" : "push"](
    `${path}?${new URLSearchParams(params).toString()}`,
    state,
  );
};
