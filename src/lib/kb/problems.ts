// The problems inside one merged ticket. The page explains them; this file is what runs.
//
// causes.ts tells `parser` from `hint` by tenant and channel. It does not know about the reports the
// desk read as a one-day move (desk-notes.json): those are a third problem, not a flipped month, and
// causes.ts files them under the tenant's cause. Here they get their own row, and the counts add up
// to the ticket.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  if (oneDayMove.includes(r.id)) return 'one-day-move';
  return causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  ids: string[];
  tenants: string[];
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const count = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

// Every report merged into `ticket`, once, split by problem. Largest first.
export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
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
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged, groups };
}

// How often intake's tag named the problem the report belongs to.
export function intakeAgreement(groups: ProblemGroup[]): { agree: number; total: number } {
  let agree = 0;
  let total = 0;
  for (const g of groups) {
    for (const r of g.reports) {
      total++;
      if (r.meta.intakeTag === g.problem) agree++;
    }
  }
  return { agree, total };
}
