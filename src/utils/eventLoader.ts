export async function eventsLoader() {
    const response = await fetch("http://localhost:8080/events");

    if (!response.ok) {
        throw new Response("Failed to fetch events", { status: 500 });
    }

    const data = await response.json();
    return data.events;
}
