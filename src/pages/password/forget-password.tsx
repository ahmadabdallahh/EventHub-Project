import { Mail } from 'lucide-react';
import { Form, Link, useActionData } from 'react-router-dom';
import type { PasswordFlowData } from '../../utils/auth/password-reset';

const inputClass =
    'mt-1 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 pl-10 text-gray-100 placeholder:text-gray-500 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

const labelClass = 'mb-1 block text-sm font-medium text-gray-300';

// Design-only: visual step 1 of the reset flow (enter account email).
const ForgetPasswordPage = () => {
    const actionData = useActionData() as PasswordFlowData | undefined;

    return (
        <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center py-12">
            <div className="animate-fade-up rounded-xl bg-gray-800 p-6 shadow-xl shadow-black/20 sm:p-8">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-400">
                        Reset access
                    </p>

                    <h1 className="font-display text-3xl font-bold tracking-tight text-gray-100">
                        Forgot your password?
                    </h1>

                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                        Enter your account email and we&apos;ll send you a 6-digit reset code.
                    </p>
                </div>

                <Form method="post" className="space-y-5">
                    {actionData?.error && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                        >
                            {actionData.error}
                        </div>
                    )}
                    <p>
                        <label htmlFor="email" className={labelClass}>
                            Email
                        </label>
                        <span className="relative block">
                            <Mail
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                className={inputClass}
                            />
                        </span>
                    </p>

                    <button
                        type="submit"
                        className="w-full cursor-pointer rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-primary-400 active:scale-[0.98]"
                    >
                        Send reset code
                    </button>
                </Form>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500">
                    <span className="h-px flex-1 bg-gray-700" />
                    or
                    <span className="h-px flex-1 bg-gray-700" />
                </div>

                <p className="text-center text-sm text-gray-400">
                    Remembered it?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary-400 transition hover:text-primary-300"
                    >
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgetPasswordPage;
