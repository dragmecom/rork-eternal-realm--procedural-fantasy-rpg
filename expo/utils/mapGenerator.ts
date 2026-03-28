import { MapTile, BiomeType, WeatherType, PathType, AdventureOption } from "@/types/map";
import { World } from "@/types/game";
import { createSeededRandom } from "./seedGenerator";
import { Town } from "@/types/town";
import { generateTown } from "./townGenerator";

/**
 * Generates a chunk of map tiles for the given world
 * @param seed The world seed
 * @param startX Starting X coordinate
 * @param startY Starting Y coordinate
 * @param endX Ending X coordinate
 * @param endY Ending Y coordinate
 * @param world The world object
 */
export async function generateMapChunk(
  seed: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  world: World
): Promise<MapTile[]> {
  const random = createSeededRandom(seed);
  const tiles: MapTile[] = [];
  
  // Ensure coordinates are within world bounds
  startX = Math.max(0, startX);
  startY = Math.max(0, startY);
  endX = Math.min(world.mapSize - 1, endX);
  endY = Math.min(world.mapSize - 1, endY);
  
  // Generate noise values for the chunk
  const elevationNoise = generatePerlinNoise(seed + "_elevation", startX, startY, endX, endY, 8, 0.5);
  const temperatureNoise = generatePerlinNoise(seed + "_temperature", startX, startY, endX, endY, 6, 0.7);
  const moistureNoise = generatePerlinNoise(seed + "_moisture", startX, startY, endX, endY, 7, 0.6);
  const riverNoise = generatePerlinNoise(seed + "_river", startX, startY, endX, endY, 10, 0.8);
  
  // Create a 2D grid for the chunk to help with neighbor calculations
  const grid: (MapTile | null)[][] = [];
  for (let y = startY; y <= endY; y++) {
    grid[y - startY] = [];
    for (let x = startX; x <= endX; x++) {
      grid[y - startY][x - startX] = null;
    }
  }
  
  // First pass: Generate basic tile properties
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      // Get noise values for this tile
      const elevationValue = elevationNoise[y - startY][x - startX];
      
      // Apply temperature gradient (warmer in middle, colder at poles)
      const latitudeFactor = Math.abs((y / world.mapSize) - 0.5) * 2; // 0 at equator, 1 at poles
      const baseTemperature = temperatureNoise[y - startY][x - startX];
      const temperatureValue = baseTemperature - (latitudeFactor * 0.5);
      
      const moistureValue = moistureNoise[y - startY][x - startX];
      const riverValue = riverNoise[y - startY][x - startX];
      
      // Determine if this is a potential river tile
      const isRiverCandidate = riverValue > 0.7 && elevationValue > 0.3 && elevationValue < 0.8;
      
      // Determine biome based on elevation, temperature, and moisture
      const biome = determineBiome(elevationValue, temperatureValue, moistureValue, latitudeFactor);
      
      // Determine weather
      const weather = determineWeather(temperatureValue, moistureValue, random);
      
      // Calculate difficulty based on distance from center, elevation, and biome
      const centerX = world.mapSize / 2;
      const centerY = world.mapSize / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      ) / (world.mapSize / 2); // Normalized to 0-1
      
      const biomeDifficultyFactor = getBiomeDifficultyFactor(biome);
      
      const difficulty = Math.min(
        10,
        Math.max(
          1,
          Math.floor(
            (distanceFromCenter * 5 + elevationValue * 3 + world.difficultyBias * 2 + biomeDifficultyFactor) * 1.5
          )
        )
      );
      
      // Check if this tile has a town (will be set in a later pass)
      const hasTown = false;
      
      // Check if this tile has a portal
      const hasPortal = random.randomBool(0.001); // 0.1% chance
      
      // Create the tile
      const tile: MapTile = {
        worldId: world.id,
        x,
        y,
        elevation: Math.floor(elevationValue * 100),
        temperature: Math.floor((temperatureValue * 50) + 50), // 0-100 scale
        moisture: moistureValue * 100, // 0-100 scale
        humidity: moistureValue * 100, // 0-100 scale (same as moisture for compatibility)
        weather,
        biome,
        type: biome, // For compatibility with game.ts MapTile
        explored: false, // For compatibility with game.ts MapTile
        difficulty,
        discovered: false,
        hasTown,
        hasPortal,
        hasPath: false,
        hasRiver: isRiverCandidate,
        isLake: false,
        description: generateTileDescription(biome, weather, difficulty),
        options: []
      };
      
      tiles.push(tile);
      grid[y - startY][x - startX] = tile;
    }
  }
  
  // Second pass: Generate lakes
  generateLakes(grid, random, startX, startY, world.id);
  
  // Third pass: Generate rivers flowing from high to low elevation
  generateRivers(grid, random, startX, startY, world.id);
  
  // Fourth pass: Adjust biomes based on water proximity (beaches, marshes)
  adjustBiomesNearWater(grid, startX, startY);
  
  // Fifth pass: Generate adventure options for each tile
  generateAdventureOptions(grid, startX, startY);
  
  // Return the generated tiles
  return tiles.filter(tile => tile !== null) as MapTile[];
}

/**
 * Generates towns for the world
 */
export function generateWorldTowns(world: World): Town[] {
  const random = createSeededRandom(world.seed + "_towns");
  const towns: Town[] = [];
  
  // Generate a grid to track town positions and biomes
  const townGrid: boolean[][] = [];
  const biomeGrid: string[][] = [];
  for (let y = 0; y < world.mapSize; y++) {
    townGrid[y] = [];
    biomeGrid[y] = [];
    for (let x = 0; x < world.mapSize; x++) {
      townGrid[y][x] = false;
      biomeGrid[y][x] = "";
    }
  }
  
  // Generate starting town at center of map
  let startX = Math.floor(world.mapSize / 2);
  let startY = Math.floor(world.mapSize / 2);
  
  // Fill the biome grid with sample data to check for water tiles
  const elevationNoise = generatePerlinNoise(world.seed + "_elevation", 0, 0, world.mapSize - 1, world.mapSize - 1, 8, 0.5);
  const temperatureNoise = generatePerlinNoise(world.seed + "_temperature", 0, 0, world.mapSize - 1, world.mapSize - 1, 6, 0.7);
  const moistureNoise = generatePerlinNoise(world.seed + "_moisture", 0, 0, world.mapSize - 1, world.mapSize - 1, 7, 0.6);
  const riverNoise = generatePerlinNoise(world.seed + "_river", 0, 0, world.mapSize - 1, world.mapSize - 1, 10, 0.8);
  
  // Fill the biome grid
  for (let y = 0; y < world.mapSize; y++) {
    for (let x = 0; x < world.mapSize; x++) {
      const elevationValue = elevationNoise[y][x];
      const latitudeFactor = Math.abs((y / world.mapSize) - 0.5) * 2;
      const baseTemperature = temperatureNoise[y][x];
      const temperatureValue = baseTemperature - (latitudeFactor * 0.5);
      const moistureValue = moistureNoise[y][x];
      
      const biome = determineBiome(elevationValue, temperatureValue, moistureValue, latitudeFactor);
      biomeGrid[y][x] = biome;
      
      // Check for river or lake
      const isRiverCandidate = riverNoise[y][x] > 0.7 && elevationValue > 0.3 && elevationValue < 0.8;
      if (isRiverCandidate) {
        if (biome !== 'ocean' && biome !== 'lake') {
          biomeGrid[y][x] = 'river';
        }
      }
    }
  }
  
  // Check if starting position is in water, if so, find closest non-water tile
  if (isWaterTile(biomeGrid[startY][startX])) {
    const newPosition = findClosestNonWaterTile(startX, startY, biomeGrid);
    startX = newPosition.x;
    startY = newPosition.y;
  }
  
  // Generate starting town
  const startingTown = generateTown({
    seed: world.seed,
    worldId: world.id,
    position: { x: startX, y: startY },
    depth: 0,
    parentId: null
  });
  
  towns.push(startingTown);
  townGrid[startY][startX] = true;
  
  // Find river and biome transition locations for town placement
  const riverLocations: {x: number, y: number, isJunction: boolean}[] = [];
  const biomeTransitions: {x: number, y: number, biomes: string[]}[] = [];
  
  // Identify potential town locations
  for (let y = 0; y < world.mapSize; y++) {
    for (let x = 0; x < world.mapSize; x++) {
      const biome = biomeGrid[y][x];
      
      // Skip water tiles for town placement
      if (isWaterTile(biome)) {
        continue;
      }
      
      // Check if this is near a river
      let nearRiver = false;
      let riverNeighbors = 0;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < world.mapSize && ny >= 0 && ny < world.mapSize) {
            if (biomeGrid[ny][nx] === 'river') {
              nearRiver = true;
              riverNeighbors++;
            }
          }
        }
      }
      
      if (nearRiver) {
        riverLocations.push({
          x, 
          y, 
          isJunction: riverNeighbors > 1
        });
      }
      
      // Check for biome transitions
      if (x > 0 && y > 0 && x < world.mapSize - 1 && y < world.mapSize - 1) {
        const neighborBiomes = new Set<string>();
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            const neighborBiome = biomeGrid[ny][nx];
            if (neighborBiome && neighborBiome !== biome && !isWaterTile(neighborBiome)) {
              neighborBiomes.add(neighborBiome);
            }
          }
        }
        
        if (neighborBiomes.size > 0) {
          biomeTransitions.push({
            x,
            y,
            biomes: Array.from(neighborBiomes)
          });
        }
      }
    }
  }
  
  // Prioritize locations for towns
  const townLocations: {x: number, y: number, priority: number}[] = [];
  
  // Add river junctions (highest priority)
  riverLocations.filter(loc => loc.isJunction).forEach(loc => {
    townLocations.push({
      x: loc.x,
      y: loc.y,
      priority: 1
    });
  });
  
  // Add river locations (medium priority)
  riverLocations.filter(loc => !loc.isJunction).forEach(loc => {
    townLocations.push({
      x: loc.x,
      y: loc.y,
      priority: 2
    });
  });
  
  // Add biome transitions (lower priority)
  biomeTransitions.forEach(loc => {
    townLocations.push({
      x: loc.x,
      y: loc.y,
      priority: 3
    });
  });
  
  // Sort by priority
  townLocations.sort((a, b) => a.priority - b.priority);
  
  // Determine minimum town distance based on map size
  const minTownDistance = Math.max(8, Math.floor(world.mapSize / 15)); // Increased minimum distance
  
  // Filter out locations too close to existing towns
  const filteredLocations = townLocations.filter(loc => {
    // Skip water tiles
    if (isWaterTile(biomeGrid[loc.y][loc.x])) {
      return false;
    }
    
    for (const town of towns) {
      const distance = Math.sqrt(
        Math.pow(loc.x - town.position.x, 2) +
        Math.pow(loc.y - town.position.y, 2)
      );
      
      if (distance < minTownDistance) {
        return false;
      }
    }
    return true;
  });
  
  // Generate towns at the best locations
  const numAdditionalTowns = world.numTowns - 1;
  for (let i = 0; i < Math.min(numAdditionalTowns, filteredLocations.length); i++) {
    const location = filteredLocations[i];
    
    // Calculate depth based on distance from center
    const distanceFromCenter = Math.sqrt(
      Math.pow(location.x - startX, 2) +
      Math.pow(location.y - startY, 2)
    );
    
    const depth = Math.floor(distanceFromCenter / 5);
    
    // Find closest town to be the parent
    let closestTown = towns[0];
    let closestDistance = Infinity;
    
    for (const town of towns) {
      const distance = Math.sqrt(
        Math.pow(location.x - town.position.x, 2) +
        Math.pow(location.y - town.position.y, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTown = town;
      }
    }
    
    // Generate town
    const town = generateTown({
      seed: world.seed + i,
      worldId: world.id,
      position: { x: location.x, y: location.y },
      depth,
      parentId: closestTown.id
    });
    
    towns.push(town);
    townGrid[location.y][location.x] = true;
  }
  
  // If we don't have enough towns from good locations, add some random ones
  if (towns.length < world.numTowns) {
    const remainingTowns = world.numTowns - towns.length;
    let attempts = 0;
    let townsAdded = 0;
    
    while (townsAdded < remainingTowns && attempts < 1000) {
      const x = random.randomInt(0, world.mapSize - 1);
      const y = random.randomInt(0, world.mapSize - 1);
      
      // Skip if this position already has a town
      if (townGrid[y][x]) {
        attempts++;
        continue;
      }
      
      // Skip if this is a water tile
      if (isWaterTile(biomeGrid[y][x])) {
        attempts++;
        continue;
      }
      
      // Check if this position is far enough from other towns
      let isFarEnough = true;
      for (const town of towns) {
        const distance = Math.sqrt(
          Math.pow(x - town.position.x, 2) +
          Math.pow(y - town.position.y, 2)
        );
        
        if (distance < minTownDistance) {
          isFarEnough = false;
          break;
        }
      }
      
      if (!isFarEnough) {
        attempts++;
        continue;
      }
      
      // Calculate depth based on distance from center
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - startX, 2) +
        Math.pow(y - startY, 2)
      );
      
      const depth = Math.floor(distanceFromCenter / 5);
      
      // Find closest town to be the parent
      let closestTown = towns[0];
      let closestDistance = Infinity;
      
      for (const town of towns) {
        const distance = Math.sqrt(
          Math.pow(x - town.position.x, 2) +
          Math.pow(y - town.position.y, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTown = town;
        }
      }
      
      // Generate town
      const town = generateTown({
        seed: world.seed + towns.length,
        worldId: world.id,
        position: { x, y },
        depth,
        parentId: closestTown.id
      });
      
      towns.push(town);
      townGrid[y][x] = true;
      townsAdded++;
    }
  }
  
  return towns;
}

/**
 * Check if a tile is a water tile (ocean, river, lake)
 */
function isWaterTile(biome: string): boolean {
  return biome === 'ocean' || biome === 'river' || biome === 'lake';
}

/**
 * Find the closest non-water tile to a given position
 */
function findClosestNonWaterTile(x: number, y: number, biomeGrid: string[][]): { x: number, y: number } {
  const height = biomeGrid.length;
  const width = biomeGrid[0].length;
  
  // If the current tile is not water, return it
  if (!isWaterTile(biomeGrid[y][x])) {
    return { x, y };
  }
  
  // Search in expanding circles until a non-water tile is found
  for (let radius = 1; radius < Math.max(width, height); radius++) {
    // Check all tiles at this radius
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check tiles at the current radius (on the perimeter)
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          const nx = x + dx;
          const ny = y + dy;
          
          // Check if coordinates are valid
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            // Check if this is a non-water tile
            if (!isWaterTile(biomeGrid[ny][nx])) {
              return { x: nx, y: ny };
            }
          }
        }
      }
    }
  }
  
  // Fallback to original position if no non-water tile found
  return { x, y };
}

/**
 * Generates a 2D array of Perlin noise values
 */
function generatePerlinNoise(
  seed: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  octaves: number = 6,
  persistence: number = 0.5
): number[][] {
  const width = endX - startX + 1;
  const height = endY - startY + 1;
  const result: number[][] = [];
  
  // Initialize the result array
  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      // Calculate actual world coordinates
      const worldX = startX + x;
      const worldY = startY + y;
      
      // Generate proper Perlin noise with multiple octaves
      let amplitude = 1;
      let frequency = 1;
      let noiseValue = 0;
      let maxValue = 0;
      
      for (let i = 0; i < octaves; i++) {
        // Scale coordinates based on frequency
        const sampleX = worldX * frequency / 100;
        const sampleY = worldY * frequency / 100;
        
        // Get noise value
        const noise = perlinNoise2D(sampleX, sampleY, seed + i);
        
        // Add to total noise value
        noiseValue += noise * amplitude;
        maxValue += amplitude;
        
        // Update amplitude and frequency for next octave
        amplitude *= persistence;
        frequency *= 2;
      }
      
      // Normalize to 0-1 range
      result[y][x] = (noiseValue / maxValue) * 0.5 + 0.5;
    }
  }
  
  return result;
}

/**
 * Improved 2D Perlin noise implementation
 */
function perlinNoise2D(x: number, y: number, seed: string): number {
  const random = createSeededRandom(seed);
  
  // Get grid cell coordinates
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;
  
  // Get fractional part
  const sx = x - x0;
  const sy = y - y0;
  
  // Interpolate between grid point gradients
  const n0 = dotGridGradient(x0, y0, x, y, seed);
  const n1 = dotGridGradient(x1, y0, x, y, seed);
  const ix0 = lerp(n0, n1, fade(sx));
  
  const n2 = dotGridGradient(x0, y1, x, y, seed);
  const n3 = dotGridGradient(x1, y1, x, y, seed);
  const ix1 = lerp(n2, n3, fade(sx));
  
  return lerp(ix0, ix1, fade(sy));
}

function dotGridGradient(ix: number, iy: number, x: number, y: number, seed: string): number {
  const random = createSeededRandom(seed + ix + "," + iy);
  
  // Create pseudorandom gradient vector
  const angle = random.random() * Math.PI * 2;
  const gradX = Math.cos(angle);
  const gradY = Math.sin(angle);
  
  // Compute the distance vector
  const dx = x - ix;
  const dy = y - iy;
  
  // Compute the dot-product
  return dx * gradX + dy * gradY;
}

function fade(t: number): number {
  // Improved smoothstep function: 6t^5 - 15t^4 + 10t^3
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Determines the biome type based on elevation, temperature, and moisture
 */
function determineBiome(
  elevation: number,
  temperature: number,
  moisture: number,
  latitudeFactor: number
): BiomeType {
  // Ocean and lakes (handled separately)
  if (elevation < 0.3) {
    return "ocean";
  }
  
  // Mountains and highlands
  if (elevation > 0.8) {
    if (temperature < 0.2 || latitudeFactor > 0.7) {
      return "tundra";
    }
    if (temperature > 0.7 && latitudeFactor < 0.3) {
      return "volcanic";
    }
    return "mountains";
  }
  
  // High elevation areas
  if (elevation > 0.6) {
    if (temperature < 0.3 || latitudeFactor > 0.6) {
      return "highlands";
    }
    if (temperature > 0.7 && moisture < 0.3 && latitudeFactor < 0.4) {
      return "wasteland";
    }
    return "mountains";
  }
  
  // Medium to low elevation areas
  
  // Cold regions (poles)
  if (temperature < 0.2 || latitudeFactor > 0.8) {
    return "tundra";
  }
  
  // Hot regions (equator)
  if (temperature > 0.8 && latitudeFactor < 0.3) {
    if (moisture < 0.3) {
      return "desert";
    }
    if (moisture > 0.6) {
      return "jungle";
    }
    return "wasteland";
  }
  
  // Temperate regions
  if (moisture < 0.3) {
    if (temperature > 0.6) {
      return "desert";
    }
    return "plains";
  }
  
  if (moisture > 0.7) {
    if (elevation < 0.4) {
      return "swamp";
    }
    if (temperature > 0.6) {
      return "jungle";
    }
    return "forest";
  }
  
  // Default biome
  if (moisture > 0.5) {
    return "forest";
  }
  
  return "plains";
}

/**
 * Determines the weather type based on temperature and moisture
 */
function determineWeather(
  temperature: number,
  moisture: number,
  random: ReturnType<typeof createSeededRandom>
): WeatherType {
  // Base probabilities
  const clearProb = 0.6;
  const cloudyProb = 0.2;
  
  // Adjust for temperature and moisture
  let rainProb = moisture * 0.3;
  let snowProb = (1 - temperature) * 0.3;
  let stormProb = moisture * temperature * 0.2;
  let fogProb = moisture * (1 - temperature) * 0.2;
  let heatwaveProb = temperature > 0.8 ? 0.2 : 0;
  let sandstormProb = temperature > 0.7 && moisture < 0.3 ? 0.2 : 0;
  
  // Normalize probabilities
  const total = clearProb + cloudyProb + rainProb + snowProb + stormProb + fogProb + heatwaveProb + sandstormProb;
  
  const normalizedClearProb = clearProb / total;
  const normalizedCloudyProb = cloudyProb / total;
  const normalizedRainProb = rainProb / total;
  const normalizedSnowProb = snowProb / total;
  const normalizedStormProb = stormProb / total;
  const normalizedFogProb = fogProb / total;
  const normalizedHeatwaveProb = heatwaveProb / total;
  const normalizedSandstormProb = sandstormProb / total;
  
  // Choose weather based on probabilities
  const roll = random.random();
  
  if (roll < normalizedClearProb) {
    return "clear";
  } else if (roll < normalizedClearProb + normalizedCloudyProb) {
    return "cloudy";
  } else if (roll < normalizedClearProb + normalizedCloudyProb + normalizedRainProb) {
    return "rain";
  } else if (roll < normalizedClearProb + normalizedCloudyProb + normalizedRainProb + normalizedSnowProb) {
    return "snow";
  } else if (roll < normalizedClearProb + normalizedCloudyProb + normalizedRainProb + normalizedSnowProb + normalizedStormProb) {
    return "storm";
  } else if (roll < normalizedClearProb + normalizedCloudyProb + normalizedRainProb + normalizedSnowProb + normalizedStormProb + normalizedFogProb) {
    return "fog";
  } else if (roll < normalizedClearProb + normalizedCloudyProb + normalizedRainProb + normalizedSnowProb + normalizedStormProb + normalizedFogProb + normalizedHeatwaveProb) {
    return "heatwave";
  } else {
    return "sandstorm";
  }
}

/**
 * Returns a difficulty factor based on biome type
 */
function getBiomeDifficultyFactor(biome: BiomeType): number {
  switch (biome) {
    case "desert":
    case "volcanic":
    case "wasteland":
      return 2;
    case "mountains":
    case "jungle":
    case "swamp":
      return 1.5;
    case "tundra":
    case "highlands":
      return 1;
    case "forest":
      return 0.5;
    case "plains":
    case "beach":
      return 0;
    case "ocean":
    case "river":
    case "lake":
      return -0.5;
    case "lavaFields":
    case "marsh":
      return 1.5;
    default:
      return 0;
  }
}

/**
 * Generate lakes in appropriate locations
 */
function generateLakes(
  grid: (MapTile | null)[][],
  random: ReturnType<typeof createSeededRandom>,
  startX: number,
  startY: number,
  worldId: string
) {
  const height = grid.length;
  const width = grid[0].length;
  
  // Find potential lake locations (low elevation areas)
  const potentialLakeLocations: { x: number, y: number }[] = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tile = grid[y][x];
      if (tile && tile.elevation < 40 && tile.elevation > 30 && tile.biome !== "ocean") {
        // Check if this is a local minimum
        let isLocalMinimum = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const neighbor = grid[y + dy]?.[x + dx];
            if (neighbor && neighbor.elevation < tile.elevation) {
              isLocalMinimum = false;
              break;
            }
          }
          if (!isLocalMinimum) break;
        }
        
        if (isLocalMinimum) {
          potentialLakeLocations.push({ x, y });
        }
      }
    }
  }
  
  // Create lakes at some of the potential locations
  const numLakes = Math.min(
    potentialLakeLocations.length,
    Math.max(1, Math.floor(width * height / 500))
  );
  
  for (let i = 0; i < numLakes; i++) {
    const lakeIndex = random.randomInt(0, potentialLakeLocations.length - 1);
    const lakeCenter = potentialLakeLocations[lakeIndex];
    potentialLakeLocations.splice(lakeIndex, 1);
    
    const lakeSize = random.randomInt(3, 8);
    
    // Create the lake
    for (let dy = -lakeSize; dy <= lakeSize; dy++) {
      for (let dx = -lakeSize; dx <= lakeSize; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= lakeSize) {
          const y = lakeCenter.y + dy;
          const x = lakeCenter.x + dx;
          
          if (y >= 0 && y < height && x >= 0 && x < width) {
            const tile = grid[y][x];
            if (tile && tile.biome !== "ocean") {
              // Convert to lake
              tile.biome = "lake";
              tile.type = "lake"; // For compatibility
              tile.isLake = true;
              tile.description = generateTileDescription("lake", tile.weather, tile.difficulty);
            }
          }
        }
      }
    }
  }
}

/**
 * Generate rivers flowing from high to low elevation
 */
function generateRivers(
  grid: (MapTile | null)[][],
  random: ReturnType<typeof createSeededRandom>,
  startX: number,
  startY: number,
  worldId: string
) {
  const height = grid.length;
  const width = grid[0].length;
  
  // Find potential river sources (high elevation tiles with river candidate flag)
  const riverSources: { x: number, y: number }[] = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y][x];
      if (tile && tile.hasRiver && tile.elevation > 60) {
        riverSources.push({ x, y });
      }
    }
  }
  
  // Limit the number of rivers
  const maxRivers = Math.min(
    riverSources.length,
    Math.max(1, Math.floor(width * height / 400))
  );
  
  // Shuffle and select river sources
  for (let i = 0; i < maxRivers; i++) {
    const sourceIndex = random.randomInt(0, riverSources.length - 1);
    const source = riverSources[sourceIndex];
    riverSources.splice(sourceIndex, 1);
    
    // Start flowing the river from the source
    let currentX = source.x;
    let currentY = source.y;
    let currentTile = grid[currentY][currentX];
    
    if (!currentTile) continue;
    
    // Mark as river
    currentTile.biome = "river";
    currentTile.type = "river"; // For compatibility
    currentTile.hasRiver = true;
    currentTile.description = generateTileDescription("river", currentTile.weather, currentTile.difficulty);
    
    // Continue flowing until reaching a lake, ocean, or another river
    let flowLength = 0;
    const maxFlowLength = 100; // Prevent infinite loops
    
    while (flowLength < maxFlowLength) {
      // Find the lowest neighboring tile
      let lowestElevation = currentTile ? currentTile.elevation : Infinity;
      let nextX = currentX;
      let nextY = currentY;
      let foundLower = false;
      
      // Add some randomness to river flow
      const directions = [
        { dx: 0, dy: -1 }, // North
        { dx: 1, dy: 0 },  // East
        { dx: 0, dy: 1 },  // South
        { dx: -1, dy: 0 }, // West
        { dx: 1, dy: -1 }, // Northeast
        { dx: 1, dy: 1 },  // Southeast
        { dx: -1, dy: 1 }, // Southwest
        { dx: -1, dy: -1 } // Northwest
      ];
      
      // Shuffle directions for more natural flow
      for (let i = directions.length - 1; i > 0; i--) {
        const j = random.randomInt(0, i);
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      for (const { dx, dy } of directions) {
        const nx = currentX + dx;
        const ny = currentY + dy;
        
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          const neighbor = grid[ny][nx];
          
          if (neighbor) {
            // If we find water, flow into it and end
            if (neighbor.biome === "ocean" || neighbor.biome === "lake" || neighbor.biome === "river") {
              nextX = nx;
              nextY = ny;
              foundLower = true;
              break;
            }
            
            // Otherwise, find the lowest elevation
            if (neighbor.elevation < lowestElevation) {
              lowestElevation = neighbor.elevation;
              nextX = nx;
              nextY = ny;
              foundLower = true;
            }
          }
        }
      }
      
      // If we can't flow anywhere, end the river
      if (!foundLower || (nextX === currentX && nextY === currentY)) {
        // Create a small lake at the end if we're not already at water
        const endTile = grid[currentY][currentX];
        if (endTile && endTile.biome !== "ocean" && endTile.biome !== "lake") {
          endTile.biome = "lake";
          endTile.type = "lake"; // For compatibility
          endTile.isLake = true;
          endTile.description = generateTileDescription("lake", endTile.weather, endTile.difficulty);
        }
        break;
      }
      
      // Move to the next tile
      currentX = nextX;
      currentY = nextY;
      currentTile = grid[currentY][currentX];
      
      // If we've reached water, end the river
      if (currentTile && (currentTile.biome === "ocean" || currentTile.biome === "lake" || currentTile.biome === "river")) {
        break;
      }
      
      // Mark as river
      if (currentTile) {
        currentTile.biome = "river";
        currentTile.type = "river"; // For compatibility
        currentTile.hasRiver = true;
        currentTile.description = generateTileDescription("river", currentTile.weather, currentTile.difficulty);
      }
      
      flowLength++;
    }
  }
}

/**
 * Adjust biomes based on water proximity (create beaches and marshes)
 */
function adjustBiomesNearWater(
  grid: (MapTile | null)[][],
  startX: number,
  startY: number
) {
  const height = grid.length;
  const width = grid[0].length;
  
  // First pass: identify water-adjacent tiles
  const waterAdjacentTiles: { x: number, y: number }[] = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y][x];
      
      if (!tile || tile.biome === "ocean" || tile.biome === "lake" || tile.biome === "river") {
        continue;
      }
      
      // Check if adjacent to water
      let adjacentToWater = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const neighbor = grid[ny][nx];
            if (neighbor && (neighbor.biome === "ocean" || neighbor.biome === "lake")) {
              adjacentToWater = true;
              break;
            }
          }
        }
        if (adjacentToWater) break;
      }
      
      if (adjacentToWater) {
        waterAdjacentTiles.push({ x, y });
      }
    }
  }
  
  // Second pass: convert appropriate tiles to beaches or marshes
  for (const { x, y } of waterAdjacentTiles) {
    const tile = grid[y][x];
    
    if (!tile) continue;
    
    // Convert to beach if elevation is low and not already a special biome
    if (
      tile.elevation < 40 && 
      (tile.biome === "plains" || tile.biome === "desert")
    ) {
      tile.biome = "beach";
      tile.type = "beach"; // For compatibility
      tile.description = generateTileDescription("beach", tile.weather, tile.difficulty);
    }
    // Convert to marsh if elevation is low and in a wet area
    else if (
      tile.elevation < 35 && 
      (tile.biome === "plains" || tile.biome === "forest" || tile.biome === "swamp")
    ) {
      tile.biome = "marsh";
      tile.type = "marsh"; // For compatibility
      tile.description = generateTileDescription("marsh", tile.weather, tile.difficulty);
    }
  }
}

/**
 * Generate adventure options for each tile
 */
function generateAdventureOptions(
  grid: (MapTile | null)[][],
  startX: number,
  startY: number
) {
  const height = grid.length;
  const width = grid[0].length;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y][x];
      
      if (!tile) continue;
      
      // Generate options for each direction
      const options: AdventureOption[] = [];
      
      // North
      if (y > 0 && grid[y-1][x]) {
        const northTile = grid[y-1][x]!;
        options.push({
          text: generateDirectionOption("north", northTile),
          direction: "north",
          result: generateDirectionResult("north", northTile),
          dangerLevel: calculateDangerLevel(northTile)
        });
      }
      
      // East
      if (x < width - 1 && grid[y][x+1]) {
        const eastTile = grid[y][x+1]!;
        options.push({
          text: generateDirectionOption("east", eastTile),
          direction: "east",
          result: generateDirectionResult("east", eastTile),
          dangerLevel: calculateDangerLevel(eastTile)
        });
      }
      
      // South
      if (y < height - 1 && grid[y+1][x]) {
        const southTile = grid[y+1][x]!;
        options.push({
          text: generateDirectionOption("south", southTile),
          direction: "south",
          result: generateDirectionResult("south", southTile),
          dangerLevel: calculateDangerLevel(southTile)
        });
      }
      
      // West
      if (x > 0 && grid[y][x-1]) {
        const westTile = grid[y][x-1]!;
        options.push({
          text: generateDirectionOption("west", westTile),
          direction: "west",
          result: generateDirectionResult("west", westTile),
          dangerLevel: calculateDangerLevel(westTile)
        });
      }
      
      tile.options = options;
    }
  }
}

/**
 * Generate a description for a tile based on its biome and weather
 */
function generateTileDescription(biome: BiomeType, weather: WeatherType, difficulty: number): string {
  const biomeDescriptions: Record<BiomeType, string[]> = {
    plains: [
      "Rolling grasslands stretch out before you, with occasional wildflowers dotting the landscape.",
      "A vast expanse of open grassland with gentle hills in the distance.",
      "Tall grasses sway in the breeze across these open plains."
    ],
    forest: [
      "Towering trees form a dense canopy overhead, dappling the forest floor with patches of light.",
      "A serene forest with ancient trees and a carpet of fallen leaves.",
      "The forest is alive with the sounds of birds and rustling leaves."
    ],
    desert: [
      "An endless sea of sand dunes stretches to the horizon, shimmering in the heat.",
      "Barren wasteland with scattered rock formations and little vegetation.",
      "The desert's harsh landscape is punctuated by the occasional hardy shrub."
    ],
    mountains: [
      "Jagged peaks rise majestically against the sky, their slopes covered in snow.",
      "Rocky terrain rises steeply, with narrow paths winding between the crags.",
      "The mountain air is thin but crisp, offering breathtaking views of the lands below."
    ],
    swamp: [
      "Murky waters and twisted trees create a foreboding atmosphere in this fetid swamp.",
      "The swamp is thick with humidity, strange sounds emanating from its depths.",
      "Moss-covered trees rise from the stagnant waters of this eerie swamp."
    ],
    tundra: [
      "A vast, frozen plain stretches before you, with only sparse vegetation surviving the cold.",
      "The frozen landscape is beautiful but unforgiving, with a biting wind that cuts to the bone.",
      "Patches of snow and ice cover the ground in this frigid tundra."
    ],
    volcanic: [
      "The ground is black and cracked, with steam venting from fissures in the earth.",
      "Rivers of molten lava flow slowly across the scorched landscape.",
      "The air is thick with sulfur and ash in this hellish volcanic region."
    ],
    jungle: [
      "Dense, lush vegetation surrounds you, with exotic flowers and vines hanging from towering trees.",
      "The jungle is hot and humid, alive with the calls of countless creatures.",
      "Thick undergrowth makes progress difficult in this vibrant, teeming jungle."
    ],
    ocean: [
      "Endless blue waters stretch to the horizon, with waves gently lapping at the shore.",
      "The vast ocean extends as far as the eye can see, its depths hiding countless mysteries.",
      "The deep blue sea stretches out before you, its surface glittering in the light."
    ],
    lavaFields: [
      "Fields of hardened black rock are broken by glowing rivers of molten lava.",
      "The ground is hot underfoot, with cracks revealing the molten rock flowing beneath.",
      "A hellscape of fire and stone, with lava bubbling up through fissures in the ground."
    ],
    wasteland: [
      "A barren, desolate landscape stretches before you, devoid of almost all life.",
      "The blighted terrain shows signs of some ancient catastrophe that scoured the land.",
      "Little grows in this harsh wasteland, where the very soil seems poisoned."
    ],
    highlands: [
      "Rolling hills rise and fall across the landscape, covered in hardy grasses and shrubs.",
      "The highland air is cool and clear, offering views across the surrounding countryside.",
      "These elevated plains are swept by strong winds, with rocky outcroppings providing the only shelter."
    ],
    beach: [
      "Soft sand stretches along the water's edge, with gentle waves lapping at the shore.",
      "The beach is warm and inviting, with the sound of waves creating a soothing rhythm.",
      "Golden sands meet the water in a long, curving shoreline."
    ],
    marsh: [
      "Shallow waters and reeds dominate this soggy landscape, teeming with life.",
      "The marsh is a maze of waterways and small islands of firmer ground.",
      "Wading birds stalk through the shallow waters of this fertile marsh."
    ],
    river: [
      "A clear river flows swiftly between its banks, the water sparkling in the light.",
      "The river winds its way through the landscape, carving a path through the terrain.",
      "Swift-flowing waters rush over rocks, creating a constant background of sound."
    ],
    lake: [
      "A serene body of water reflects the sky like a mirror, surrounded by gentle shores.",
      "The lake's still waters are occasionally disturbed by fish breaking the surface.",
      "This large lake stretches into the distance, its far shore barely visible."
    ]
  };
  
  const weatherEffects: Record<WeatherType, string> = {
    clear: "The sky is clear and blue, with the sun shining brightly.",
    cloudy: "Gray clouds hang low in the sky, casting everything in a muted light.",
    rain: "Rain falls steadily, creating puddles and making the ground slick.",
    storm: "Lightning flashes across the dark sky as thunder rumbles ominously.",
    snow: "Snowflakes drift gently from the sky, covering everything in a blanket of white.",
    fog: "A thick fog limits visibility, giving the surroundings an eerie, muffled quality.",
    heatwave: "The air shimmers with intense heat, making even breathing an effort.",
    sandstorm: "Sand and dust fill the air, stinging your eyes and making it difficult to see."
  };
  
  const dangerHints: string[] = [
    "The area seems relatively safe.",
    "You sense no immediate danger here.",
    "There might be hidden dangers lurking nearby.",
    "You feel uneasy, as if being watched.",
    "This place feels dangerous, with signs of hostile creatures.",
    "The area is clearly perilous, with obvious signs of deadly threats."
  ];
  
  // Select a random biome description
  const biomeIndex = Math.floor(Math.random() * biomeDescriptions[biome].length);
  const biomeDesc = biomeDescriptions[biome][biomeIndex];
  
  // Get weather effect
  const weatherDesc = weatherEffects[weather];
  
  // Get danger hint based on difficulty
  const dangerIndex = Math.min(5, Math.floor(difficulty / 2));
  const dangerDesc = dangerHints[dangerIndex];
  
  // Add some narrative elements based on biome and difficulty
  let narrativeElement = "";
  if (difficulty > 7) {
    narrativeElement = " You notice signs of recent conflict or danger - perhaps tracks, broken equipment, or even bloodstains.";
  } else if (difficulty > 4) {
    narrativeElement = " There are signs that others have passed this way before, though whether they survived is unclear.";
  } else if (biome === "forest" || biome === "jungle") {
    narrativeElement = " The trees seem to whisper ancient secrets as the wind passes through their branches.";
  } else if (biome === "desert" || biome === "wasteland") {
    narrativeElement = " The harsh environment makes you appreciate the water in your waterskin all the more.";
  } else if (biome === "mountains" || biome === "highlands") {
    narrativeElement = " From this vantage point, you can see far across the landscape, hinting at adventures yet to come.";
  } else if (biome === "beach" || biome === "ocean") {
    narrativeElement = " The rhythmic sound of waves brings a sense of peace, despite the dangers that may lurk nearby.";
  } else if (biome === "river" || biome === "lake") {
    narrativeElement = " The water looks refreshing, and you consider whether it's safe to drink or if creatures might be lurking beneath the surface.";
  }
  
  // Combine descriptions
  return `${biomeDesc} ${weatherDesc}${narrativeElement} ${dangerDesc}`;
}

/**
 * Generate text for a direction option
 */
function generateDirectionOption(direction: string, tile: MapTile): string {
  const directionDescriptions: Record<string, string[]> = {
    north: [
      "Head north toward",
      "Journey northward to",
      "Travel north into"
    ],
    east: [
      "Go east toward",
      "Head eastward to",
      "Travel east into"
    ],
    south: [
      "Move south toward",
      "Journey southward to",
      "Travel south into"
    ],
    west: [
      "Go west toward",
      "Head westward to",
      "Travel west into"
    ]
  };
  
  const biomeNames: Record<BiomeType, string[]> = {
    plains: ["the grasslands", "the open plains", "the meadows"],
    forest: ["the forest", "the woods", "the dense trees"],
    desert: ["the desert", "the sand dunes", "the arid wasteland"],
    mountains: ["the mountains", "the peaks", "the rocky heights"],
    swamp: ["the swamp", "the marshland", "the boggy terrain"],
    tundra: ["the frozen tundra", "the icy plains", "the snow-covered land"],
    volcanic: ["the volcanic region", "the lava fields", "the scorched earth"],
    jungle: ["the jungle", "the dense rainforest", "the tropical growth"],
    ocean: ["the ocean", "the sea", "the deep waters"],
    lavaFields: ["the lava fields", "the molten landscape", "the fiery terrain"],
    wasteland: ["the wasteland", "the blighted land", "the desolate region"],
    highlands: ["the highlands", "the high country", "the elevated plains"],
    beach: ["the beach", "the sandy shore", "the coastline"],
    marsh: ["the marsh", "the wetlands", "the reed beds"],
    river: ["the river", "the flowing water", "the riverbank"],
    lake: ["the lake", "the still waters", "the lakeside"]
  };
  
  // Select random descriptions
  const dirIndex = Math.floor(Math.random() * directionDescriptions[direction].length);
  const biomeIndex = Math.floor(Math.random() * biomeNames[tile.biome].length);
  
  const dirDesc = directionDescriptions[direction][dirIndex];
  const biomeDesc = biomeNames[tile.biome][biomeIndex];
  
  // Add special features if present
  let specialFeature = "";
  if (tile.hasTown) {
    if (tile.town && tile.town.lastVisited) {
      specialFeature = ` where the town of ${tile.town.name} lies`;
    } else {
      specialFeature = " where you can see a settlement";
    }
  } else if (tile.hasPortal) {
    specialFeature = " where a strange portal glimmers";
  } else if (tile.hasPath) {
    specialFeature = " following a path";
  }
  
  return `${dirDesc} ${biomeDesc}${specialFeature}.`;
}

/**
 * Generate result text for moving in a direction
 */
function generateDirectionResult(direction: string, tile: MapTile): string {
  const moveDescriptions: Record<string, string[]> = {
    north: [
      "You travel north",
      "Heading northward",
      "Moving north"
    ],
    east: [
      "You journey east",
      "Traveling eastward",
      "Moving east"
    ],
    south: [
      "You head south",
      "Journeying southward",
      "Moving south"
    ],
    west: [
      "You travel west",
      "Heading westward",
      "Moving west"
    ]
  };
  
  // Select a random move description
  const moveIndex = Math.floor(Math.random() * moveDescriptions[direction].length);
  const moveDesc = moveDescriptions[direction][moveIndex];
  
  return `${moveDesc}, you arrive at a new location. ${tile.description}`;
}

/**
 * Calculate danger level for a tile
 */
function calculateDangerLevel(tile: MapTile): number {
  // Base danger on tile difficulty
  let danger = tile.difficulty;
  
  // Adjust based on biome
  if (tile.biome === "volcanic" || tile.biome === "lavaFields") {
    danger += 2;
  } else if (tile.biome === "mountains" || tile.biome === "jungle" || tile.biome === "wasteland") {
    danger += 1;
  } else if (tile.biome === "beach" || tile.biome === "plains") {
    danger -= 1;
  }
  
  // Adjust based on weather
  if (tile.weather === "storm" || tile.weather === "sandstorm") {
    danger += 2;
  } else if (tile.weather === "heatwave" || tile.weather === "snow") {
    danger += 1;
  }
  
  // Towns are safer
  if (tile.hasTown) {
    danger = Math.max(1, danger - 3);
  }
  
  // Ensure danger is within bounds
  return Math.max(1, Math.min(10, danger));
}

/**
 * Generate paths between towns
 */
export function generatePathsBetweenTowns(
  world: World,
  towns: Town[],
  tiles: MapTile[]
): MapTile[] {
  // Create a grid for easier tile access
  const grid: Record<string, MapTile> = {};
  tiles.forEach(tile => {
    grid[`${tile.x},${tile.y}`] = tile;
  });
  
  // For each town, connect to nearest towns
  towns.forEach(town => {
    // Find nearest towns to connect to
    const nearbyTowns = findNearbyTowns(town, towns);
    
    // Connect this town to each nearby town
    nearbyTowns.forEach(nearbyTown => {
      connectTownsWithPath(town, nearbyTown, grid, world.seed);
    });
  });
  
  // Return the updated tiles
  return Object.values(grid);
}

/**
 * Find nearby towns to connect with paths
 */
function findNearbyTowns(town: Town, allTowns: Town[]): Town[] {
  // Calculate distances to all other towns
  const townsWithDistances = allTowns
    .filter(t => t.id !== town.id)
    .map(t => ({
      town: t,
      distance: Math.sqrt(
        Math.pow(t.position.x - town.position.x, 2) +
        Math.pow(t.position.y - town.position.y, 2)
      )
    }))
    .sort((a, b) => a.distance - b.distance);
  
  // Connect to 1-3 nearest towns
  const numConnections = Math.min(3, townsWithDistances.length);
  return townsWithDistances.slice(0, numConnections).map(t => t.town);
}

/**
 * Connect two towns with a path
 */
function connectTownsWithPath(
  town1: Town,
  town2: Town,
  grid: Record<string, MapTile>,
  seed: string
) {
  const random = createSeededRandom(seed + town1.id + town2.id);
  
  // Determine path type
  const pathType: PathType = random.randomBool(0.7) ? "dirt" : "paved";
  
  // Use A* pathfinding with some randomness for natural-looking paths
  const path = findPath(
    town1.position,
    town2.position,
    grid,
    random,
    pathType === "dirt" // Add more randomness for dirt paths
  );
  
  // Mark the path on the tiles
  path.forEach(pos => {
    const key = `${pos.x},${pos.y}`;
    if (grid[key]) {
      grid[key].hasPath = true;
      grid[key].pathType = pathType;
    }
  });
}

/**
 * Find a path between two points using A* algorithm with randomness
 */
function findPath(
  start: { x: number, y: number },
  end: { x: number, y: number },
  grid: Record<string, MapTile>,
  random: ReturnType<typeof createSeededRandom>,
  addRandomness: boolean
): { x: number, y: number }[] {
  // A* implementation with randomness factor
  const openSet: { x: number, y: number, f: number, g: number, parent: { x: number, y: number } | null }[] = [];
  const closedSet = new Set<string>();
  
  // Start with the starting position
  openSet.push({
    x: start.x,
    y: start.y,
    f: heuristic(start, end),
    g: 0,
    parent: null
  });
  
  while (openSet.length > 0) {
    // Find the node with the lowest f score
    let lowestIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    
    const current = openSet[lowestIndex];
    
    // If we've reached the end, reconstruct the path
    if (current.x === end.x && current.y === end.y) {
      const path: { x: number, y: number }[] = [];
      let temp = current;
      path.push({ x: temp.x, y: temp.y });
      
      while (temp.parent) {
        temp = temp.parent as typeof current;
        path.push({ x: temp.x, y: temp.y });
      }
      
      return path.reverse();
    }
    
    // Remove current from openSet and add to closedSet
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Check all neighbors
    const neighbors = getNeighbors(current, grid);
    
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      
      // Skip if already evaluated
      if (closedSet.has(key)) continue;
      
      // Calculate g score (distance from start)
      const tentativeG = current.g + 1;
      
      // Check if this neighbor is already in openSet
      const existingNeighborIndex = openSet.findIndex(n => n.x === neighbor.x && n.y === neighbor.y);
      const existingNeighbor = existingNeighborIndex !== -1 ? openSet[existingNeighborIndex] : null;
      
      if (existingNeighbor && tentativeG >= existingNeighbor.g) {
        // This path is not better
        continue;
      }
      
      // This path is better or neighbor is not in openSet
      const neighborTile = grid[key];
      
      // Calculate movement cost based on terrain
      let terrainCost = 1;
      if (neighborTile) {
        if (neighborTile.biome === "mountains" || neighborTile.biome === "volcanic") {
          terrainCost = 5;
        } else if (neighborTile.biome === "forest" || neighborTile.biome === "jungle" || neighborTile.biome === "swamp") {
          terrainCost = 3;
        } else if (neighborTile.biome === "river") {
          terrainCost = 4; // Rivers are harder to cross
        } else if (neighborTile.biome === "ocean" || neighborTile.biome === "lake") {
          terrainCost = 10; // Avoid water if possible
        }
      }
      
      // Add randomness for more natural-looking paths
      if (addRandomness) {
        terrainCost += random.randomFloat(0, 2);
      }
      
      const g = current.g + terrainCost;
      const h = heuristic(neighbor, end);
      
      // Add randomness to heuristic for more winding paths
      const randomFactor = addRandomness ? random.randomFloat(0, 5) : 0;
      const f = g + h + randomFactor;
      
      if (existingNeighbor) {
        // Update existing neighbor
        existingNeighbor.g = g;
        existingNeighbor.f = f;
        existingNeighbor.parent = current;
      } else {
        // Add new neighbor to openSet
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          f,
          g,
          parent: current
        });
      }
    }
  }
  
  // No path found, return direct line
  const path: { x: number, y: number }[] = [];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(start.x + dx * t);
    const y = Math.round(start.y + dy * t);
    path.push({ x, y });
  }
  
  return path;
}

/**
 * Get valid neighbors for pathfinding
 */
function getNeighbors(
  node: { x: number, y: number },
  grid: Record<string, MapTile>
): { x: number, y: number }[] {
  const neighbors: { x: number, y: number }[] = [];
  
  // Check all 8 directions
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      
      const x = node.x + dx;
      const y = node.y + dy;
      const key = `${x},${y}`;
      
      // Check if this position is valid
      if (grid[key]) {
        neighbors.push({ x, y });
      }
    }
  }
  
  return neighbors;
}

/**
 * Calculate heuristic (estimated distance) between two points
 */
function heuristic(a: { x: number, y: number }, b: { x: number, y: number }): number {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}