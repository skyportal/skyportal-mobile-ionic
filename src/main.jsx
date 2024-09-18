import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IonSpinner } from "@ionic/react";
import { getPreference } from "./common/preferences.js";
import { QUERY_KEYS } from "./common/constants.js";
import { setDarkModeInDocument } from "./common/util.js";

const container = document.getElementById("root");
// @ts-ignore
const root = createRoot(container);
const queryClient = new QueryClient();
(async () => {
  /** @type {import("./common/hooks").AppPreferences|null} */
  const appPreferences = await getPreference(QUERY_KEYS.APP_PREFERENCES);
  const darkMode = appPreferences?.darkMode ?? "auto";
  setDarkModeInDocument(darkMode);
  return darkMode;
})().then((darkMode) => {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div className="app-loading">
              <IonSpinner />
            </div>
          }
        >
          <App darkMode={darkMode} />
        </Suspense>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
