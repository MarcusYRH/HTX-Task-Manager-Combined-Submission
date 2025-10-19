import {GoogleGenerativeAI, GenerativeModel} from '@google/generative-ai';
import {config} from '../config/env';
import {Skill} from "../data/entities/Skill";
import {SkillPredictionDTO} from "../data/DTO/SkillPredictionDTO";
import {TaskContextService, ContextTask} from './taskContext.service';
import { TaskManagerException } from '../common/exceptions/TaskManagerException';

export class LLMService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private taskContextService: TaskContextService;

    constructor(taskContextService: TaskContextService) {
        this.taskContextService = taskContextService;
        this.genAI = new GoogleGenerativeAI(config.llm.apiKey || '');
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.3,
                topK: 1,
                topP: 0.8,
            }
        });
    }

    async extractKeywords(title: string): Promise<string[]> {
        const prompt = `Extract 3-5 core technical keywords from this task title.
Focus on: technologies, features, components, actions.
Ignore: filler words, "As a", "I want to", "so that".
Return only a JSON array of keywords.

Title: "${title}"

Example response: ["authentication", "API", "database"]`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                const keywords = JSON.parse(jsonMatch[0]) as string[];
                return keywords.filter(k => k && k.length > 2).slice(0, 5);
            }
        } catch (error) {
            console.error('Keyword extraction error:', error);
        }

        return [];
    }

    async predictSkills(taskTitle: string, availableSkills: Skill[]): Promise<SkillPredictionDTO> {
        const similarTasks = await this.taskContextService.findSimilarTasks(taskTitle, undefined, 5);
        console.log('Similar tasks found:', similarTasks.length);

        const initialPrediction = await this.generateInitialPrediction(taskTitle, availableSkills, similarTasks);
        return await this.generateVerificationPrediction(taskTitle, availableSkills, initialPrediction, similarTasks);
    }


    private async generateInitialPrediction(
        taskTitle: string,
        availableSkills: Skill[],
        similarTasks: ContextTask[]
    ): Promise<SkillPredictionDTO> {
        const prompt = this.buildInitialPrompt(taskTitle, availableSkills, similarTasks);

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            console.log('LLM initial response:', text);

            return this.parseResponse(text, availableSkills);
        } catch (error) {
            console.error('LLM initial error:', error);
            return this.getFallbackPrediction(taskTitle, availableSkills);
        }
    }

    private async generateVerificationPrediction(
        taskTitle: string,
        availableSkills: Skill[],
        initialPrediction: SkillPredictionDTO,
        similarTasks: ContextTask[]
    ): Promise<SkillPredictionDTO> {
        const prompt = this.buildVerificationPrompt(taskTitle, availableSkills, initialPrediction, similarTasks);

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            console.log('LLM verification response:', text);

            return this.parseResponse(text, availableSkills);
        } catch (error) {
            console.error('LLM verification error:', error);
            return initialPrediction;
        }
    }


    private buildInitialPrompt(taskTitle: string, availableSkills: Skill[], similarTasks: ContextTask[]): string {
        const skillNames = availableSkills.map(s => s.name).join(', ');

        let prompt = `You are an experienced lead software engineer analyzing task requirements.

Task: "${taskTitle}"

Available skills: ${skillNames}`;

        if (similarTasks.length > 0) {
            prompt += `\n\nSimilar tasks from our database:`;
            similarTasks.forEach((task, idx) => {
                const taskSkills = task.skills.map(s => s.name).join(', ');
                prompt += `\n${idx + 1}. "${task.title}" → Skills: [${taskSkills}]`;
            });

            const skillFrequency = this.calculateSkillFrequency(similarTasks);
            if (Object.keys(skillFrequency).length > 0) {
                prompt += `\n\nPattern analysis:`;
                Object.entries(skillFrequency).forEach(([skill, percentage]) => {
                    prompt += ` ${Math.round(percentage * 100)}% needed ${skill},`;
                });
                prompt = prompt.slice(0, -1);
            }
        }

        prompt += `\n\nAnalyze this task step-by-step:
1. What UI components or user interactions are needed? → Frontend skill
2. What server logic, APIs, or data persistence is needed? → Backend skill
3. Consider that tasks may require BOTH skills if they involve full-stack work
4. You should be resolute and concise in your selection. Focus ONLY on the title as the task's objective, not what could be tangentially related.

Respond with valid JSON only:
{
  "skills": ["skill1", "skill2"],
  "confidence": {"skill1": 0.95, "skill2": 0.85},
  "reasoning": "Detailed explanation of your analysis"
}

Rules:
- Only use skills from: ${skillNames}
- Minimum confidence: 0.6
- Be specific in reasoning
- Must be valid JSON`;

        return prompt;
    }

    private buildVerificationPrompt(
        taskTitle: string,
        availableSkills: Skill[],
        initialPrediction: SkillPredictionDTO,
        similarTasks: ContextTask[]
    ): string {
        const skillNames = availableSkills.map(s => s.name).join(', ');

        let prompt = `You are a senior technical lead reviewing a skill assignment.

Task: "${taskTitle}"

Available skills: ${skillNames}

Initial prediction:
- Skills: ${initialPrediction.skillNames.join(', ')}
- Reasoning: ${initialPrediction.reasoning}`;

        if (similarTasks.length > 0) {
            prompt += `\n\nHistorical context from database:`;
            similarTasks.forEach((task, idx) => {
                const taskSkills = task.skills.map(s => s.name).join(', ');
                prompt += `\n${idx + 1}. "${task.title}" → Skills: [${taskSkills}]`;
            });

            const skillFrequency = this.calculateSkillFrequency(similarTasks);
            if (Object.keys(skillFrequency).length > 0) {
                prompt += `\n\nPattern from similar tasks:`;
                Object.entries(skillFrequency).forEach(([skill, percentage]) => {
                    prompt += ` ${Math.round(percentage * 100)}% needed ${skill},`;
                });
                prompt = prompt.slice(0, -1);
            }
        }

        prompt += `\n\nVerify this prediction:
1. Does the initial prediction align with historical patterns above?
2. Is any required skill missing based on similar tasks?
3. Is any skill unnecessary?

Respond with valid JSON only:
{
  "skills": ["skill1", "skill2"],
  "confidence": {"skill1": 0.95, "skill2": 0.85},
  "reasoning": "Explanation referencing historical patterns if relevant"
}

Rules:
- Only use skills from: ${skillNames}
- Minimum confidence: 0.6
- Must be valid JSON`;

        return prompt;
    }

    private calculateSkillFrequency(tasks: ContextTask[]): Record<string, number> {
        if (tasks.length === 0) return {};

        const skillCounts: Record<string, number> = {};
        tasks.forEach(task => {
            task.skills.forEach(skill => {
                skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
            });
        });

        const frequency: Record<string, number> = {};
        Object.entries(skillCounts).forEach(([skill, count]) => {
            frequency[skill] = count / tasks.length;
        });

        return frequency;
    }

    private parseResponse(text: string, availableSkills: Skill[]): SkillPredictionDTO {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new TaskManagerException('Error calling LLM: No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            const validSkillNames = new Set(availableSkills.map(s => s.name));

            const skillNames = (parsed.skills || []).filter((skill: string) =>
                validSkillNames.has(skill)
            );

            const confidence = parsed.confidence || {};
            const reasoning = parsed.reasoning || 'LLM analysis completed';

            return {
                skillNames,
                reasoning,
                confidence
            };
        } catch (error) {
            console.error('Parse LLM response error:', error);
            if (error instanceof TaskManagerException) {
                throw error;
            }
            throw new TaskManagerException(`Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private getFallbackPrediction(taskTitle: string, availableSkills: Skill[]): SkillPredictionDTO {
        const title = taskTitle.toLowerCase();
        const skills: string[] = [];

        const frontendKeywords = ['ui', 'frontend', 'page', 'component', 'responsive', 'mobile', 'design', 'css', 'html', 'react'];
        const backendKeywords = ['api', 'backend', 'database', 'server', 'auth', 'security', 'log', 'data'];

        const hasFrontend = frontendKeywords.some(kw => title.includes(kw));
        const hasBackend = backendKeywords.some(kw => title.includes(kw));

        availableSkills.forEach(skill => {
            const skillLower = skill.name.toLowerCase();
            if (hasFrontend && skillLower.includes('frontend')) {
                skills.push(skill.name);
            } else if (hasBackend && skillLower.includes('backend')) {
                skills.push(skill.name);
            }
        });

        if (skills.length === 0) {
            availableSkills.forEach(skill => skills.push(skill.name));
        }

        return {
            skillNames: skills,
            reasoning: 'Fallback keyword-based prediction',
            confidence: skills.reduce((acc, skill) => {
                acc[skill] = 0.5;
                return acc;
            }, {} as Record<string, number>)
        };
    }
}
