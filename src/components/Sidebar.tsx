import type { SmartView } from '../domain/types';
import { strings } from '../i18n/en';

const views: Array<{ id: SmartView; label: string }> = [
  { id: 'inbox', label: strings.viewInbox },
  { id: 'today', label: strings.viewToday },
  { id: 'upcoming', label: strings.viewUpcoming },
  { id: 'overdue', label: strings.viewOverdue },
  { id: 'completed', label: strings.viewCompleted },
  { id: 'archived', label: strings.viewArchived },
  { id: 'all', label: strings.viewAll }
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
    <aside className="sidebar" aria-label={strings.taskViewsLabel}>
      <nav>
        <p className="nav-heading">{strings.smartViews}</p>
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
        <div>
          <p className="nav-heading">{strings.projects}</p>
          <div className="nav-list">
            {projects.length === 0 && <span className="muted small">{strings.noProjectsYet}</span>}
            {projects.map((project) => (
              <button
                key={project}
                className={activeProject === project ? 'nav-button active' : 'nav-button'}
                type="button"
                onClick={() => onProject(project)}
                aria-current={activeProject === project ? 'page' : undefined}
              >
                {project}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
