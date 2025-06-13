export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  isCompleted: boolean;
  isActive: boolean;
  requiredLevel: number;
  givenBy: string;
  location: string;
  timeLimit?: number; // In milliseconds, optional
  startTime?: number; // When the quest was accepted
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'explore' | 'escort' | 'deliver' | 'interact';
  target: string;
  count: number;
  progress: number;
  isCompleted: boolean;
}

export interface QuestReward {
  experience: number;
  gold: number;
  items?: string[]; // Item IDs
  reputation?: {
    faction: string;
    amount: number;
  };
  unlocks?: string[]; // IDs of quests, areas, or features unlocked
}