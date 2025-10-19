import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskRow } from '../components/task/TaskRow';
import { Pagination } from '../components/common/Pagination';
import { useTaskContext } from '../context/TaskContext';
import { Task, TaskStatus } from '../types/task';

export function TaskListPage() {
    const { tasks, isLoading, error, updateTask, loadTasks, isTaskUpdating, pagination } = useTaskContext();
    const [showParentTasksOnly, setShowParentTasksOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        const success = await updateTask(taskId, { status: newStatus });
        if (!success) {
            alert('Failed to update status');
        }
    };

    const handleAssigneeChange = async (taskId: number, developerId: number | null) => {
        const success = await updateTask(taskId, { developerId });
        if (!success) {
            alert('Failed to assign task');
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        loadTasks({ parentOnly: showParentTasksOnly, page: newPage, pageSize });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleParentOnlyChange = (checked: boolean) => {
        setShowParentTasksOnly(checked);
        setCurrentPage(1);
        loadTasks({ parentOnly: checked, page: 1, pageSize });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showParentTasksOnly}
                            onChange={(e) => handleParentOnlyChange(e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span>Display Only Top-Level Parent Tasks</span>
                    </label>
                    <Link to="/create" className="btn btn-primary">
                        + Create New Task
                    </Link>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500 mb-4">No tasks found</p>
                    <Link to="/create" className="btn btn-primary">
                        Create Your First Task
                    </Link>
                </div>
            ) : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Task Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Skills
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Update Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Update Assignee
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tasks.map((task: Task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        onStatusChange={handleStatusChange}
                                        onAssigneeChange={handleAssigneeChange}
                                        isUpdating={isTaskUpdating(task.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            hasNext={pagination.hasNext}
                            hasPrevious={pagination.hasPrevious}
                            onPageChange={handlePageChange}
                            totalItems={pagination.totalItems}
                            pageSize={pagination.pageSize}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
