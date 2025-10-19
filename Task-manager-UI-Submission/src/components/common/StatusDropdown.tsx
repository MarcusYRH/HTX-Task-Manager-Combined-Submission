import { TaskStatus } from '../../types/task';

interface StatusDropdownProps {
  value: TaskStatus;
  onChange: (newStatus: TaskStatus) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: TaskStatus[] = ['To-do', 'In Progress', 'Done'];

export function StatusDropdown({ value, onChange, disabled = false }: StatusDropdownProps) {
  return (
    <select
      value=""
      onChange={(e) => {
        if (e.target.value) {
          onChange(e.target.value as TaskStatus);
        }
      }}
      disabled={disabled}
      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">Update Status</option>
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
