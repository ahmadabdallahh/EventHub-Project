import { useState } from 'react';
import { ArrowUpRight, Check, Copy, QrCode } from 'lucide-react';
import { Link, useLoaderData } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import QrScannerPanel from '../components/QrScannerPanel';
import { EVENTS_API_URL, apiFetch } from '../utils/api';
import type { EventType } from '../utils/fetchOneEvent';
import { buildEventQrs, parseScan, QR_EVENT_LIMIT, type QrEvent, type ScanInfo } from '../utils/qr';

export type QrPageData = {
    entries: QrEvent[];
};

export async function qrLoader(): Promise<QrPageData> {
    const response = await apiFetch(EVENTS_API_URL);
    if (!response.ok) {
        throw new Response('Failed to load events for QR codes.', { status: response.status });
    }
    const { events } = (await response.json()) as { events: EventType[] };
    return { entries: buildEventQrs(events) };
}

function QrTile({ entry }: { entry: QrEvent }) {
    const [copied, setCopied] = useState(false);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(entry.url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <li className="flex flex-col items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 text-center sm:gap-4 sm:p-5">
            <div className="w-full rounded-md bg-white p-2 sm:p-3">
                <QRCodeCanvas
                    value={entry.url}
                    size={132}
                    level="M"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#1f1d1b"
                    className="mx-auto h-auto w-full max-w-[148px]"
                />
            </div>
            <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-gray-100">{entry.event.title}</p>
                <p className="mt-1 text-xs text-gray-400">{entry.event.date}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                    to={`/events/${entry.event.id}`}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary-300 transition hover:bg-gray-700 hover:text-primary-200"
                >
                    Open event
                    <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                </Link>
                <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition hover:bg-gray-700 hover:text-primary-300"
                >
                    {copied ? (
                        <Check aria-hidden="true" className="h-3 w-3" />
                    ) : (
                        <Copy aria-hidden="true" className="h-3 w-3" />
                    )}
                    {copied ? 'Copied' : 'Copy link'}
                </button>
            </div>
        </li>
    );
}

function ScanResult({ scan }: { scan: ScanInfo }) {
    const label =
        scan.kind === 'event'
            ? 'Event QR scanned'
            : scan.kind === 'attendance'
              ? 'Attendance QR scanned'
              : scan.kind === 'link'
                ? 'Link scanned'
                : 'Text scanned';

    return (
        <div role="status" className="mt-6 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-300">{label}</p>
            <p className="mt-2 break-all text-sm text-gray-100">{scan.value}</p>
            {scan.href && (
                <p className="mt-3 text-sm text-gray-400">
                    Check the link before opening.{' '}
                    {scan.kind === 'event' ? (
                        <Link to={scan.href} className="font-semibold text-primary-300 hover:text-primary-200">
                            Open event
                        </Link>
                    ) : (
                        <a
                            href={scan.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary-300 hover:text-primary-200"
                        >
                            Open link
                        </a>
                    )}
                </p>
            )}
        </div>
    );
}

const QrPage = () => {
    const { entries } = useLoaderData() as QrPageData;
    const [scan, setScan] = useState<ScanInfo | null>(null);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
            <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl">
                    QR codes
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                    Ten event links ready to scan. Each code opens one event page in EventHub.
                </p>
            </div>

            <section aria-labelledby="event-codes-heading">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 id="event-codes-heading" className="text-lg font-semibold text-gray-100">
                        Event codes
                    </h2>
                    <span className="rounded-full bg-primary-500/10 px-3 py-1 text-sm font-semibold text-primary-300">
                        {entries.length} of {QR_EVENT_LIMIT}
                    </span>
                </div>
                {entries.length === 0 ? (
                    <p role="status" className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-sm text-gray-400">
                        No events available yet. Add an event to create QR codes.
                    </p>
                ) : (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                        {entries.map((entry) => (
                            <QrTile key={entry.event.id} entry={entry} />
                        ))}
                    </ul>
                )}
            </section>

            <section aria-labelledby="scanner-heading" className="rounded-xl border border-gray-700 bg-gray-800 p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <QrCode aria-hidden="true" className="h-5 w-5 text-primary-400" />
                    <h2 id="scanner-heading" className="text-lg font-semibold text-gray-100">
                        Scan a QR code
                    </h2>
                </div>
                <QrScannerPanel onResult={(data) => setScan(parseScan(data))} />
                {scan && <ScanResult scan={scan} />}
            </section>
        </div>
    );
};

export default QrPage;
