// INFO: Define a function that returns a Promise that resolves to a Response object

export async function eventsLoader() {
    const response = await fetch("http://localhost:8080/events");

    if (!response.ok) {
        // NOTE: Throw an error if the response status is not 200 (OK)
        throw new Response("Failed to fetch events", { status: 500 });
    }

    return response;
}
