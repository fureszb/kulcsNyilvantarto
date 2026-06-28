import { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
    src: string;
    width?: number;
    maxHeight?: string;
    loop?: boolean;
    className?: string;
}

export default function VideoPlayer({ src, width = 100, maxHeight = 'max-h-[80vh]', loop = true, className = '' }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef     = useRef<HTMLVideoElement>(null);
    const progressRef  = useRef<HTMLDivElement>(null);
    const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [playing,     setPlaying]     = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration,    setDuration]    = useState(0);
    const [buffered,    setBuffered]    = useState(0);
    const [volume,      setVolume]      = useState(1);
    const [muted,       setMuted]       = useState(false);
    const [showCtrl,    setShowCtrl]    = useState(true);
    const [showVol,     setShowVol]     = useState(false);
    const [fullscreen,  setFullscreen]  = useState(false);
    const [loading,     setLoading]     = useState(true);

    // autoplay when ≥50% visible
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.intersectionRatio >= 0.5) v.play().catch(() => {});
                else v.pause();
            },
            { threshold: 0.5 }
        );
        obs.observe(v);
        return () => obs.disconnect();
    }, [src]);

    // video events
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const on = (ev: string, fn: () => void) => v.addEventListener(ev, fn);
        const off = (ev: string, fn: () => void) => v.removeEventListener(ev, fn);
        const onPlay  = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onTime  = () => {
            setCurrentTime(v.currentTime);
            if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
        };
        const onDur  = () => setDuration(v.duration);
        const onWait = () => setLoading(true);
        const onCan  = () => setLoading(false);
        const onVol  = () => { setVolume(v.volume); setMuted(v.muted); };
        on('play', onPlay); on('pause', onPause); on('timeupdate', onTime);
        on('durationchange', onDur); on('waiting', onWait); on('canplay', onCan);
        on('volumechange', onVol);
        return () => {
            off('play', onPlay); off('pause', onPause); off('timeupdate', onTime);
            off('durationchange', onDur); off('waiting', onWait); off('canplay', onCan);
            off('volumechange', onVol);
        };
    }, []);

    // fullscreen change (standard + webkit prefix for Safari <16.4 + iOS native)
    useEffect(() => {
        const v = videoRef.current;
        const fn = () => {
            const el = document.fullscreenElement || (document as any).webkitFullscreenElement;
            setFullscreen(!!el);
        };
        const onBegin = () => setFullscreen(true);
        const onEnd   = () => setFullscreen(false);
        document.addEventListener('fullscreenchange', fn);
        document.addEventListener('webkitfullscreenchange', fn);
        v?.addEventListener('webkitbeginfullscreen', onBegin);
        v?.addEventListener('webkitendfullscreen', onEnd);
        return () => {
            document.removeEventListener('fullscreenchange', fn);
            document.removeEventListener('webkitfullscreenchange', fn);
            v?.removeEventListener('webkitbeginfullscreen', onBegin);
            v?.removeEventListener('webkitendfullscreen', onEnd);
        };
    }, []);

    // controls auto-hide
    const scheduleHide = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShowCtrl(false), 3000);
    }, []);

    const onActivity = useCallback(() => {
        setShowCtrl(true);
        if (playing) scheduleHide();
    }, [playing, scheduleHide]);

    useEffect(() => {
        if (!playing) { setShowCtrl(true); if (hideTimer.current) clearTimeout(hideTimer.current); }
        else scheduleHide();
    }, [playing, scheduleHide]);

    // seek helpers
    const seekToX = useCallback((clientX: number) => {
        const bar = progressRef.current;
        const v   = videoRef.current;
        if (!bar || !v || !duration) return;
        const r = bar.getBoundingClientRect();
        v.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration;
    }, [duration]);

    const onProgressDown = (e: React.MouseEvent) => {
        e.preventDefault();
        seekToX(e.clientX);
        const onMove = (ev: MouseEvent) => seekToX(ev.clientX);
        const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // actions
    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        playing ? v.pause() : v.play().catch(() => {});
    };
    const toggleMute = () => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; };
    const changeVol  = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = videoRef.current;
        if (!v) return;
        const val = parseFloat(e.target.value);
        v.volume = val; v.muted = val === 0;
    };
    const toggleFs = () => {
        const c = containerRef.current;
        const v = videoRef.current;
        if (!c || !v) return;
        try {
            const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
            if (fsEl) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
            } else if (c.requestFullscreen) {
                c.requestFullscreen().catch(() => {});
            } else if ((c as any).webkitRequestFullscreen) {
                (c as any).webkitRequestFullscreen();
            } else if ((v as any).webkitEnterFullscreen) {
                // iOS Safari: native video fullscreen
                (v as any).webkitEnterFullscreen();
            }
        } catch {
            // fullscreen not supported
        }
    };

    const fmt = (s: number) => {
        if (!isFinite(s) || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    };

    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const buf = duration > 0 ? (buffered  / duration) * 100 : 0;
    const eff = muted ? 0 : volume;

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden bg-[#0d1117] ${fullscreen ? 'flex items-center justify-center' : 'rounded-xl'} ${className}`}
            onMouseMove={onActivity}
            onMouseLeave={() => playing && setShowCtrl(false)}
            onClick={togglePlay}
            onContextMenu={e => e.preventDefault()}
            tabIndex={0}
            onKeyDown={(e) => {
                const v = videoRef.current;
                if (!v) return;
                if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
                if (e.key === 'ArrowLeft')  { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); }
                if (e.key === 'ArrowRight') { e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); }
                if (e.key === 'm') { e.preventDefault(); toggleMute(); }
                if (e.key === 'f') { e.preventDefault(); toggleFs(); }
            }}
        >
            <video
                ref={videoRef}
                src={src}
                loop={loop}
                playsInline
                className={`block object-contain ${fullscreen ? 'w-full h-full' : `mx-auto ${maxHeight}`}`}
                style={fullscreen ? undefined : { width: `${width}%` }}
            />

            {/* Loading spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
                </div>
            )}

            {/* Center play icon when paused */}
            {!playing && !loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Controls overlay */}
            <div
                className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${showCtrl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 65%, transparent 100%)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Progress bar */}
                <div className="px-3 pt-5 pb-1">
                    <div
                        ref={progressRef}
                        className="relative h-[3px] hover:h-[5px] transition-all duration-100 rounded-full bg-white/20 cursor-pointer group/prog"
                        onMouseDown={onProgressDown}
                    >
                        <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${buf}%` }} />
                        <div className="absolute inset-y-0 left-0 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        <div
                            className="absolute top-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover/prog:opacity-100 transition-opacity -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${pct}%` }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-0.5 px-1.5 pb-2 pt-1">
                    {/* Play/Pause */}
                    <button type="button" onClick={togglePlay} className="p-1.5 text-white/90 hover:text-blue-400 transition-colors">
                        {playing
                            ? <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            : <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        }
                    </button>

                    {/* Time */}
                    <span className="text-white/60 text-[11px] font-mono ml-0.5 tabular-nums select-none">
                        {fmt(currentTime)} / {fmt(duration)}
                    </span>

                    <div className="flex-1" />

                    {/* Volume */}
                    <div
                        className="flex items-center"
                        onMouseEnter={() => setShowVol(true)}
                        onMouseLeave={() => setShowVol(false)}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`overflow-hidden transition-all duration-200 flex items-center ${showVol ? 'w-20 mr-1.5 opacity-100' : 'w-0 opacity-0'}`}>
                            <input
                                type="range" min="0" max="1" step="0.02"
                                value={eff}
                                onChange={changeVol}
                                className="w-full cursor-pointer accent-blue-500"
                                style={{ height: '3px' }}
                            />
                        </div>
                        <button type="button" onClick={toggleMute} className="p-1.5 text-white/90 hover:text-blue-400 transition-colors">
                            {eff === 0
                                ? <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" /></svg>
                                : eff < 0.5
                                    ? <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
                                    : <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                            }
                        </button>
                    </div>

                    {/* Fullscreen */}
                    <button type="button" onClick={toggleFs} className="p-1.5 text-white/90 hover:text-blue-400 transition-colors">
                        {fullscreen
                            ? <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                            : <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
