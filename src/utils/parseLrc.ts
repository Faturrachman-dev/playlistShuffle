import type { LrcLine } from '../types/lyrics';

const TIME_TAG_RE = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
const META_TAG_RE = /^\[(ar|al|ti|au|length|by|offset|re|ve):/i;

export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = [];

  for (const raw of lrc.split('\n')) {
    const trimmed = raw.trim();
    if (!trimmed || META_TAG_RE.test(trimmed)) continue;

    const text = trimmed.replace(TIME_TAG_RE, '').trim();
    if (!text) continue;

    let match: RegExpExecArray | null;
    TIME_TAG_RE.lastIndex = 0;
    while ((match = TIME_TAG_RE.exec(trimmed)) !== null) {
      const min = parseInt(match[1] ?? '0', 10);
      const sec = parseInt(match[2] ?? '0', 10);
      const ms = parseInt((match[3] ?? '0').padEnd(3, '0'), 10);
      lines.push({ time: min * 60 + sec + ms / 1000, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}
