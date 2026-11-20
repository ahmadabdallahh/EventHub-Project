// INFO: Forgot Password A User

import { apiFetch, AUTH_API_URL } from "../api";

export async function forgetPassword({ request }: { request: Request }) {
    const formData = await request.formData();
    const email = formData.get("email");

    if (!email || typeof email !== "string") {
        return {
            error: "Please provide an email address.",
        };
    }

    // TODO: send email
    const response = await apiFetch(`${AUTH_API_URL}/forgot-password`, {
        method: "POST",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return {
            error: errorData?.message ?? "Failed to send reset code. Please try again.",
        };
    }

    return {
        message: "If an account with that email exists, a reset code has been sent.",
    };
}
