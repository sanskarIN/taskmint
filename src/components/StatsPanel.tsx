import type { ProductivityStats } from '../domain/types';
import { strings } from '../i18n/en';

interface Props {
  stats: ProductivityStats;
}

export function StatsPanel({ stats }: Props) {
  const items = [
    [strings.statActive, stats.active],
    [strings.statCompleted, stats.completed],
    [strings.statDueToday, stats.dueToday],
    [strings.statOverdue, stats.overdue],
    [strings.statCompletedSevenDays, stats.completedLast7Days],
    [strings.statCompletionRate, `${stats.completionRate}%`]
  ] as const;
  return (
    <section className="stats-grid" aria-label={strings.statsLabel}>
      {items.map(([label, value]) => (
        <div className="stat-card card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}
