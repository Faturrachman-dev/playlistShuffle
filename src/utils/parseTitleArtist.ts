export function parseTitleArtist(titleStr: string, ownerTitle: string): [string, string] {
  try {
    if (titleStr === 'Private video') return [titleStr, ''];
    if (titleStr.includes(' - ')) {
      const match = titleStr.match(/^(.*?)-(.*)$/);
      if (match) return [(match[2] ?? '').trim(), (match[1] ?? '').trim()];
    }
    if (titleStr.includes('//')) {
      const match = titleStr.match(/^(.*?)\s\/\/\s(.*)$/);
      if (match) return [(match[2] ?? '').trim(), (match[1] ?? '').trim()];
    }
    if (ownerTitle.includes(' - Topic')) {
      const match = ownerTitle.match(/^(.*?)\s-\sTopic$/);
      if (match) return [titleStr, (match[1] ?? '').trim()];
    }
    return [titleStr, ownerTitle];
  } catch {
    return [titleStr, ''];
  }
}
