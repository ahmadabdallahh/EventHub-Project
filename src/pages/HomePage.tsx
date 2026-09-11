import { Link } from 'react-router-dom';

const features = [
    {
        title: 'Event List',
        description: 'Browse all available events in a neatly organized list with rich details.',
        path: '/events',
        cta: 'View Events',
    },
    {
        title: 'Event Details',
        description: 'Open any event to see its full picture, description, and meta information.',
        path: '/events',
        cta: 'Explore Details',
    },
    {
        title: 'Create Event',
        description: 'Add a brand new event through a simple form powered by Redux state.',
        path: '/events/new',
        cta: 'New Event',
    },
    {
        title: 'Edit Event',
        description: 'Update existing events by submitting the pre-filled editor form.',
        path: '/events',
        cta: 'Edit Event',
    },
];

const HomePage = () => {
    return (
        <div className="mx-auto max-w-4xl py-12">
            <section className="mb-14 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-400">
                    React + Redux Practice
                </p>

                <h2 className="font-display mb-4 text-balance text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl">
                    Manage Your Events with Redux
                </h2>

                <p className="mx-auto max-w-xl leading-relaxed text-gray-400">
                    A hands-on project that explores global state management with Redux.
                    State slices, reducers, actions, and dispatch are used to power an
                    event management flow across multiple routed pages.
                </p>

                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link
                        to="/events"
                        className="rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-primary-400 active:scale-[0.98]"
                    >
                        Browse events
                    </Link>

                    <Link
                        to="/events/new"
                        className="rounded-md px-6 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-primary-300"
                    >
                        Create one
                    </Link>
                </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
                {features.map((feature) => (
                    <article
                        key={feature.title}
                        className="flex flex-col rounded-xl border border-gray-800 bg-gray-800 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-gray-600 hover:bg-gray-700/60"
                    >

                        <h3 className="font-display mb-2 text-xl font-semibold text-gray-100">
                            {feature.title}
                        </h3>

                        <p className="mb-5 flex-1 leading-relaxed text-gray-400">
                            {feature.description}
                        </p>

                        <Link
                            to={feature.path}
                            className="inline-block self-start rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-primary-400 active:scale-[0.98]"
                        >
                            {feature.cta}
                        </Link>
                    </article>
                ))}
            </section>
        </div>
    );
};

export default HomePage;
