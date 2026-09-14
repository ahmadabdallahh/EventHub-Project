// INFO: This is a simplified version of the editEventDetails function

import { redirect, type ActionFunctionArgs } from "react-router-dom";

const BASE_URL = import.meta.env.API_URL ?? 'https://redux-events-backend.fly.dev/events/';

export async function editEventDetails({ request, params }: ActionFunctionArgs) {
    const { id } = params;

    if (!id) {
        throw new Response("Event ID is required", { status: 400 });
    }

    const formData = await request.formData();
    const updatedData = Object.fromEntries(formData);

    const response = await fetch(`${BASE_URL}${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });

    if (!response.ok) {
        throw new Error('Failed to fetch event');
    }

    return redirect(`/events/${id}`);
}
