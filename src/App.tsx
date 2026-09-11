import { createBrowserRouter, RouterProvider } from "react-router-dom";
import EditEventPage from "./pages/EditEventPage";
import EventDetailPage from "./pages/EventDetailPage";
import HomePage from "./pages/HomePage";
import NewEventPage from "./pages/NewEventPage";
import MainNavigation from "./components/MainNavigation";
import { eventsLoader } from "./utils/eventLoader";
import EventsPageLoader from "./pages/EventsPageLoader";

const router = createBrowserRouter([
    {
        path: "",
        element: <MainNavigation />,
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
                    },
                    {
                        path: ":id/edit",
                        element: <EditEventPage />,
                    },
                ],
            },
        ],
    },
]);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
