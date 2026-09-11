import { useLoaderData } from "react-router-dom";

type EventType = {
    id: string;
    title: string;
    description: string;
    date: string;
    image: string;
}

const EventsPageLoader = () => {
    const events = useLoaderData() as EventType[];

    return (
        <>
            <div className="mx-auto max-w-4xl flex flex-col gap-4 p-4">
                {events.map((event) => (
                    <div key={event.id} className="flex bg-[#31302e] rounded overflow-hidden text-white">
                        {event.image && (
                            <img src={event.image} alt={event.title} className="w-1/3 object-cover" />
                        )}
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                            <p className="text-sm text-[#aeaba7] mb-2">{event.date}</p>
                            <p>{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default EventsPageLoader
