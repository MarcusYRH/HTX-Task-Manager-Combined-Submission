import { SkillBadge } from "./SkillBadge";
import { useTaskContext } from "../../context/TaskContext";

interface SkillSelectorProps {
    selected: number[];
    onChange: (skillIds: number[]) => void;
    disabled?: boolean;
}

export function SkillSelector({ selected, onChange, disabled = false }: SkillSelectorProps) {
    const { skills: availableSkills, isLoading: isLoadingSkills } = useTaskContext();

    const handleSkillToggle = (skillId: number) => {
        if (selected.includes(skillId)) {
            onChange(selected.filter(id => id !== skillId));
        } else {
            onChange([...selected, skillId]);
        }
    };
    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
            </label>

            {isLoadingSkills ? (
                <div className="text-sm text-gray-500">Loading skills...</div>
            ) : (
                <div className="space-y-2">
                    {availableSkills.map((skill) => (
                        <label
                            key={skill.id}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(skill.id)}
                                onChange={() => handleSkillToggle(skill.id)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                disabled={disabled || isLoadingSkills}
                            />
                            <span className="ml-3">
                      <SkillBadge skill={skill} />
                    </span>
                        </label>
                    ))}
                </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
                Select the skills required for this task. Leave empty for automatic skill detection via LLM.
            </p>
        </div>
    )
}