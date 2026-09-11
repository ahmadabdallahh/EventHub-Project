import { Link } from 'react-router-dom';

interface EventsListProps {
    events: {
        id: string;
        image: string;
        title: string;
        date: string;
    }[];
}

function EventsList({ events }: EventsListProps) {
    return (
        <div className="mx-auto my-8 w-full max-w-2xl">
            <h1 className="font-display mb-6 text-3xl font-bold tracking-tight text-gray-100">
                All Events
            </h1>
            <ul className="flex flex-col gap-4">
                {events.map((event) => (
                    <li key={event.id}>
                        <Link
                            to={event.id}
                            className="group flex overflow-hidden rounded-lg bg-gray-800 text-inherit transition duration-200 hover:scale-[1.02] hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                        >
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-1/3 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="mb-2 text-xl font-semibold text-gray-100 group-hover:text-primary-300">
                                    {event.title}
                                </h2>
                                <time className="text-sm text-gray-400">{event.date}</time>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventsList;
