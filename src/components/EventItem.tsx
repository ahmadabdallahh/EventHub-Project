import { Link } from 'react-router-dom';

interface EventItemProps {
    event: {
        image: string;
        title: string;
        date: string;
        description: string;
    };
}

function EventItem({ event }: EventItemProps) {
    function startDeleteHandler() {
        // ...
    }

    return (
        <article className="mx-auto my-8 w-full max-w-3xl text-center">
            <img
                src={event.image}
                alt={event.title}
                className="mx-auto w-full max-w-xl rounded-lg object-cover"
            />
            <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-gray-100">
                {event.title}
            </h1>
            <time className="mt-2 block text-sm text-gray-400">{event.date}</time>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-300">
                {event.description}
            </p>
            <menu className="mt-6 flex items-center justify-center gap-3">
                <Link
                    to="edit"
                    className="rounded-md bg-gray-700 px-4 py-1.5 text-sm font-medium text-gray-100 transition hover:bg-gray-600"
                >
                    Edit
                </Link>
                <button
                    onClick={startDeleteHandler}
                    className="cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium text-primary-500 transition hover:bg-gray-800 hover:text-primary-400"
                >
                    Delete
                </button>
            </menu>
        </article>
    );
}

export default EventItem;
