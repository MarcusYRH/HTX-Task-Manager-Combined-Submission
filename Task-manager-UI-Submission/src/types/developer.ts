// src/types/developer.ts

import { Skill } from './skill';

/**
 * Represents a developer who can be assigned to tasks
 * A developer has one or more skills
 */
export interface Developer {
  id: number;
  name: string;
  skills: Skill[];  // Array of skills this developer possesses
}
