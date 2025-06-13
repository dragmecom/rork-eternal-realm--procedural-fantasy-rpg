import { World } from "@/types/game";
import { createSeededRandom } from "./seedGenerator";
import { generateName } from "./nameGenerator";

export function generateWorld(seed: string): World {
  const random = createSeededRandom(seed);
  
  // Generate world name
  const worldName = generateName(random, "world");
  
  // Determine world size (50-100)
  const mapSize = random.randomInt(50, 100);
  
  // Determine world difficulty bias (-0.5 to 0.5)
  const difficultyBias = random.randomFloat(-0.5, 0.5);
  
  // Determine world climate bias (-0.5 to 0.5)
  // Negative = colder, Positive = warmer
  const climateBias = random.randomFloat(-0.5, 0.5);
  
  // Determine world moisture bias (-0.5 to 0.5)
  // Negative = drier, Positive = wetter
  const moistureBias = random.randomFloat(-0.5, 0.5);
  
  // Determine number of towns (5-15 based on map size)
  const numTowns = Math.max(5, Math.floor(mapSize / 10) + random.randomInt(-2, 2));
  
  // Create world object
  const world: World = {
    id: `world-${seed}`,
    name: worldName,
    seed,
    mapSize,
    difficultyBias,
    climateBias,
    moistureBias,
    numTowns,
    createdAt: Date.now()
  };
  
  return world;
}