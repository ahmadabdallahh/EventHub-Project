export async function eventsLoader() {
    const BASE_URL = import.meta.env.API_URL ?? 'http://localhost:8080/events/';

    const response = await fetch(BASE_URL);

    if (!response.ok) {
        throw new Response("Failed to fetch events", { status: 500 });
    }

    const data = await response.json();
    return data.events;
}
