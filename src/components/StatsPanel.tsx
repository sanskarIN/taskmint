import type { ProductivityStats } from '../domain/types';

interface Props { stats: ProductivityStats; }

export function StatsPanel({ stats }: Props) {
  const items = [
    ['Active', stats.active],
    ['Completed', stats.completed],
    ['Due today', stats.dueToday],
    ['Overdue', stats.overdue],
    ['Completed in 7 days', stats.completedLast7Days],
    ['Completion rate', `${stats.completionRate}%`]
  ] as const;
  return (
    <section className="stats-grid" aria-label="Productivity statistics">
      {items.map(([label, value]) => <div className="stat-card card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </section>
  );
}
