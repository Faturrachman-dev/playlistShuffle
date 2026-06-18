import type { ValidateIdResult, PlaylistMixData } from '../types/playlist';

export default function validateId(str: unknown): ValidateIdResult {
  if (typeof str !== 'string') return null;
  const arrayOfIds = str.split(',');
  const PLMixData: PlaylistMixData = { name: '', playlists: [] };
  const basicRegex = /^(?=.*.{13,})(?=.*(?:PL|OLAK|RD|UU|LR)).*/;
  const PLRegex = /(PL|OLAK|RD|UU|LR)[\w-]+(?=&|$)/;
  const minLength = 13;

  if (arrayOfIds[0]?.toLowerCase() === 'play my pl') {
    return 'PLi06ybkpczJDt0Ydo3Umjtv97bDOcCtAZ';
  }
  if (arrayOfIds.length === 1) {
    try {
      const input = arrayOfIds[0] ?? '';
      const [id] = input.trim().match(basicRegex) ?? [];
      if (!id) return null;
      const match = id.match(PLRegex);
      if (match) {
        const [PLId] = match;
        return PLId && PLId.length >= minLength ? PLId : null;
      }
      return null;
    } catch {
      return null;
    }
  }
  if (!arrayOfIds[arrayOfIds.length - 1]?.includes('name:')) {
    return null;
  }
  if (arrayOfIds.length > 21) {
    console.log('20 is the max playlist allowed'); // eslint-disable-line no-console
    return null;
  }
  const last = arrayOfIds.pop();
  const [, plName] = last?.split('name:') ?? [];
  PLMixData.name = plName ?? '';
  for (let i = 0; i < arrayOfIds.length; i += 1) {
    const entry = arrayOfIds[i] ?? '';
    if (
      (!entry.match(basicRegex) || entry.length < minLength) &&
      !entry.includes('name:')
    ) {
      return null;
    }
    for (let j = i + 1; j < arrayOfIds.length; j += 1) {
      if (arrayOfIds[i] === arrayOfIds[j]) return null;
    }
    const match = entry.trim().match(PLRegex);
    if (!match) return null;
    const [id] = match;
    if (!id || id.length < minLength) return null;
    PLMixData.playlists.push(id);
  }
  if (PLMixData.playlists.length === 1) {
    return PLMixData.playlists[0] ?? null;
  }
  return PLMixData;
}
