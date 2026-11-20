import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Mail, Search, Users } from 'lucide-react';
import { Link, redirect, useLoaderData } from 'react-router-dom';
import { AUTH_API_URL } from '../utils/api';

export type UserSummary = {
    id: string;
    email: string;
    joinedAt: string | null;
};

export type UsersData = {
    currentEmail: string;
    users: UserSummary[];
};

export async function usersLoader(): Promise<UsersData> {
    const meResponse = await fetch(`${AUTH_API_URL}/me`, { credentials: 'include' });
    if (!meResponse.ok) {
        throw redirect('/login');
    }
    const { email: currentEmail } = (await meResponse.json()) as { email: string };

    const usersResponse = await fetch(`${AUTH_API_URL}/users`, { credentials: 'include' });
    if (!usersResponse.ok) {
        throw new Response('Failed to load registered users.', { status: usersResponse.status });
    }
    const { users } = (await usersResponse.json()) as { users: UserSummary[] };

    return { currentEmail, users };
}

function formatJoined(joinedAt: string | null) {
    if (!joinedAt) {
        return 'Not recorded';
    }
    const date = new Date(joinedAt);
    if (Number.isNaN(date.getTime())) {
        return 'Not recorded';
    }
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

function EmptyState({ title, message }: { title: string; message: string }) {
    return (
        <div role="status" className="flex flex-col items-center gap-2 py-14 text-center">
            <Users aria-hidden="true" className="h-8 w-8 text-gray-500" />
            <p className="font-medium text-gray-200">{title}</p>
            <p className="max-w-sm text-sm text-gray-400">{message}</p>
        </div>
    );
}

const UsersPage = () => {
    const { currentEmail, users } = useLoaderData() as UsersData;
    const [query, setQuery] = useState('');

    const visibleUsers = useMemo(() => {
        const sorted = [...users].sort((a, b) => a.email.localeCompare(b.email));
        const term = query.trim().toLowerCase();
        return term ? sorted.filter((user) => user.email.toLowerCase().includes(term)) : sorted;
    }, [users, query]);

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-12">
            <div>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-gray-400 transition hover:text-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back to dashboard
                </Link>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-gray-100">
                            Registered users
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Every account with access to EventHub.
                        </p>
                    </div>
                    <span className="rounded-full bg-primary-500/10 px-3 py-1 text-sm font-semibold text-primary-300">
                        {users.length} total
                    </span>
                </div>
            </div>

            <section className="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-xl shadow-black/20 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-100">All accounts</h2>
                        <p className="mt-1 text-sm text-gray-400">Search by email address.</p>
                    </div>
                    <div className="w-full sm:w-64">
                        <label htmlFor="user-search" className="mb-2 block text-sm font-medium text-gray-300">
                            Search users
                        </label>
                        <div className="relative">
                            <Search
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                id="user-search"
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-md border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                            />
                        </div>
                    </div>
                </div>

                {users.length === 0 ? (
                    <EmptyState
                        title="No accounts yet"
                        message="Registered users will appear here once they sign up."
                    />
                ) : visibleUsers.length === 0 ? (
                    <EmptyState
                        title="No matches"
                        message={`No account matches "${query.trim()}".`}
                    />
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[36rem] text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-700 text-xs uppercase tracking-wider text-gray-400">
                                    <th scope="col" className="pb-3 font-medium">Account</th>
                                    <th scope="col" className="pb-3 font-medium">Joined</th>
                                    <th scope="col" className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {visibleUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-sm font-semibold text-primary-300"
                                                >
                                                    {user.email.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="flex min-w-0 items-center gap-2 break-all text-gray-100">
                                                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500" />
                                                    {user.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-gray-400">
                                            <span className="flex items-center gap-2 whitespace-nowrap">
                                                <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500" />
                                                {formatJoined(user.joinedAt)}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {user.email === currentEmail ? (
                                                <span className="rounded-md bg-primary-500/15 px-2 py-1 text-xs font-semibold text-primary-300">
                                                    You
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">Registered</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default UsersPage;
