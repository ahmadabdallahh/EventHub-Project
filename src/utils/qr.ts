import type { EventType } from './fetchOneEvent';

export const QR_EVENT_LIMIT = 10;

export type QrEvent = {
    event: EventType;
    url: string;
};

export function buildEventQrs(events: EventType[]): QrEvent[] {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    return events.slice(0, QR_EVENT_LIMIT).map((event) => ({
        event,
        url: `${origin}/events/${event.id}`,
    }));
}

export const ATTENDANCE_PREFIX = 'EHU-ATTENDANCE-';

export function attendancePayload(userId: string) {
    return `${ATTENDANCE_PREFIX}${userId}`;
}

export function attendanceUserId(value: string) {
    const match = value.trim().match(/^EHU-ATTENDANCE-([a-z0-9-]+)$/i);
    return match ? match[1] : null;
}

export type ScanInfo = {
    kind: 'event' | 'attendance' | 'link' | 'text';
    value: string;
    href: string | null;
};

/** Turns raw QR content into a safe result with an optional link. */
export function parseScan(data: string): ScanInfo {
    const value = data.trim();
    if (attendanceUserId(value)) {
        return { kind: 'attendance', value, href: null };
    }
    try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return { kind: 'text', value, href: null };
        }
        if (
            url.origin === window.location.origin &&
            url.pathname.startsWith('/events/')
        ) {
            return { kind: 'event', value, href: `${url.pathname}${url.search}` };
        }
        return { kind: 'link', value, href: value };
    } catch {
        return { kind: 'text', value, href: null };
    }
}
