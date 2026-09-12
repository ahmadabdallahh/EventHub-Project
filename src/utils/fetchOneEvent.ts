// INFO: This is a simplified version of the fetchOneEvent function

import type { LoaderFunctionArgs } from "react-router-dom";

export type EventType = {
    id: string;
    title: string;
    description: string;
    date: string;
    image: string;
};

const BASE_URL = import.meta.env.API_URL ?? 'http://localhost:8080/events/';

export async function fetchOneEvent({ params }: LoaderFunctionArgs): Promise<EventType> {
    const { id } = params;

    const response = await fetch(`${BASE_URL}${id}`);

    if (!id) {
        throw new Response("Event ID is required", { status: 400 });
    }

    if (!response.ok) {
        throw new Error('Failed to fetch event');
    }

    const data = await response.json();

    return data.event;
}
