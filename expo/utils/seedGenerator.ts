/**
 * Generates a random seed string for game world generation
 */
export function generateSeed(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 16;
  let result = "";
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Creates a seeded random number generator
 * @param seed The seed string
 */
export function createSeededRandom(seed: string) {
  // Simple hash function to convert seed string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Seeded random function
  return {
    /**
     * Returns a random number between 0 (inclusive) and 1 (exclusive)
     */
    random: function() {
      hash = Math.sin(hash) * 10000;
      return hash - Math.floor(hash);
    },
    
    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     */
    randomInt: function(min: number, max: number) {
      return Math.floor(this.random() * (max - min + 1)) + min;
    },
    
    /**
     * Returns a random float between min (inclusive) and max (exclusive)
     */
    randomFloat: function(min: number, max: number) {
      return this.random() * (max - min) + min;
    },
    
    /**
     * Returns a random item from an array
     */
    randomItem: function<T>(array: T[]): T {
      return array[this.randomInt(0, array.length - 1)];
    },
    
    /**
     * Returns a random element from an array (alias for randomItem)
     */
    randomElement: function<T>(array: T[]): T {
      return this.randomItem(array);
    },
    
    /**
     * Returns a random boolean with the given probability
     * @param probability Probability of returning true (0-1)
     */
    randomBool: function(probability = 0.5) {
      return this.random() < probability;
    },
  };
}