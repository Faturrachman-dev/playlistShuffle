import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../redux/hooks';
import { fetchLyrics } from '../../../utils/fetchLyrics';
import type { LrcLine, LyricsStatus } from '../../../types/lyrics';

function stripIndexPrefix(title: string): string {
  return title.replace(/^\d+\s*-\s*/, '').trim();
}

export default function Lyrics() {
  const player = useAppSelector((state) => state.player);

  const [status, setStatus] = useState<LyricsStatus>('idle');
  const [synced, setSynced] = useState<LrcLine[]>([]);
  const [plain, setPlain] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);

  const activeRef = useRef<HTMLDivElement>(null);
  const fetchedFor = useRef('');

  // Clear display the moment the song changes
  useEffect(() => {
    if (!player.currentSong) return;
    setStatus('loading');
    setSynced([]);
    setPlain(null);
    setActiveIdx(-1);
  }, [player.currentSong]);

  // Fetch after handleReady has written correct title/artist/duration to Redux
  useEffect(() => {
    const videoId = player.currentSong;
    const track = stripIndexPrefix(player.title);
    const fetchKey = `${videoId}::${track}`;

    if (!videoId || !track || fetchKey === fetchedFor.current) return;
    fetchedFor.current = fetchKey;

    fetchLyrics({ videoId, track, artist: player.artist, duration: player.videoDuration })
      .then((result) => {
        if (fetchedFor.current !== fetchKey) return;
        if (!result) { setStatus('not-found'); return; }
        if (result.instrumental) { setStatus('instrumental'); return; }
        if (result.synced.length > 0) {
          setSynced(result.synced);
          setStatus('synced');
        } else if (result.plain) {
          setPlain(result.plain);
          setStatus('plain');
        } else {
          setStatus('not-found');
        }
      })
      .catch(() => setStatus('error'));
  }, [player.title]);

  useEffect(() => {
    if (status !== 'synced' || synced.length === 0) return;
    const progress = player.progress;
    let idx = -1;
    for (let i = 0; i < synced.length; i++) {
      if ((synced[i]?.time ?? Infinity) <= progress) idx = i;
      else break;
    }
    setActiveIdx(idx);
  }, [player.progress, synced, status]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIdx]);

  const containerClass = 'flex-1 min-h-0 overflow-y-auto px-3 py-2 text-sm font-nunito';

  if (status === 'loading') {
    return (
      <div className={`${containerClass} flex items-center justify-center text-textColor opacity-50`}>
        Loading lyrics...
      </div>
    );
  }

  if (status === 'instrumental') {
    return (
      <div className={`${containerClass} flex items-center justify-center text-textColor opacity-50`}>
        ♪ Instrumental
      </div>
    );
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <div className={`${containerClass} flex items-center justify-center text-textColor opacity-40`}>
        No lyrics found
      </div>
    );
  }

  if (status === 'plain' && plain) {
    return (
      <div className={`${containerClass} text-textColor opacity-80 whitespace-pre-wrap`}>
        {plain}
      </div>
    );
  }

  if (status === 'synced') {
    return (
      <div className={containerClass}>
        {synced.map((line, i) => (
          <div
            key={`${line.time}-${i}`}
            ref={i === activeIdx ? activeRef : null}
            className={`py-0.5 transition-all duration-200 ${
              i === activeIdx
                ? 'text-secondary font-semibold opacity-100'
                : 'text-textColor opacity-40'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
