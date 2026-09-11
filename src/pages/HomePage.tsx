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
        <main className="mx-auto max-w-4xl px-6 py-12">
            <section className="mb-14 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-500">
                    React + Redux Practice
                </p>
                <h2 className="mb-4 text-4xl font-bold text-gray-100">
                    Manage Your Events with Redux
                </h2>
                <p className="mx-auto max-w-xl leading-relaxed text-gray-400">
                    A hands-on project that explores global state management with Redux.
                    State slices, reducers, actions, and dispatch are used to power an
                    event management flow across multiple routed pages.
                </p>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
                {features.map((feature) => (
                    <article
                        key={feature.title}
                        className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition hover:border-gray-500 hover:bg-gray-700"
                    >
                        <h3 className="mb-2 text-xl font-semibold text-gray-100">
                            {feature.title}
                        </h3>
                        <p className="mb-5 leading-relaxed text-gray-400">
                            {feature.description}
                        </p>
                        <Link
                            to={feature.path}
                            className="inline-block rounded bg-primary-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-primary-400"
                        >
                            {feature.cta}
                        </Link>
                    </article>
                ))}
            </section>
        </main>
    );
};

export default HomePage;