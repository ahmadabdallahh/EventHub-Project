import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Form, Link, NavLink, Outlet, useLocation, useRouteLoaderData } from 'react-router-dom';
import type { SessionData } from '../utils/auth/session';

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
        ? 'rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-primary-400'
        : 'rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-primary-300';

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
        ? 'block rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-gray-900'
        : 'block rounded-md px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-primary-300';

function RootLayout() {
    const location = useLocation();
    const [openPath, setOpenPath] = useState<string | null>(null);
    const menuOpen = openPath === location.pathname;
    const closeMenu = () => setOpenPath(null);
    const isLoginPage = location.pathname === '/login';
    const isAuthPage = isLoginPage || location.pathname === '/register';

    const authClass = isAuthPage
        ? 'rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-primary-400'
        : 'rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-primary-300';

    const { isLoggedIn } = useRouteLoaderData('root') as SessionData;

    const links = [
        { to: '/', label: 'Home', end: true },
        { to: '/events', label: 'Events', end: true },
        { to: '/events/new', label: 'Add Event', end: true },
        ...(isLoggedIn ? [{ to: '/dashboard', label: 'Dashboard', end: true }] : []),
        { to: '/qr', label: 'QR Codes', end: true },
        { to: '/attendance', label: 'Attendance', end: true },
    ];

    return (
        <div className="min-h-dvh bg-gray-900 text-gray-100">
            <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
                <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link
                        to="/"
                        className="font-display text-lg font-bold tracking-tight text-gray-100"
                    >
                        Event<span className="text-primary-500">Hub</span>
                    </Link>

                    <ul className="hidden items-center gap-1 md:flex">
                        {links.map((link) => (
                            <li key={link.to}>
                                <NavLink to={link.to} end={link.end} className={desktopLinkClass}>
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                        <li>
                            {isLoggedIn ? (
                                // Must be a POST form: a plain Link issues a GET,
                                // and GET navigations never run the /logout action.
                                <Form method="post" action="/logout">
                                    <button type="submit" className={`${authClass} cursor-pointer`}>
                                        Logout
                                    </button>
                                </Form>
                            ) : (
                                <Link to={isLoginPage ? '/register' : '/login'} className={authClass}>
                                    {isLoginPage ? 'Register' : 'Sign in'}
                                </Link>
                            )}
                        </li>
                    </ul>

                    <button
                        type="button"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav"
                        onClick={() => setOpenPath(menuOpen ? null : location.pathname)}
                        className="rounded-md p-2 text-gray-300 transition hover:bg-gray-800 hover:text-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 md:hidden"
                    >
                        {menuOpen ? (
                            <X aria-hidden="true" className="h-6 w-6" />
                        ) : (
                            <Menu aria-hidden="true" className="h-6 w-6" />
                        )}
                    </button>

                    {menuOpen && (
                        <div
                            id="mobile-nav"
                            className="absolute inset-x-0 top-full border-b border-gray-800 bg-gray-900/95 px-4 py-3 shadow-xl shadow-black/30 sm:px-6 md:hidden"
                        >
                            <ul className="flex flex-col gap-1">
                                {links.map((link) => (
                                    <li key={link.to}>
                                        <NavLink
                                            to={link.to}
                                            end={link.end}
                                            className={mobileLinkClass}
                                            onClick={closeMenu}
                                        >
                                            {link.label}
                                        </NavLink>
                                    </li>
                                ))}
                                <li className="mt-1 border-t border-gray-800 pt-2">
                                    {isLoggedIn ? (
                                        <Form
                                            method="post"
                                            action="/logout"
                                            onSubmit={closeMenu}
                                        >
                                            <button
                                                type="submit"
                                                className={`${mobileLinkClass({ isActive: false })} w-full cursor-pointer text-left`}
                                            >
                                                Logout
                                            </button>
                                        </Form>
                                    ) : (
                                        <NavLink
                                            to={isLoginPage ? '/register' : '/login'}
                                            className={mobileLinkClass({ isActive: isAuthPage })}
                                            onClick={closeMenu}
                                        >
                                            {isLoginPage ? 'Register' : 'Sign in'}
                                        </NavLink>
                                    )}
                                </li>
                            </ul>
                        </div>
                    )}
                </nav>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <Outlet />
            </main>

            <footer className="border-t border-gray-800">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:px-6">
                    <p>EventHub - a React + React Router practice project.</p>
                    <p>Events served from an Express API on Vercel with Upstash Redis.</p>
                </div>
            </footer>
        </div>
    );
}

export default RootLayout;
