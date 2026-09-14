export async function eventsLoader() {
    const BASE_URL = import.meta.env.API_URL ?? 'https://redux-events-backend.fly.dev/events/';

    const response = await fetch(BASE_URL);

    if (!response.ok) {
        throw new Response("Failed to fetch events", { status: 500 });
    }

    const data = await response.json();
    return data.events;
}
