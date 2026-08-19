import type { Priority, SortMode } from '../domain/types';
import { strings } from '../i18n/en';

interface Props {
  search: string;
  priority: Priority | 'all';
  tag: string;
  sort: SortMode;
  tags: string[];
  onSearch: (value: string) => void;
  onPriority: (value: Priority | 'all') => void;
  onTag: (value: string) => void;
  onSort: (value: SortMode) => void;
}

export function Toolbar({ search, priority, tag, sort, tags, onSearch, onPriority, onTag, onSort }: Props) {
  return (
    <div className="toolbar card" aria-label="Search and filters">
      <label className="search-field">
        <span className="sr-only">Search</span>
        <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={strings.searchPlaceholder} />
      </label>
      <label>Priority<select value={priority} onChange={(event) => onPriority(event.target.value as Priority | 'all')}>
        <option value="all">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
      </select></label>
      <label>Tag<select value={tag} onChange={(event) => onTag(event.target.value)}><option value="">All</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Sort<select value={sort} onChange={(event) => onSort(event.target.value as SortMode)}>
        <option value="manual">Manual</option><option value="due-asc">Due date</option><option value="priority-desc">Priority</option><option value="created-desc">Newest</option><option value="title-asc">Title</option>
      </select></label>
    </div>
  );
}
