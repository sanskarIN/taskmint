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
        <span className="sr-only">{strings.search}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={strings.searchPlaceholder}
        />
      </label>
      <label>
        {strings.priority}
        <select
          value={priority}
          onChange={(event) => onPriority(event.target.value as Priority | 'all')}
        >
          <option value="all">{strings.all}</option>
          <option value="low">{strings.priorityLow}</option>
          <option value="medium">{strings.priorityMedium}</option>
          <option value="high">{strings.priorityHigh}</option>
          <option value="urgent">{strings.priorityUrgent}</option>
        </select>
      </label>
      <label>
        {strings.tag}
        <select value={tag} onChange={(event) => onTag(event.target.value)}>
          <option value="">{strings.all}</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        {strings.sort}
        <select value={sort} onChange={(event) => onSort(event.target.value as SortMode)}>
          <option value="manual">{strings.sortManual}</option>
          <option value="due-asc">{strings.sortDueDate}</option>
          <option value="priority-desc">{strings.sortPriority}</option>
          <option value="created-desc">{strings.sortNewest}</option>
          <option value="title-asc">{strings.sortTitle}</option>
        </select>
      </label>
    </div>
  );
}
