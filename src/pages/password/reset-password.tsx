import { Lock } from 'lucide-react';
import { Form, Link, useActionData, useSearchParams } from 'react-router-dom';
import PasswordInput from '../../components/PasswordInput';
import type { PasswordFlowData } from '../../utils/auth/password-reset';

const inputClass =
    'mt-1 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 pl-10 pr-10 text-gray-100 placeholder:text-gray-500 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

const labelClass = 'mb-1 block text-sm font-medium text-gray-300';

// Step 3 of the reset flow: choose a new password.
// The resetToken arrives via ?token= (set by step 2) and authorizes the change.
const ResetPasswordPage = () => {
    const actionData = useActionData() as PasswordFlowData | undefined;
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get('token') ?? '';

    return (
        <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center py-12">
            <div className="animate-fade-up rounded-xl bg-gray-800 p-6 shadow-xl shadow-black/20 sm:p-8">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-400">
                        Almost done
                    </p>

                    <h1 className="font-display text-3xl font-bold tracking-tight text-gray-100">
                        Set a new password
                    </h1>

                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                        Choose a strong password, at least 6 characters long.
                    </p>
                </div>

                <Form method="post" className="space-y-5">
                    <input type="hidden" name="resetToken" value={resetToken} />
                    {actionData?.error && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                        >
                            {actionData.error}
                            {actionData.retryHref && (
                                <>
                                    {' '}
                                    <Link
                                        to={actionData.retryHref}
                                        className="font-semibold underline underline-offset-2 hover:text-red-200"
                                    >
                                        Request a new code
                                    </Link>
                                    .
                                </>
                            )}
                        </div>
                    )}
                    <p>
                        <label htmlFor="new-password" className={labelClass}>
                            New password
                        </label>
                        <span className="relative block">
                            <Lock
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                            />
                            <PasswordInput
                                id="new-password"
                                name="newPassword"
                                placeholder="At least 6 characters"
                                className={inputClass}
                            />
                        </span>
                    </p>

                    <p>
                        <label htmlFor="confirm-password" className={labelClass}>
                            Confirm new password
                        </label>
                        <span className="relative block">
                            <Lock
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                            />
                            <PasswordInput
                                id="confirm-password"
                                name="confirmPassword"
                                placeholder="Repeat your new password"
                                className={inputClass}
                            />
                        </span>
                    </p>

                    <button
                        type="submit"
                        className="w-full cursor-pointer rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-primary-400 active:scale-[0.98]"
                    >
                        Reset password
                    </button>
                </Form>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500">
                    <span className="h-px flex-1 bg-gray-700" />
                    or
                    <span className="h-px flex-1 bg-gray-700" />
                </div>

                <p className="text-center text-sm text-gray-400">
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

export default ResetPasswordPage;
