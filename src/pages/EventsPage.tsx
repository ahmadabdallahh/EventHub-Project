import { useEffect, useState } from "react";

type EventType = {
    id: string;
    title: string;
    description: string;
}

const EventsPage = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const BASE_URL = import.meta.env.BASE_URL || 'http://localhost:8080/events/';

    useEffect(() => {
        setIsLoading(true);
        fetch(BASE_URL)
            .then((response) => response.json())
            .then((data) => {
                setEvents(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#1c1917] border border-stone-800/60 rounded-2xl shadow-2xl backdrop-blur-xl text-stone-100 max-w-sm mx-auto my-6">
                {/* Animated Spinner */}
                <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />

                <p className="text-sm font-semibold text-stone-300 tracking-wide animate-pulse">
                    Loading, please wait...
                </p>
            </div>
        );
    }

    return (
        <>
            <h2 className='text-white'>Events Page</h2>

            {events.map((event) => (
                <div key={event.id}>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                </div>
            ))}
        </>
    )
}

export default EventsPage
