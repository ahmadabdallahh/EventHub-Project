// INFO: Add New EventType

import { redirect, type ActionFunctionArgs } from "react-router-dom";

const BASE_URL = 'https://redux-events-backend.fly.dev/events/';

export async function addEvent({ request }: ActionFunctionArgs) {
    const { title, description, date, image } = await request.json();

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, image }),
    });

    if (!response.ok) {
        throw new Error('Failed to add event');
    }

    return redirect("/events");
}
