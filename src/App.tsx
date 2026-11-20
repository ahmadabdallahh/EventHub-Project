import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, type LoaderFunction } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import { eventsLoader } from "./utils/eventLoader";
import EventsPageLoader from "./pages/EventsPageLoader";
import RootLayout from "./components/RootLayout";
import { fetchOneEvent } from "./utils/fetchOneEvent";
import { deleteItemAction } from "./utils/deleteItem";
import { addEvent } from "./utils/addEvent";
import Loading from "./components/Loading";
import { editEventDetails } from "./utils/editEventDetails";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import DashboardPage, { dashboardLoader } from "./pages/dashboard";
import { signUp } from "./utils/auth/sign-up";
import { signIn } from "./utils/auth/sign-in";
import { logoutAction, requireAuth, sessionLoader } from "./utils/auth/session";
import ForgetPasswordPage from "./pages/password/forget-password";
import VerifyOtpPage from "./pages/password/verify-otp";
import ResetPasswordPage from "./pages/password/reset-password";
import { forgotPasswordAction, verifyOtpAction, resetPasswordAction } from "./utils/auth/password-reset";

const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const NewEventPage = lazy(() => import("./pages/NewEventPage"));

// A route has a single loader, so guard-then-load is composed explicitly.
// The guard throws a redirect before the real loader ever runs.
function withAuth(loader?: LoaderFunction): LoaderFunction {
    return async (args) => {
        await requireAuth({ request: args.request });
        return loader ? loader(args) : null;
    };
}

function lazyRoute(Component: React.LazyExoticComponent<() => React.JSX.Element>) {
    return (
        <Suspense fallback={<Loading />}>
            <Component />
        </Suspense>
    );
}

const router = createBrowserRouter([
    {
        id: "root",
        path: "",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        loader: sessionLoader,
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
                        action: addEvent,
                        loader: withAuth(),
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
                        loader: withAuth(fetchOneEvent),
                        action: editEventDetails,
                    },
                ],
            },
            {
                path: "/login",
                element: <LoginPage />,
                action: signIn,
            },
            {
                path: "/register",
                element: <RegisterPage />,
                action: signUp,
            },
            {
                path: "/dashboard",
                element: <DashboardPage />,
                loader: dashboardLoader,
            },
            {
                // No element: the action clears the cookie and redirects.
                path: "/logout",
                action: logoutAction,
            },
            {
                path: "/forget-password",
                element: <ForgetPasswordPage />,
                action: forgotPasswordAction,
            },
            {
                path: "/verify-otp",
                element: <VerifyOtpPage />,
                action: verifyOtpAction,
            },
            {
                path: "/reset-password",
                element: <ResetPasswordPage />,
                action: resetPasswordAction,
            },
        ],
    },
]);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
