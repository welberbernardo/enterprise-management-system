import { type ReactNode } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  extra?: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[];
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = true,
  extra = [],
}: ActionButtonsProps) {
  const items = [
    ...(canView && onView
      ? [{ label: 'View', icon: <Eye className="h-4 w-4" />, onClick: onView }]
      : []),
    ...(canEdit && onEdit
      ? [{ label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: onEdit }]
      : []),
    ...extra.map((e) => ({ label: e.label, icon: e.icon, onClick: e.onClick, danger: e.danger })),
    ...(canDelete && onDelete
      ? [{ label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, danger: true }]
      : []),
  ];

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {canView && onView && (
        <button
          onClick={onView}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      {canEdit && onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {items.length > 2 ? (
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
          }
          items={items}
        />
      ) : null}
      {canDelete && onDelete && items.length <= 2 && (
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-danger-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
