import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import { eventsLoader } from "./utils/eventLoader";
import EventsPageLoader from "./pages/EventsPageLoader";
import RootLayout from "./components/RootLayout";
import { fetchOneEvent } from "./utils/fetchOneEvent";
import { deleteItemAction } from "./utils/deleteItem";

const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const NewEventPage = lazy(() => import("./pages/NewEventPage"));

function lazyRoute(Component: React.LazyExoticComponent<() => React.JSX.Element>) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-16 text-gray-400">Loading...</div>}>
            <Component />
        </Suspense>
    );
}

const router = createBrowserRouter([
    {
        path: "",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "events",
                children: [
                    {
                        index: true,
                        element: <EventsPageLoader />,
                        loader: eventsLoader,
                    },
                    {
                        path: "new",
                        element: lazyRoute(NewEventPage),
                    },
                    {
                        path: ":id",
                        element: lazyRoute(EventDetailPage),
                        loader: fetchOneEvent,
                        action: deleteItemAction,
                    },
                    {
                        path: ":id/edit",
                        element: lazyRoute(EditEventPage),
                    }
                ],
            },
        ],
    },
]);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
