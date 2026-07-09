import { useEffect, useState } from 'react';

/** Élő óra a fejlécben — korábban minden layout saját másolatban tartotta. */
export default function LiveClock() {
    const [time, setTime] = useState('');
    useEffect(() => {
        function tick() {
            setTime(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
        }
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);
    return <span className="text-xs font-semibold text-white/70 tabular-nums hidden sm:inline">{time}</span>;
}
