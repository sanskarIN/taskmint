import type { SmartView } from '../domain/types';

const views: Array<{ id: SmartView; label: string }> = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
  { id: 'all', label: 'All tasks' }
];

interface Props {
  activeView: SmartView;
  projects: string[];
  activeProject: string;
  onView: (view: SmartView) => void;
  onProject: (project: string) => void;
}

export function Sidebar({ activeView, projects, activeProject, onView, onProject }: Props) {
  return (
    <aside className="sidebar" aria-label="Task views">
      <nav>
        <p className="nav-heading">Smart views</p>
        <div className="nav-list">
          {views.map((view) => (
            <button
              key={view.id}
              className={activeView === view.id && !activeProject ? 'nav-button active' : 'nav-button'}
              type="button"
              onClick={() => onView(view.id)}
              aria-current={activeView === view.id && !activeProject ? 'page' : undefined}
            >
              {view.label}
            </button>
          ))}
        </div>
      </nav>
      <div>
        <p className="nav-heading">Projects</p>
        <div className="nav-list">
          {projects.length === 0 && <span className="muted small">No projects yet</span>}
          {projects.map((project) => (
            <button
              key={project}
              className={activeProject === project ? 'nav-button active' : 'nav-button'}
              type="button"
              onClick={() => onProject(project)}
            >
              {project}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
