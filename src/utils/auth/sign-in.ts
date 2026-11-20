// src/actions/sign-in.ts
import { redirect } from "react-router-dom";
import { AUTH_API_URL } from "../api";

export type SignInErrors = Partial<Record<"email" | "password", string>>;

/**
 * Only same-origin paths are honored when bouncing back after login.
 * Rejects absolute URLs and protocol-relative "//evil.com" so the
 * ?from= parameter cannot be turned into an open redirect.
 */
function safeRedirectTarget(from: string | null): string {
    if (!from) return "/dashboard";
    if (!from.startsWith("/") || from.startsWith("//") || from.startsWith("/\\")) {
        return "/dashboard";
    }
    return from;
}

export async function signIn({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const from = formData.get('from');

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return {
            error: "Please provide both email and password.",
        };
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return {
                error: errorData?.message || "Invalid email or password. Please try again.",
            };
        }

        // Return the user to the guarded page they were trying to reach.
        return redirect(safeRedirectTarget(typeof from === 'string' ? from : null));

    } catch (error) {
        return {
            error: "Network error. Please check your connection and try again.",
        };
    }
}
