// The problems inside one merged ticket. The page explains them; this file is what runs.
//
// The desk counts a report where it files it: by cause, from the tenant's locale, booking form and
// channel (causes.ts). The reports the desk read as a one-day move (desk-notes.json) stay counted under
// their tenant's cause and are footnoted there. That is the desk's view, as exported, and this file
// keeps it. It adds one thing: the one-day move gets a row of its own, so it can get a ticket of its own.
import { groupByCause, readAs, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  ids: string[];
  tenants: string[];
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // Reports in this group the desk read as a one-day move (counted here, footnoted).
  readAsOneDayMove: number;
  // True for the one-day-move row: its reports are also counted under their cause above.
  alsoCountedAbove: boolean;
};

const count = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

function group(problem: ProblemGroup['problem'], rs: Report[], oneDayMove: readonly string[], alsoCountedAbove: boolean): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    ids: rs.map((r) => r.id).sort(),
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: count(rs.map((r) => r.channel)),
    taggedAs: count(rs.map((r) => r.meta.intakeTag)),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    readAsOneDayMove: alsoCountedAbove ? 0 : rs.filter((r) => oneDayMove.includes(r.id)).length,
    alsoCountedAbove,
  };
}

// Every report merged into `ticket`, once. The cause rows are the desk's (groupByCause); the
// one-day-move row lists the desk's own notes.
export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; causes: ProblemGroup[]; oneDayMove: ProblemGroup; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const causes = groupByCause(merged, tenantOf).map((g: CauseGroup) => group(g.cause, g.reports, oneDayMove, false));
  const moved = group('one-day-move', merged.filter((r) => oneDayMove.includes(r.id)), oneDayMove, true);
  return { merged, causes, oneDayMove: moved, groups: [...causes, moved] };
}

// How often intake's tag named the cause the desk filed the report under.
export function intakeAgreement(causes: ProblemGroup[]): { agree: number; total: number } {
  let agree = 0;
  let total = 0;
  for (const g of causes) {
    for (const r of g.reports) {
      total++;
      if (r.meta.intakeTag === g.problem) agree++;
    }
  }
  return { agree, total };
}

export { readAs };
