import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Camera, CameraOff, ImageUp, LoaderCircle, ScanLine } from 'lucide-react';
import QrScanner from 'qr-scanner';

type Props = {
    onResult: (data: string) => void;
    onDuplicate?: (data: string) => void;
};

const DUPLICATE_WINDOW_MS = 5000;

const buttonClass =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

function QrScannerPanel({ onResult, onDuplicate }: Props) {
    const inputId = useId();
    const [mode, setMode] = useState<'camera' | 'upload'>('camera');
    const [cameraState, setCameraState] = useState<'idle' | 'active'>('idle');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const startingRef = useRef(false);
    const manuallyStoppedRef = useRef(false);
    const lastScanRef = useRef<{ data: string; at: number } | null>(null);
    const onResultRef = useRef(onResult);
    const onDuplicateRef = useRef(onDuplicate);

    useEffect(() => {
        onResultRef.current = onResult;
        onDuplicateRef.current = onDuplicate;
    }, [onResult, onDuplicate]);

    const teardownScanner = useCallback(() => {
        scannerRef.current?.destroy();
        scannerRef.current = null;
    }, []);

    const handleDecoded = useCallback((data: string) => {
        const now = Date.now();
        const last = lastScanRef.current;
        if (last && last.data === data && now - last.at < DUPLICATE_WINDOW_MS) {
            onDuplicateRef.current?.(data);
            return;
        }
        lastScanRef.current = { data, at: now };
        onResultRef.current(data);
    }, []);

    const startCamera = useCallback(
        async (isCancelled: () => boolean = () => false) => {
            setError('');
            if (!videoRef.current) {
                return;
            }
            if (!navigator.mediaDevices?.getUserMedia) {
                setError('Camera access is not available in this browser. Use image upload instead.');
                return;
            }
            if (scannerRef.current || startingRef.current) {
                return;
            }

            startingRef.current = true;
            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    handleDecoded(result.data);
                },
                {
                    preferredCamera: 'environment',
                    returnDetailedScanResult: true,
                    maxScansPerSecond: 5,
                }
            );

            try {
                await scanner.start();
                if (isCancelled()) {
                    scanner.destroy();
                    return;
                }
                scannerRef.current = scanner;
                manuallyStoppedRef.current = false;
                setCameraState('active');
            } catch {
                scanner.destroy();
                if (!isCancelled()) {
                    setCameraState('idle');
                    setError('Camera permission was denied or no camera was found. Use image upload instead.');
                }
            } finally {
                startingRef.current = false;
            }
        },
        [handleDecoded]
    );

    const stopCamera = useCallback(() => {
        manuallyStoppedRef.current = true;
        teardownScanner();
        setCameraState('idle');
    }, [teardownScanner]);

    useEffect(() => {
        if (mode !== 'camera') {
            return;
        }
        let cancelled = false;
        const frame = window.requestAnimationFrame(() => {
            void startCamera(() => cancelled);
        });
        return () => {
            cancelled = true;
            window.cancelAnimationFrame(frame);
            teardownScanner();
            startingRef.current = false;
        };
    }, [mode, startCamera, teardownScanner]);

    useEffect(() => {
        function handleVisibility() {
            if (
                document.visibilityState === 'visible' &&
                !manuallyStoppedRef.current &&
                !scannerRef.current &&
                mode === 'camera'
            ) {
                void startCamera();
            }
        }
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [mode, startCamera]);

    function switchMode(next: 'camera' | 'upload') {
        if (next === mode) {
            return;
        }
        if (next === 'upload') {
            stopCamera();
        } else {
            manuallyStoppedRef.current = false;
        }
        setError('');
        setMode(next);
    }

    async function handleFile(file: File | undefined) {
        if (!file) {
            return;
        }
        setError('');
        setBusy(true);
        try {
            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: true,
                alsoTryWithoutScanRegion: true,
            });
            handleDecoded(result.data);
        } catch {
            setError('No QR code found in that image. Try a larger, sharper photo.');
        } finally {
            setBusy(false);
            if (fileRef.current) {
                fileRef.current.value = '';
            }
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Scanner input method">
                <button
                    type="button"
                    aria-pressed={mode === 'camera'}
                    onClick={() => switchMode('camera')}
                    className={`${buttonClass} ${
                        mode === 'camera'
                            ? 'bg-primary-500 text-gray-900 hover:bg-primary-400'
                            : 'border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-primary-300'
                    }`}
                >
                    <Camera aria-hidden="true" className="h-4 w-4" />
                    Camera
                </button>
                <button
                    type="button"
                    aria-pressed={mode === 'upload'}
                    onClick={() => switchMode('upload')}
                    className={`${buttonClass} ${
                        mode === 'upload'
                            ? 'bg-primary-500 text-gray-900 hover:bg-primary-400'
                            : 'border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-primary-300'
                    }`}
                >
                    <ImageUp aria-hidden="true" className="h-4 w-4" />
                    Upload image
                </button>
            </div>

            {mode === 'camera' ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="relative w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-900 sm:max-w-sm">
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            autoPlay
                            aria-label="Live camera preview for QR scanning"
                            className={`aspect-square w-full object-cover ${cameraState === 'active' ? 'block' : 'hidden'}`}
                        />
                        {cameraState === 'idle' && (
                            <div className="flex aspect-square flex-col items-center justify-center gap-2 text-gray-500">
                                <ScanLine aria-hidden="true" className="h-8 w-8" />
                                <p className="text-sm">Camera is off</p>
                            </div>
                        )}
                        {cameraState === 'active' && (
                            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-semibold text-primary-300 backdrop-blur">
                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                                Scanning
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <p className="max-w-xs text-sm leading-relaxed text-gray-400">
                            Point the camera at a QR code. It stays on so you can scan the next person.
                        </p>
                        {cameraState === 'active' ? (
                            <button
                                type="button"
                                onClick={stopCamera}
                                className={`${buttonClass} border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-primary-300`}
                            >
                                <CameraOff aria-hidden="true" className="h-4 w-4" />
                                Stop camera
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    manuallyStoppedRef.current = false;
                                    void startCamera();
                                }}
                                className={`${buttonClass} bg-primary-500 text-gray-900 hover:bg-primary-400`}
                            >
                                <Camera aria-hidden="true" className="h-4 w-4" />
                                Start camera
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        ref={fileRef}
                        id={inputId}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={busy}
                        className={`${buttonClass} bg-primary-500 text-gray-900 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        {busy ? (
                            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                        ) : (
                            <ImageUp aria-hidden="true" className="h-4 w-4" />
                        )}
                        {busy ? 'Reading image' : 'Choose image'}
                    </button>
                    <label htmlFor={inputId} className="text-sm text-gray-400">
                        PNG or JPG containing a QR code.
                    </label>
                </div>
            )}

            {error && (
                <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            )}
        </div>
    );
}

export default QrScannerPanel;
