import React from "react";
import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import AuthMFE from "./mfe/AuthMFE";
import DataMFE from "@/mfe/LegacyMFE";
import NotFound from "./shared/components/NotFound";
import { queryClient } from "./providers/QueryClient";
import AppLayout from "./providers/AppLayout";
import { useAuthStore } from "@visitly/app-store";
import { getUserInfoApi } from "./shared/services/auth.api";
import { PermaVisitsRedirect, SamlRedirect } from "./redirects";
import { resolveLanding, resolveRole } from "./shared/utils/navigation";
import { getProductInfo } from "./shared/services/entitlement.api";
import { getOnboardingStatusApi } from "./shared/services/onboarding.api";
import WallboardRedirect from "./redirects/WallboardRedirect";
import HostMFE from "./mfe/HostMFE";
import SwitchRole from "./shared/components/SwitchRole";

// --- Constants ---

const ADMIN_SPECIAL_ROUTES = [
    '/admin/permaVisits',
    '/admin/dashboard/wallboard',
    '/admin/impersonate/user',
];


const checkOnBoardingStatusAndRedirect  = async ({request} :{request : any})=>{
   // Onboarding Logic
   const authStore = useAuthStore.getState();
    const url = new URL(request.url);
    if (authStore.isAuthenticated && authStore.user) {
        try {
            // Fetch status if not in cache (or trust stale for a bit)
            const onboardingStatus = await queryClient.fetchQuery({
                queryKey: ['auth', 'onboarding'],
                queryFn: getOnboardingStatusApi,
                staleTime: 1000 * 60,
            });

            const isOnboarded = onboardingStatus?.onboarded;
            const isOnboardingRoute = url.pathname.startsWith('/admin/onboarding');

            if (isOnboarded === false && !isOnboardingRoute) {
                console.log('[Router] Not onboarded. Forcing onboarding redirect.');
                return redirect('/admin/onboarding');
            }

            if (isOnboarded === true && isOnboardingRoute) {
                const landing = resolveLanding(authStore.user);
                return redirect(landing);
            }
        } catch (e) {
            console.warn('[Router] Could not verify onboarding status, proceeding...');
        }
    }
    return null;
}



// ----------------------------------------------------
// Loaders
// ----------------------------------------------------

// 1. App Loader (Root)
// Responsible for:
// - Bootstrapping Auth (checking tempToken, hydrating store)
// - Fetching initial User/Entitlements if token exists
// - Syncing sessionStorage for legacy MFE compatibility
const appLoader = async ({request} : {request: any}) => {
    const authStore = useAuthStore.getState();
    let accessToken = authStore.tokens.accessToken;
    // A. Check for tempToken (Impersonation Fix)
    if (!accessToken) {
        const tempToken = localStorage.getItem('tempToken');
        if (tempToken) {
            console.log('[Router] Found tempToken, bootstrapping session...');
            authStore.setTokens({ accessToken: tempToken, refreshToken: null });
            accessToken = tempToken;
        } else {
            // Explicitly fail if no token to move out of 'checking' state
            if (authStore.status === 'checking') {
                authStore.failAuth();
            }
            return null;
        }
    }

    // B. Fetch or Sync Auth Context
    // If we have a token, we must ensure store AND storage are populated
    if (accessToken) {
        try {
            let user = authStore.user;

            // Fetch user if missing or if still in 'checking' status
            if (!user || authStore.status === 'checking') {
                console.log('[Router] Fetching auth context...');
                user = await queryClient.fetchQuery({
                    queryKey: ['auth', 'me'],
                    queryFn: getUserInfoApi,
                    staleTime: 1000 * 60 * 5,
                });

                // Hydrate store
                authStore.setAuthenticated({
                    user: user as any, // Cast to any or the expected User type to satisfy TS
                    tokens: { accessToken, refreshToken: authStore.tokens.refreshToken }
                });
            }

            if (!user) throw new Error("User data not found after fetch");

            // --- Storage Sync (always run to ensure parity with AuthInitializer) ---
            sessionStorage.setItem('userinfo', JSON.stringify(user));
            sessionStorage.setItem('myrole', resolveRole(user));

            // Parallel fetch: Entitlements & Onboarding
            const promises = [];

            // Entitlements
            if (user.orgId) {
                promises.push(queryClient.fetchQuery({
                    queryKey: ['entitlements', user.orgId],
                    queryFn: () => getProductInfo(user.orgId!).then(data => {
                        sessionStorage.setItem('entitlement', JSON.stringify(data));
                        sessionStorage.setItem('flagForMenu', "false");
                        return data;
                    }),
                    staleTime: 1000 * 60 * 5,
                }));
            }

            // // Onboarding Status
            promises.push(queryClient.fetchQuery({
                queryKey: ['auth', 'onboarding'],
                queryFn: getOnboardingStatusApi,
                staleTime: 1000 * 60,
            }));
            await Promise.all(promises);

        } catch (error) {
            console.error('[Router] Auth bootstrap failed', error);
            authStore.failAuth();
        }
    }

    return null;
};

// 2. Protected Route Loader (Includes Onboarding)
const protectedLoader = async ({ request }: any) => {
    const authStore = useAuthStore.getState();
    const url = new URL(request.url);
    // Bypasses for special routes (Wallboard, Impersonation)
    const isSpecialRoute = ADMIN_SPECIAL_ROUTES.some(route => url.pathname.startsWith(route));

    if (!authStore.isAuthenticated && !isSpecialRoute) {
        const redirectPath = url.pathname + url.search;
        sessionStorage.setItem('redirect_after_login', redirectPath);
        return redirect("/visitly/login");
    }

   return await checkOnBoardingStatusAndRedirect({request});
};

// 3. Host Loader (Auth only, NO onboarding)
const hostLoader = async ({ request }: any) => {
    const authStore = useAuthStore.getState();
    const url = new URL(request.url);

    if (!authStore.isAuthenticated) {
        const redirectPath = url.pathname + url.search;
        sessionStorage.setItem('redirect_after_login', redirectPath);
        return redirect("/visitly/login");
    }
   return await checkOnBoardingStatusAndRedirect({request});
};

// 4. Public Auth Loader (Login/Signup)
const publicAuthLoader = async () => {
    debugger
    const authStore = useAuthStore.getState();
    if (authStore.isAuthenticated && authStore.user) {
        const landing = resolveLanding(authStore.user);
        return redirect(landing);
    }
    return null;
};


// ----------------------------------------------------
// Router Configuration
// ----------------------------------------------------

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        loader: appLoader,
        shouldRevalidate: () => true, // Ensure auth checks run on navigation
        children: [
            {
                path: "/",
                element: <Navigate to="/visitly" replace />,
            },
            {
                path: "/visitly/*",
                element: <AuthMFE />,
                loader: publicAuthLoader,
            },
            {
                element: <AppLayout />,
                loader: protectedLoader,
                children: [
                    {
                        path: "/admin/*",
                        element: <DataMFE />,
                    },
                ]
            },
            {
                path: "/host/*",
                element: <HostMFE />,
                loader: hostLoader,
            },
            {
                path: "/switch",
                element: <SwitchRole />,
                loader: hostLoader,
            },
            {
                path: "/saml",
                element: <SamlRedirect />,
            },
            {
                path: '/dashboard/wallboard',
                element: <WallboardRedirect />,

            },

            {
                path: "/permaVisits/*",
                element: <PermaVisitsRedirect />,
            },
            {
                path: "*",
                element: <NotFound />,
            }
        ],
    },
]);
