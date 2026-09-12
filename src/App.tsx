import { createBrowserRouter, RouterProvider } from "react-router-dom";
import EditEventPage from "./pages/EditEventPage";
import ErrorPage from "./pages/ErrorPage";
import EventDetailPage from "./pages/EventDetailPage";
import HomePage from "./pages/HomePage";
import NewEventPage from "./pages/NewEventPage";
import { eventsLoader } from "./utils/eventLoader";
import EventsPageLoader from "./pages/EventsPageLoader";
import RootLayout from "./components/RootLayout";
import { fetchOneEvent } from "./utils/fetchOneEvent";
import { deleteItemAction } from "./utils/deleteItem";

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
                        element: <NewEventPage />,
                    },
                    {
                        path: ":id",
                        element: <EventDetailPage />,
                        loader: fetchOneEvent,
                        action: deleteItemAction,
                    },
                    {
                        path: ":id/edit",
                        element: <EditEventPage />,
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
