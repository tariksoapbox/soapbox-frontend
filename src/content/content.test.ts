import { describe, it, expect } from 'vitest';
import { common, criteria, criteriaShort } from './common';
import { auth } from './auth';
import { board, standings } from './standings';
import { admin } from './admin';
import { CRITERIA } from '@/schemas/contracts';

describe('copy', () => {
  it('names every criterion the API can send, long and short', () => {
    for (const criterion of CRITERIA) {
      expect(criteria[criterion]).toBeTruthy();
      expect(criteriaShort[criterion]).toBeTruthy();
    }
    expect(criteria.time).toBe('Prolazno vrijeme');
  });

  it('has no roles left — everyone who signs in is an administrator', () => {
    expect(common.administrator).toBe('Administrator');
  });

  it('spells out that sessions do not survive the browser', () => {
    expect(auth.sessionNotice).toMatch(/zatvorite/i);
    expect(auth.noSignUp).toMatch(/administrator/i);
  });

  it('says plainly that judges do not sign in', () => {
    expect(admin.judges.subtitle).toMatch(/ne prijavljuju/);
    expect(admin.users.subtitle).toMatch(/sudije nemaju račun/i);
  });

  it('gives the public board its own compact copy', () => {
    // The board is read across a room, so its labels are short where the
    // console's are explanatory.
    expect(board.vehicle).toBe('Vozilo');
    expect(board.judgesOf(3, 5)).toBe('3/5');
    expect(board.noTime).toBe('—');
    expect(board.eventComplete).toBe('Konačni rezultati');
  });

  it('builds the judge-progress strings', () => {
    expect(standings.judgesOf(3, 5)).toBe('3/5 sudija');
    expect(admin.scores.of(3, 5)).toBe('3/5 uneseno');
    expect(admin.scores.gradeIn('Buba', 'Lokumi', 'Vozilo')).toBe(
      'Ocjena — Buba — Lokumi — Vozilo',
    );
    expect(admin.scores.dialogTitle('Kreativnost nastupa', 'Lokumi')).toBe(
      'Kreativnost nastupa — Lokumi',
    );
    expect(standings.updatedAt('10:04:05')).toContain('10:04:05');
  });

  it('explains the 1 + 1 + 1 = 3 rule to a first-time viewer', () => {
    expect(standings.legend.join(' ')).toContain('1 + 1 + 1 = 3');
    expect(standings.legend.length).toBeGreaterThanOrEqual(3);
  });

  it('warns before every destructive admin action', () => {
    expect(admin.teams.confirmDelete('Ekipa')).toMatch(/ocjene/i);
    expect(admin.users.confirmDelete('Admin')).toMatch(/ocjene/i);
    expect(admin.judges.confirmDelete('Sudija')).toMatch(/ocjene/i);
    expect(admin.teams.created('Ekipa')).toContain('Ekipa');
    expect(admin.teams.timeSaved('Ekipa')).toContain('Ekipa');
    expect(admin.teams.timeCleared('Ekipa')).toContain('Ekipa');
    expect(admin.users.created('Sudija')).toContain('Sudija');
  });

  it('has a label for every admin tab', () => {
    for (const key of ['standings', 'teams', 'scores', 'judges', 'users'] as const) {
      expect(admin.tabs[key]).toBeTruthy();
    }
  });

  it('keeps the app name free of any Red Bull mark', () => {
    const all = JSON.stringify([common, auth, standings, admin]).toLowerCase();
    expect(all).not.toContain('red bull');
    expect(all).not.toContain('redbull');
  });
});
