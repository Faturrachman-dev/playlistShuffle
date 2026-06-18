import { describe, it, expect } from 'vitest';
import { parseLrc } from './parseLrc';

describe('parseLrc', () => {
  it('parses a basic synced lyric', () => {
    const result = parseLrc('[00:27.93] Listen to the wind blow');
    expect(result).toEqual([{ time: 27.93, text: 'Listen to the wind blow' }]);
  });

  it('parses milliseconds with 2 digits', () => {
    const result = parseLrc('[01:05.40] Hello');
    expect(result).toEqual([{ time: 65.4, text: 'Hello' }]);
  });

  it('sorts lines by time', () => {
    const lrc = '[00:30.00] Second\n[00:10.00] First';
    const result = parseLrc(lrc);
    expect(result[0]?.text).toBe('First');
    expect(result[1]?.text).toBe('Second');
  });

  it('handles multiple time tags on one line', () => {
    const lrc = '[00:05.00][00:30.00] Chorus line';
    const result = parseLrc(lrc);
    expect(result).toHaveLength(2);
    expect(result[0]?.time).toBe(5);
    expect(result[1]?.time).toBe(30);
  });

  it('skips metadata tags', () => {
    const lrc = '[ar:Artist]\n[ti:Title]\n[00:01.00] Real line';
    const result = parseLrc(lrc);
    expect(result).toHaveLength(1);
    expect(result[0]?.text).toBe('Real line');
  });

  it('returns empty array for empty string', () => {
    expect(parseLrc('')).toEqual([]);
  });
});
