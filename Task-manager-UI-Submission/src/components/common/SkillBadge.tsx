import { Skill } from '../../types/skill';

/**
 * Props for SkillBadge component
 */
interface SkillBadgeProps {
  skill: Skill;
}

/**
 * Displays a colored badge for a skill
 * Colors are based on skill name (Frontend=blue, Backend=green)
 */
export function SkillBadge({ skill }: SkillBadgeProps) {
  // Color coding for different skills
  const getSkillColor = (skillName: string): string => {
    switch (skillName?.toLowerCase()) {
      case 'frontend':
        return 'bg-blue-100 text-blue-800';
      case 'backend':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSkillColor(skill.name)}`}
    >
      {skill.name}
    </span>
  );
}
