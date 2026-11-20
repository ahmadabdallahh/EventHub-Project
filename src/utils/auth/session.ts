// INFO: Cookie session helpers — no token touches JS/localStorage.
// The JWT lives in the httpOnly `token` cookie, managed by the backend.

import { redirect } from "react-router-dom";
import { AUTH_API_URL } from "../api";

export type SessionData = {
    isLoggedIn: boolean;
};

/** Root loader: drives the nav (Sign in vs Logout). Never throws. */
export async function sessionLoader(): Promise<SessionData> {
    try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
            credentials: "include",
        });
        return { isLoggedIn: response.ok };
    } catch {
        return { isLoggedIn: false };
    }
}

/** /logout route action: clears the server cookie, then goes to /login. */
export async function logoutAction() {
    await fetch(`${AUTH_API_URL}/logout`, {
        method: "POST",
        credentials: "include",
    }).catch(() => {
        // Backend down — nothing to clear, still redirect below.
    });
    return redirect("/login");
}

/**
 * Route guard for authenticated-only pages. Redirects to /login and
 * remembers where the user was headed via ?from=, so sign-in can return
 * them there.
 */
export async function requireAuth({ request }: { request: Request }) {
    let isLoggedIn = false;
    try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
            credentials: "include",
        });
        isLoggedIn = response.ok;
    } catch {
        isLoggedIn = false;
    }

    if (!isLoggedIn) {
        const url = new URL(request.url);
        const target = `${url.pathname}${url.search}`;
        throw redirect(`/login?from=${encodeURIComponent(target)}`);
    }

    return { isLoggedIn: true };
}
