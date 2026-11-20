import { ATTENDANCE_API_URL, apiFetch } from './api';

export type Attendee = {
    id: string;
    name: string;
    email: string;
    present: boolean;
    checkedInAt: string | null;
};

export async function attendanceLoader(): Promise<{ users: Attendee[] }> {
    const response = await apiFetch(`${ATTENDANCE_API_URL}/users`);
    if (!response.ok) {
        throw new Response('Failed to load attendance.', { status: response.status });
    }
    const { users } = (await response.json()) as { users: Attendee[] };
    return { users };
}

export async function checkInUser(userId: string): Promise<Attendee> {
    const response = await apiFetch(`${ATTENDANCE_API_URL}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
        throw new Error('Check-in failed. Try scanning again.');
    }
    const { user } = (await response.json()) as { user: Attendee };
    return user;
}

export async function resetAttendance(): Promise<void> {
    const response = await apiFetch(`${ATTENDANCE_API_URL}/reset`, { method: 'POST' });
    if (!response.ok) {
        throw new Error('Could not reset attendance.');
    }
}
