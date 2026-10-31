<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { intakeAgreement, splitTicket, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // `issues`: the GitHub issue filed for each problem, by problem key.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const groups = $derived(split.groups);
  const agreement = $derived(intakeAgreement(groups));
  const rawRows = (reports as Report[]).length;

  const WHAT: Record<string, string> = {
    parser: 'month and day flipped: the shared parser reads month first',
    hint: 'month and day flipped: booking-v3 form hint says MM/DD/YYYY',
    'one-day-move': 'the date moves by one day, no flip',
    unplaced: 'no tenant on file',
  };
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const issueName = (url: string) => url.replace(/^https?:\/\/github\.com\//, '').replace('/issues/', '#');
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket}
  ({rawRows} rows in the export, {rawRows - split.merged.length} of them repeats) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>what the reports say</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{WHAT[g.problem]}</td>
        <td>{g.tenants.length}</td>
        <td class="dim">{list(g.channels)}</td>
        <td class="dim">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issues[g.problem as Problem]}
            <a href={issues[g.problem as Problem]}>{issueName(issues[g.problem as Problem] ?? '')}</a>
          {:else}
            none yet
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="dim">
  Intake's tag named the right problem for {agreement.agree} of {agreement.total} reports. The tag comes from the
  reporter's browser language; the problem comes from the tenant's locale, booking form and channel.
</p>

<details>
  <summary>report ids per problem</summary>
  {#each groups as g (g.problem)}
    <p><code>{g.problem}</code> ({g.ids.length}): <span class="ids">{g.ids.join(', ')}</span></p>
  {/each}
</details>

<style>
  .sum { font-size: 1.1rem; }
  .dim { color: var(--muted); font-size: 0.85em; }
  .ids { font-family: var(--mono); font-size: 0.8em; word-break: break-word; }
  details { margin: 1rem 0; }
  summary { cursor: pointer; color: var(--muted); }
</style>
