import { useRef, useState } from 'react';
import { Form, Link, useActionData, useFetcher, useSearchParams } from 'react-router-dom';
import type { PasswordFlowData } from '../../utils/auth/password-reset';

// Step 2 of the reset flow: enter the 6-digit code.
// Email arrives via ?email= (set by step 1); the six boxes compose a
// single hidden `otp` field the action verifies.
const VerifyOtpPage = () => {
    const actionData = useActionData() as PasswordFlowData | undefined;
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const justSent = searchParams.get('sent') === '1';

    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const resendFetcher = useFetcher<PasswordFlowData>();
    const resent = resendFetcher.data?.resent;
    const resendError = resendFetcher.data?.error;

    const focusBox = (index: number) => {
        inputsRef.current[index]?.focus();
    };

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        setDigits((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        if (digit && index < 5) {
            focusBox(index + 1);
        }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            focusBox(index - 1);
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) {
            return;
        }
        event.preventDefault();
        setDigits(pasted.padEnd(6, '').split(''));
        focusBox(Math.min(pasted.length, 5));
    };

    return (
        <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center py-12">
            <div className="animate-fade-up rounded-xl bg-gray-800 p-6 shadow-xl shadow-black/20 sm:p-8">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-400">
                        Check your inbox
                    </p>

                    <h1 className="font-display text-3xl font-bold tracking-tight text-gray-100">
                        Enter reset code
                    </h1>

                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                        We sent a 6-digit code{email ? ` to ${email}` : ''}. It expires in
                        10 minutes.
                    </p>
                </div>

                {(justSent || resent) && !actionData?.error && (
                    <div
                        role="status"
                        className="mb-5 rounded-md border border-primary-500/30 bg-primary-500/10 p-3 text-sm text-primary-300"
                    >
                        {resent ? 'A new code is on its way.' : 'Reset code sent. Check your inbox.'}
                    </div>
                )}

                <Form method="post" className="space-y-5">
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="otp" value={digits.join('')} />
                    {actionData?.error && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                        >
                            {actionData.error}
                            {actionData.attemptsLeft !== undefined && (
                                <span> {actionData.attemptsLeft} attempts left.</span>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputsRef.current[index] = el;
                                }}
                                type="text"
                                value={digit}
                                onChange={(event) => handleChange(index, event.target.value)}
                                onKeyDown={(event) => handleKeyDown(index, event)}
                                onPaste={handlePaste}
                                maxLength={1}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                aria-label={`Digit ${index + 1}`}
                                className="h-12 w-11 rounded-md border border-gray-700 bg-gray-900 text-center text-xl font-semibold text-gray-100 transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:h-14 sm:w-12"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full cursor-pointer rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-primary-400 active:scale-[0.98]"
                    >
                        Verify code
                    </button>
                </Form>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500">
                    <span className="h-px flex-1 bg-gray-700" />
                    or
                    <span className="h-px flex-1 bg-gray-700" />
                </div>

                <resendFetcher.Form method="post" className="text-center text-sm text-gray-400">
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="intent" value="resend" />
                    {resendError && (
                        <p role="alert" className="mb-2 text-red-400">
                            {resendError}
                        </p>
                    )}
                    Didn&apos;t get it?{' '}
                    <button
                        type="submit"
                        disabled={resendFetcher.state !== 'idle'}
                        className="cursor-pointer font-medium text-primary-400 transition hover:text-primary-300 disabled:opacity-50"
                    >
                        {resendFetcher.state !== 'idle' ? 'Sending…' : 'Resend code'}
                    </button>
                </resendFetcher.Form>

                <p className="mt-3 text-center text-sm text-gray-400">
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

export default VerifyOtpPage;
