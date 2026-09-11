import { createBrowserRouter, RouterProvider } from "react-router-dom";
import EditEventPage from "./pages/EditEventPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import NewEventPage from "./pages/NewEventPage";
import MainNavigation from "./components/MainNavigation";

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
                        element: <EventsPage />,
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
