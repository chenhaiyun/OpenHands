/* eslint-disable react/react-in-jsx-scope */
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { HydratedRouter } from "react-router/dom";
import React, { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import posthog from "posthog-js";
import "./i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebStorageStateStore } from "oidc-client-ts";
import { AuthProvider } from "react-oidc-context";
import store from "./store";
import { useConfig } from "./hooks/query/use-config";
import { AuthProvider as TokenAuthProvider } from "./context/auth-context";
import { queryClientConfig } from "./query-client-config";

function PosthogInit() {
  const { data: config } = useConfig();

  React.useEffect(() => {
    if (config?.POSTHOG_CLIENT_KEY) {
      posthog.init(config.POSTHOG_CLIENT_KEY, {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only",
      });
    }
  }, [config]);

  return null;
}

async function prepareApp() {
  if (
    process.env.NODE_ENV === "development" &&
    import.meta.env.VITE_MOCK_API === "true"
  ) {
    const { worker } = await import("./mocks/browser");

    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

export const queryClient = new QueryClient(queryClientConfig);

const oidcConfig = {
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  scope: import.meta.env.VITE_OIDC_SCOPE,
  automaticSilentRenew: true,
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
};

prepareApp().then(() =>
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <Provider store={store}>
          <AuthProvider
            userStore={oidcConfig.userStore}
            scope={oidcConfig.scope}
            automaticSilentRenew={oidcConfig.automaticSilentRenew}
            authority={oidcConfig.authority}
            client_id={oidcConfig.client_id}
            redirect_uri={oidcConfig.redirect_uri}
          >
            <TokenAuthProvider>
              <QueryClientProvider client={queryClient}>
                <HydratedRouter />
                <PosthogInit />
              </QueryClientProvider>
            </TokenAuthProvider>
          </AuthProvider>
        </Provider>
      </StrictMode>,
    );
  }),
);
