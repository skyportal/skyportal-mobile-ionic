import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IonSpinner } from "@ionic/react";

const container = document.getElementById("root");
// @ts-ignore
const root = createRoot(container);
const queryClient = new QueryClient();

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
        <App />
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>,
);
