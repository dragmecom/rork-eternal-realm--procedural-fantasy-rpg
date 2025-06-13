export type BiomeType = 'forest' | 'plains' | 'desert' | 'mountains' | 'hills' | 'swamp' | 'jungle' | 'tundra' | 'taiga' | 'savanna' | 'ocean' | 'river' | 'lake' | 'beach' | 'volcano' | 'wasteland';

export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy' | 'windy' | 'hot' | 'cold';

export interface AdventureOption {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: number;
  rewards: {
    experience?: number;
    gold?: number;
    items?: string[];
  };
}

export interface MapTile {
  x: number;
  y: number;
  biome: BiomeType;
  elevation: number;
  humidity: number;
  temperature: number;
  explored: boolean;
  hasTown: boolean;
  description?: string;
  worldId: string;
  weather?: WeatherType;
  type: string;
  moisture?: number;
  difficulty: number;
  discovered: boolean;
  options: AdventureOption[];
}