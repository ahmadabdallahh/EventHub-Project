// INFO: This is a simplified version of the fetchOneEvent function

import { redirect, type LoaderFunctionArgs } from "react-router-dom";

const BASE_URL = import.meta.env.API_URL ?? 'http://localhost:8080/events/';

export async function deleteItemAction({ params }: LoaderFunctionArgs) {
    const { id } = params;

    if (!id) {
        throw new Response("Event ID is required", { status: 400 });
    }

    const response = await fetch(`${BASE_URL}${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });

    if (!response.ok) {
        throw new Error('Failed to delete event');
    }

    return redirect("/events");
}
