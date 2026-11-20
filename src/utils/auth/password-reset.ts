// Actions for the 3-step password reset flow:
// /forget-password -> /verify-otp -> /reset-password -> /login
import { redirect } from "react-router-dom";
import { AUTH_API_URL } from "../api";

export type PasswordFlowData = {
    error?: string;
    attemptsLeft?: number;
    resent?: boolean;
    retryHref?: string;
};

async function postJson(path: string, body: unknown) {
    const response = await fetch(`${AUTH_API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    return { response, data };
}

// Step 1: request the OTP, then carry the email forward in the URL.
export async function forgotPasswordAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get("email");

    if (!email || typeof email !== "string" || !email.includes("@")) {
        return { error: "Please enter a valid email address." };
    }

    try {
        const { response, data } = await postJson("/forgot-password", { email });
        if (!response.ok) {
            return { error: data?.message || "Could not send the reset code. Try again." };
        }
        return redirect(`/verify-otp?email=${encodeURIComponent(email)}&sent=1`);
    } catch {
        return { error: "Network error. Please check your connection and try again." };
    }
}

// Step 2: verify the OTP (or resend it). A verified code yields a
// short-lived resetToken carried forward in the URL.
export async function verifyOtpAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get("email");

    if (!email || typeof email !== "string") {
        return { error: "Missing email. Restart the reset flow." };
    }

    // Resend path (used by the fetcher on the verify page — no navigation).
    if (formData.get("intent") === "resend") {
        try {
            const { response } = await postJson("/forgot-password", { email });
            if (!response.ok) {
                return { error: "Could not resend the code. Try again." };
            }
            return { resent: true };
        } catch {
            return { error: "Network error. Please check your connection and try again." };
        }
    }

    const otp = formData.get("otp");
    if (!otp || typeof otp !== "string" || otp.length !== 6) {
        return { error: "Enter the 6-digit code from your email." };
    }

    try {
        const { response, data } = await postJson("/verify-otp", { email, otp });
        if (!response.ok) {
            return {
                error: data?.message || "Invalid code. Try again.",
                attemptsLeft: data?.attemptsLeft,
            };
        }
        return redirect(`/reset-password?token=${encodeURIComponent(data.resetToken)}`);
    } catch {
        return { error: "Network error. Please check your connection and try again." };
    }
}

// Step 3: set the new password with the resetToken, then go sign in.
export async function resetPasswordAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const resetToken = formData.get("resetToken");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (!resetToken || typeof resetToken !== "string") {
        return { error: "Missing reset token. Restart the reset flow." };
    }
    if (
        !newPassword ||
        typeof newPassword !== "string" ||
        newPassword.length < 6
    ) {
        return { error: "Password must be at least 6 characters long." };
    }
    if (newPassword !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    try {
        const { response, data } = await postJson("/reset-password", {
            resetToken,
            newPassword,
        });
        if (!response.ok) {
            if (response.status === 401) {
                // Covers both an expired link and one already spent — a reset
                // token is single-use, so either way a fresh code is needed.
                return {
                    error: "This reset link has expired or has already been used. Request a new code.",
                    retryHref: "/forget-password",
                };
            }
            return { error: data?.message || "Could not reset the password. Try again." };
        }
        return redirect("/login?reset=1");
    } catch {
        return { error: "Network error. Please check your connection and try again." };
    }
}
