import { useState } from 'react';
import { Check, RotateCcw, ScanLine, UserCheck, UserRound, UsersRound } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import QrScannerPanel from '../components/QrScannerPanel';
import { checkInUser, resetAttendance, type Attendee } from '../utils/attendance';
import { attendancePayload, attendanceUserId, parseScan } from '../utils/qr';

function formatTime(iso: string | null) {
    if (!iso) {
        return null;
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(date);
}

const statCardClass =
    'rounded-xl border border-gray-700 bg-gray-800 p-4 sm:p-5';

function AttendancePage() {
    const initial = useLoaderData() as { users: Attendee[] };
    const [users, setUsers] = useState<Attendee[]>(initial.users);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [resetting, setResetting] = useState(false);

    const present = users.filter((user) => user.present).length;

    async function handleScan(data: string) {
        const scan = parseScan(data);
        const userId = attendanceUserId(scan.value);
        if (!userId) {
            setError('That code is not an attendance code.');
            setFeedback('');
            return;
        }
        setError('');
        try {
            const checkedIn = await checkInUser(userId);
            setUsers((current) =>
                current.map((user) => (user.id === checkedIn.id ? checkedIn : user))
            );
            setFeedback(`${checkedIn.name} is present.`);
        } catch (checkInError) {
            setError(checkInError instanceof Error ? checkInError.message : 'Check-in failed.');
            setFeedback('');
        }
    }

    function handleDuplicate(data: string) {
        const userId = attendanceUserId(parseScan(data).value);
        if (!userId) {
            return;
        }
        const user = users.find((member) => member.id === userId);
        setError('');
        setFeedback(user ? `${user.name} already checked in.` : 'Already checked in.');
    }

    async function handleReset() {
        setResetting(true);
        setError('');
        try {
            await resetAttendance();
            setUsers((current) => current.map((user) => ({ ...user, present: false, checkedInAt: null })));
            setFeedback('Attendance board cleared.');
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : 'Could not reset attendance.');
        } finally {
            setResetting(false);
        }
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl">
                        Attendance
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                        Ten demo members, one unique code each. Scan a code to mark that member present.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetting}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-primary-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                    {resetting ? 'Resetting' : 'Reset board'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={statCardClass}>
                    <UsersRound aria-hidden="true" className="mb-3 h-5 w-5 text-primary-400" />
                    <p className="font-display text-3xl font-bold text-gray-100">{users.length}</p>
                    <p className="mt-1 text-sm text-gray-400">Members</p>
                </div>
                <div className={statCardClass}>
                    <UserCheck aria-hidden="true" className="mb-3 h-5 w-5 text-primary-400" />
                    <p className="font-display text-3xl font-bold text-gray-100">{present}</p>
                    <p className="mt-1 text-sm text-gray-400">Present</p>
                </div>
                <div className={statCardClass}>
                    <UserRound aria-hidden="true" className="mb-3 h-5 w-5 text-primary-400" />
                    <p className="font-display text-3xl font-bold text-gray-100">{users.length - present}</p>
                    <p className="mt-1 text-sm text-gray-400">Absent</p>
                </div>
            </div>

            <section aria-labelledby="roster-heading">
                <h2 id="roster-heading" className="mb-4 text-lg font-semibold text-gray-100">
                    Member codes
                </h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="flex flex-col items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 text-center sm:p-4"
                        >
                            <div className="w-full rounded-md bg-white p-2">
                                <QRCodeCanvas
                                    value={attendancePayload(user.id)}
                                    size={116}
                                    level="M"
                                    includeMargin
                                    bgColor="#ffffff"
                                    fgColor="#1f1d1b"
                                    className="mx-auto h-auto w-full max-w-[132px]"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-100">{user.name}</p>
                                <p className="mt-1 truncate text-xs text-gray-400">{user.email}</p>
                            </div>
                            <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                                    user.present
                                        ? 'bg-primary-500/15 text-primary-300'
                                        : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                {user.present && <Check aria-hidden="true" className="h-3 w-3" />}
                                {user.present ? `Present ${formatTime(user.checkedInAt) ?? ''}`.trim() : 'Absent'}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="attendance-scanner-heading" className="rounded-xl border border-gray-700 bg-gray-800 p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <ScanLine aria-hidden="true" className="h-5 w-5 text-primary-400" />
                    <h2 id="attendance-scanner-heading" className="text-lg font-semibold text-gray-100">
                        Scan attendance
                    </h2>
                </div>
                <QrScannerPanel onResult={handleScan} onDuplicate={handleDuplicate} />
                {feedback && (
                    <p role="status" className="mt-6 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4 text-sm font-medium text-primary-200">
                        {feedback}
                    </p>
                )}
                {error && (
                    <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                        {error}
                    </p>
                )}
            </section>
        </div>
    );
}

export default AttendancePage;
