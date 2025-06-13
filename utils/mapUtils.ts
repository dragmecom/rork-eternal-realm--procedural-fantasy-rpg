import { BiomeType, WeatherType } from '@/types/map';

// Get image URL for a biome
export const getBiomeImage = (biome: BiomeType, weather?: string): string => {
  // Default images for each biome
  const biomeImages: Record<BiomeType, string> = {
    plains: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    desert: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    swamp: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    tundra: 'https://images.unsplash.com/photo-1517345438041-cf88a04b4689?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    volcanic: 'https://images.unsplash.com/photo-1554232682-b9ef9c92f8de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    jungle: 'https://images.unsplash.com/photo-1536147116438-62679a5e01f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    ocean: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    lavaFields: 'https://images.unsplash.com/photo-1554232682-b9ef9c92f8de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    wasteland: 'https://images.unsplash.com/photo-1469723930759-98c0a7d7f422?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    highlands: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    marsh: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    river: 'https://images.unsplash.com/photo-1558196220-e8b4a732af16?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    lake: 'https://images.unsplash.com/photo-1580100586938-02822d99c4a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
  };

  // Weather-specific images
  if (weather) {
    switch (weather) {
      case 'rain':
        return 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
      case 'storm':
        return 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
      case 'snow':
        return 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
      case 'fog':
        return 'https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
      case 'heatwave':
        return 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
      case 'sandstorm':
        return 'https://images.unsplash.com/photo-1584988299488-77d12cf20b87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80';
    }
  }

  // Return the default biome image
  return biomeImages[biome] || biomeImages.plains;
};

// Get color for a biome
export const getBiomeColor = (biome: BiomeType): string => {
  switch (biome) {
    case 'plains':
      return '#a8e05f';
    case 'forest':
      return '#2d8659';
    case 'desert':
      return '#e8d95a';
    case 'mountains':
      return '#8c8c8c';
    case 'swamp':
      return '#5f7352';
    case 'tundra':
      return '#e0e0e0';
    case 'volcanic':
      return '#d95763';
    case 'jungle':
      return '#29bc56';
    case 'ocean':
      return '#4286f4';
    case 'lavaFields':
      return '#ff4500';
    case 'wasteland':
      return '#8b6d5c';
    case 'highlands':
      return '#a0a0a0';
    case 'beach':
      return '#f7e9c3';
    case 'marsh':
      return '#7a9e7e';
    case 'river':
      return '#5da9e9';
    case 'lake':
      return '#64b5f6';
    default:
      return '#cccccc';
  }
};

// Get icon for a biome
export const getBiomeIcon = (biome: BiomeType): string => {
  switch (biome) {
    case 'plains':
      return '🌾';
    case 'forest':
      return '🌲';
    case 'desert':
      return '🏜️';
    case 'mountains':
      return '⛰️';
    case 'swamp':
      return '🌿';
    case 'tundra':
      return '❄️';
    case 'volcanic':
      return '🌋';
    case 'jungle':
      return '🌴';
    case 'ocean':
      return '🌊';
    case 'lavaFields':
      return '🔥';
    case 'wasteland':
      return '☢️';
    case 'highlands':
      return '🏔️';
    case 'beach':
      return '🏖️';
    case 'marsh':
      return '💧';
    case 'river':
      return '🏞️';
    case 'lake':
      return '🌊';
    default:
      return '❓';
  }
};

// Get weather icon
export const getWeatherIcon = (weather: WeatherType): string => {
  switch (weather) {
    case 'clear':
      return '☀️';
    case 'cloudy':
      return '☁️';
    case 'rain':
      return '🌧️';
    case 'storm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'fog':
      return '🌫️';
    case 'heatwave':
      return '🔥';
    case 'sandstorm':
      return '💨';
    default:
      return '❓';
  }
};

// Check if a biome is a water biome
export const isWaterBiome = (biome: BiomeType): boolean => {
  return biome === 'ocean' || biome === 'river' || biome === 'lake';
};

// Get difficulty color
export const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 2) return '#4caf50'; // Easy - green
  if (difficulty <= 4) return '#8bc34a'; // Normal - light green
  if (difficulty <= 6) return '#ffc107'; // Medium - yellow
  if (difficulty <= 8) return '#ff9800'; // Hard - orange
  return '#f44336'; // Very hard - red
};

// Get difficulty text
export const getDifficultyText = (difficulty: number): string => {
  if (difficulty <= 2) return 'Easy';
  if (difficulty <= 4) return 'Normal';
  if (difficulty <= 6) return 'Medium';
  if (difficulty <= 8) return 'Hard';
  return 'Very Hard';
};