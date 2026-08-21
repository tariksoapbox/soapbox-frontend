import { describe, it, expect } from 'vitest';
import { common, criteria, criteriaShort, roles } from './common';
import { auth } from './auth';
import { judge } from './judge';
import { standings } from './standings';
import { admin } from './admin';
import { CRITERIA, ROLES } from '@/schemas/contracts';

describe('copy', () => {
  it('names every criterion the API can send, long and short', () => {
    for (const criterion of CRITERIA) {
      expect(criteria[criterion]).toBeTruthy();
      expect(criteriaShort[criterion]).toBeTruthy();
    }
    expect(criteria.time).toBe('Prolazno vrijeme');
  });

  it('names every role', () => {
    for (const role of ROLES) expect(roles[role]).toBeTruthy();
  });

  it('spells out that sessions do not survive the browser', () => {
    expect(auth.sessionNotice).toMatch(/zatvorite/i);
    expect(auth.noSignUp).toMatch(/administrator/i);
  });

  it('agrees with itself on the remaining-count plural', () => {
    expect(judge.remaining(1)).toBe('Preostala 1 ocjena');
    expect(judge.remaining(4)).toBe('Preostalo ocjena: 4');
  });

  it('builds the judge-progress and submission strings', () => {
    expect(standings.judgesOf(3, 5)).toBe('3/5 sudija');
    expect(judge.submit(8)).toBe('Pošalji ocjenu 8');
    expect(judge.submittedAt('10:04:05')).toContain('10:04:05');
    expect(judge.bib(7)).toBe('Startni broj 7');
    expect(standings.updatedAt('10:04:05')).toContain('10:04:05');
  });

  it('explains the 1 + 1 + 1 = 3 rule to a first-time viewer', () => {
    expect(standings.legend.join(' ')).toContain('1 + 1 + 1 = 3');
    expect(standings.legend.length).toBeGreaterThanOrEqual(3);
  });

  it('warns before every destructive admin action', () => {
    expect(admin.teams.confirmDelete('Ekipa')).toMatch(/ocjene/i);
    expect(admin.users.confirmDelete('Sudija')).toMatch(/ocjene/i);
    expect(admin.scores.confirmClear('Sudija 1', 'Ekipa', 9)).toMatch(/ponovo/i);
    expect(admin.teams.created('Ekipa')).toContain('Ekipa');
    expect(admin.teams.timeSaved('Ekipa')).toContain('Ekipa');
    expect(admin.teams.timeCleared('Ekipa')).toContain('Ekipa');
    expect(admin.users.created('Sudija')).toContain('Sudija');
  });

  it('has a label for every admin tab', () => {
    for (const key of ['standings', 'teams', 'scores', 'users'] as const) {
      expect(admin.tabs[key]).toBeTruthy();
    }
  });

  it('keeps the app name free of any Red Bull mark', () => {
    const all = JSON.stringify([common, auth, judge, standings, admin]).toLowerCase();
    expect(all).not.toContain('red bull');
    expect(all).not.toContain('redbull');
  });
});
