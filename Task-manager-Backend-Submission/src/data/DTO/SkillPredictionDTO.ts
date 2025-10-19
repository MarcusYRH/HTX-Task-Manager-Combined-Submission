export interface SkillPredictionDTO {
    skillNames: string[];
    reasoning: string;
    confidence: Record<string, number>;
}