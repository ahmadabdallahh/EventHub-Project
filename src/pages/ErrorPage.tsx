import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
    const error = useRouteError();

    let status = 'Error';
    let message = 'Something went wrong while loading this page.';

    if (isRouteErrorResponse(error)) {
        status = String(error.status);
        if (typeof error.data === 'string' && error.data) {
            message = error.data;
        } else if (error.statusText) {
            message = error.statusText;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return (
        <div className="mx-auto flex min-h-[60dvh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-400 tabular-nums">
                {status}
            </p>

            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
                Could not load this page
            </h1>

            <p className="mx-auto mt-3 max-w-md leading-relaxed text-gray-400">
                {message}
            </p>

            <div className="mt-8 flex items-center gap-3">
                <Link
                    to="/"
                    className="rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-primary-400 active:scale-[0.98]"
                >
                    Back to home
                </Link>

                <Link
                    to="/events"
                    className="rounded-md px-6 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-primary-300"
                >
                    Try events again
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
