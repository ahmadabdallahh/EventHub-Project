// INFO: Add New EventType

import { redirect, type ActionFunctionArgs } from "react-router-dom";

const BASE_URL = import.meta.env.VITE ?? 'https://redux-events-backend.fly.dev/events/';

export async function addEvent({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const image = formData.get("image") as string;

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
