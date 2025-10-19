import { Task, TaskStatus } from '../../types/task';
import { StatusDropdown } from '../common/StatusDropdown';
import { AssigneeDropdown } from '../common/AssigneeDropdown';
import { SkillBadge } from '../common/SkillBadge';

interface TaskRowProps {
    task: Task;
    onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
    onAssigneeChange: (taskId: number, developerId: number | null) => void;
    isUpdating?: boolean;
}

export function TaskRow({
    task,
    onStatusChange,
    onAssigneeChange,
    isUpdating = false
}: TaskRowProps) {
    return (
        <tr className={`transition-colors ${isUpdating ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'}`}>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                    {task.title}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                    {task.skills && task.skills.length > 0 ? (
                        task.skills.map((skill) => (
                            <SkillBadge key={skill.id} skill={skill} />
                        ))
                    ) : (
                        <span className="text-sm text-gray-400 italic">No skills specified</span>
                    )}
                </div>
            </td>

            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'Done'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                }`}>
                    {task.status}
                </span>
            </td>

            <td className="px-6 py-4">
                <StatusDropdown
                    value={task.status}
                    onChange={(newStatus) => onStatusChange(task.id, newStatus)}
                    disabled={isUpdating}
                />
            </td>

            <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                    {task.developer?.name || 'Unassigned'}
                </span>
            </td>

            <td className="px-6 py-4">
                <AssigneeDropdown
                    taskId={task.id}
                    value={task.developerId}
                    onChange={(developerId) => onAssigneeChange(task.id, developerId)}
                    disabled={isUpdating}
                />
            </td>
        </tr>
    );
}
