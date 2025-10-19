import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { SubtaskForm } from '../components/task/SubtaskForm';

interface SubtaskData {
  title: string;
  skillIds: number[];
  subtasks: SubtaskData[];
}

export function TaskCreationPage() {
  const navigate = useNavigate();
  const { createTask } = useTaskContext();

  const [taskData, setTaskData] = useState<SubtaskData>({
    title: '',
    skillIds: [],
    subtasks: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTaskRecursively = async (data: SubtaskData, parentId?: number): Promise<boolean> => {
    try {
      const createdTask = await createTask({
        title: data.title.trim(),
        skillIds: data.skillIds,
        parentTaskId: parentId
      });
      // todo: remove
      // console.log(createdTask);

      if (!createdTask) {
        return false;
      }

      if (data.subtasks && data.subtasks.length > 0) {
          // console.log('Creating subtasks for task ID:', createdTask.id);
        for (const subtask of data.subtasks) {
            // recursion
          const success = await createTaskRecursively(subtask, createdTask.id);
          if (!success) {
            return false;
          }
        }
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!taskData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);

    try {
      const success = await createTaskRecursively(taskData);

      if (success) {
        navigate('/');
      } else {
        setError('Failed to create task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Task</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new task with optional subtasks
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <SubtaskForm
            value={taskData}
            onChange={setTaskData}
            onRemove={() => {}}
            depth={0}
          />

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !taskData.title.trim()}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
