import React from "react";
import {
  useRouteError,
  isRouteErrorResponse,
  Outlet,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oidc-context";
import { I18nKey } from "#/i18n/declaration";
import i18n from "#/i18n";
import { useGitHubAuthUrl } from "#/hooks/use-github-auth-url";
import { useIsAuthed } from "#/hooks/query/use-is-authed";
import { useConfig } from "#/hooks/query/use-config";
import { Sidebar } from "#/components/features/sidebar/sidebar";
import { AuthModal } from "#/components/features/waitlist/auth-modal";
import { AnalyticsConsentFormModal } from "#/components/features/analytics/analytics-consent-form-modal";
import { useSettings } from "#/hooks/query/use-settings";
import { useMigrateUserConsent } from "#/hooks/use-migrate-user-consent";
import { useBalance } from "#/hooks/query/use-balance";
import { SetupPaymentModal } from "#/components/features/payment/setup-payment-modal";
import { displaySuccessToast } from "#/utils/custom-toast-handlers";

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <pre>
          {error.data instanceof Object
            ? JSON.stringify(error.data)
            : error.data}
        </pre>
      </div>
    );
  }
  if (error instanceof Error) {
    return (
      <div>
        <h1>{t(I18nKey.ERROR$GENERIC)}</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>{t(I18nKey.ERROR$UNKNOWN)}</h1>
    </div>
  );
}

export default function MainApp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const { error, isFetching } = useBalance();
  const { migrateUserConsent } = useMigrateUserConsent();
  const config = useConfig();
  const auth = useAuth();
  const {
    data: isAuthed,
    isFetching: isFetchingAuth,
    isError: authError,
  } = useIsAuthed();

  const gitHubAuthUrl = useGitHubAuthUrl({
    appMode: config.data?.APP_MODE || null,
    gitHubClientId: config.data?.GITHUB_CLIENT_ID || null,
  });

  const [consentFormIsOpen, setConsentFormIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && pathname !== "/signin") {
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, pathname]);

  React.useEffect(() => {
    if (settings?.LANGUAGE) {
      i18n.changeLanguage(settings.LANGUAGE);
    }
  }, [settings?.LANGUAGE]);

  React.useEffect(() => {
    const consentFormModalIsOpen =
      settings?.USER_CONSENTS_TO_ANALYTICS === null;

    setConsentFormIsOpen(consentFormModalIsOpen);
  }, [settings]);

  React.useEffect(() => {
    // Migrate user consent to the server if it was previously stored in localStorage
    migrateUserConsent({
      handleAnalyticsWasPresentInLocalStorage: () => {
        setConsentFormIsOpen(false);
      },
    });
  }, []);

  React.useEffect(() => {
    // Don't allow users to use the app if it 402s
    if (error?.status === 402 && pathname !== "/") {
      navigate("/");
    } else if (!isFetching && searchParams.get("free_credits") === "success") {
      displaySuccessToast(t(I18nKey.BILLING$YOURE_IN));
      searchParams.delete("free_credits");
      navigate("/");
    }
  }, [error?.status, pathname, isFetching, t]);

  const userIsAuthed = !!isAuthed && !authError;
  const renderAuthModal =
    !isFetchingAuth && !userIsAuthed && config.data?.APP_MODE === "saas";

  if (auth.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="loader text-gray-300" />
      </div>
    );
  }

  if (auth.error) {
    return <div>error</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div
        data-testid="root-layout"
        className="bg-base p-3 h-screen md:min-w-[1024px] overflow-x-hidden flex flex-col md:flex-row gap-3"
      >
        <Sidebar />

        <div
          id="root-outlet"
          className="h-[calc(100%-50px)] md:h-full w-full relative"
        >
          <Outlet />
        </div>

        {renderAuthModal && <AuthModal githubAuthUrl={gitHubAuthUrl} />}
        {config.data?.APP_MODE === "oss" && consentFormIsOpen && (
          <AnalyticsConsentFormModal
            onClose={() => {
              setConsentFormIsOpen(false);
            }}
          />
        )}

        {config.data?.FEATURE_FLAGS.ENABLE_BILLING &&
          config.data?.APP_MODE === "saas" &&
          settings?.IS_NEW_USER && <SetupPaymentModal />}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-[100vh] bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <div className="text-center bg-white/80 backdrop-blur-lg p-12 rounded-2xl shadow-lg transform transition-all hover:scale-105 border border-white/20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to OpenHands
          </h1>
          {/* <p className="mt-4 text-gray-600">Your AI-powered coding companion</p> */}
        </div>
        {/* <div className="mt-10">
          <button
            type="button"
            onClick={() => {
              auth.signinRedirect();
            }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium
            transform transition-all hover:shadow-lg hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Sign in to Get Started
          </button>
        </div> */}
      </div>
    </div>
  );
}
