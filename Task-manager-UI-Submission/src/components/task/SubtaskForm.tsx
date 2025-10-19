import { useState } from 'react';
import { SkillSelector } from '../common/SkillSelector';

interface SubtaskData {
  title: string;
  skillIds: number[];
  subtasks: SubtaskData[];
}

interface SubtaskFormProps {
  value: SubtaskData;
  onChange: (subtask: SubtaskData) => void;
  onRemove: () => void;
  depth: number;
}

export function SubtaskForm({ value, onChange, onRemove, depth }: SubtaskFormProps) {
  const handleTitleChange = (newTitle: string) => {
    onChange({ ...value, title: newTitle });
  };

  const handleSkillsChange = (newSkills: number[]) => {
    onChange({ ...value, skillIds: newSkills });
  };

  const handleAddSubtask = () => {
    const newSubtask: SubtaskData = {
      title: '',
      skillIds: [],
      subtasks: []
    };
    onChange({
      ...value,
      subtasks: [...value.subtasks, newSubtask]
    });
  };

  const handleSubtaskChange = (index: number, updatedSubtask: SubtaskData) => {
    const newSubtasks = [...value.subtasks];
    newSubtasks[index] = updatedSubtask;
    onChange({ ...value, subtasks: newSubtasks });
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = value.subtasks.filter((_, i) => i !== index);
    onChange({ ...value, subtasks: newSubtasks });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4" style={{ marginLeft: depth > 0 ? `${depth * 2}rem` : '0' }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {depth === 0 ? 'Task' : `Subtask (Level ${depth})`}
        </h3>
        {depth > 0 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <textarea
          value={value.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter task description..."
          rows={3}
          className="input-field resize-none"
          required
        />
      </div>

      <SkillSelector
        selected={value.skillIds}
        onChange={handleSkillsChange}
        disabled={false}
      />

      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddSubtask}
          className="btn btn-secondary text-sm"
        >
          + Add Subtask
        </button>
      </div>

      {value.subtasks.length > 0 && (
        <div className="mt-4 space-y-4">
          {value.subtasks.map((subtask, index) => (
            <SubtaskForm
              key={index}
              value={subtask}
              onChange={(updatedSubtask) => handleSubtaskChange(index, updatedSubtask)}
              onRemove={() => handleRemoveSubtask(index)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
