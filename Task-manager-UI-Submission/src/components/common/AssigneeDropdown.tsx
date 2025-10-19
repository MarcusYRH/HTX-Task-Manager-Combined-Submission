import { useTaskContext } from '../../context/TaskContext';

interface AssigneeDropdownProps {
  taskId: number;
  value: number | null;
  onChange: (developerId: number | null) => void;
  disabled?: boolean;
}

export function AssigneeDropdown({
  taskId,
  value,
  onChange,
  disabled = false
}: AssigneeDropdownProps) {
  const { developers, tasks } = useTaskContext();
  const task = tasks.find(t => t.id === taskId);
  const taskSkills = task?.skills?.map(s => s.id) || [];

  const eligibleDevelopers = developers.filter(developer => {
    if (!taskSkills || taskSkills.length === 0) {
      return true;
    }
    const developerSkillIds: number[] = developer.skills?.map(skill => skill.id) || [];
    return taskSkills.every(requiredSkillId =>
      developerSkillIds.includes(requiredSkillId)
    );
  });


    return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">Update Assignee</option>
      {eligibleDevelopers.map((developer) => (
        <option key={developer.id} value={developer.id}>
          {developer.name}
        </option>
      ))}
    </select>
  );
}
