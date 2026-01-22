
export enum GameMode {
  FREE = 'FREE',
  TASK = 'TASK',
  CHALLENGE = 'CHALLENGE',
  RELAX = 'RELAX'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface KitchenModule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'locked';
  icon: string;
}

export interface Feedback {
  type: 'praise' | 'encourage' | 'humor' | 'warning';
  message: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  detected: boolean;
}
