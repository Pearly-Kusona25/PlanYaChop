import { AIService, RecipeResponse } from '../src/services/aiService';

// Mock AI Service for testing
class MockAIService implements AIService {
  async generateRecipe(ingredients: string[], dietaryRestrictions?: string[]): Promise<RecipeResponse> {
    return {
      title: 'Test Recipe',
      ingredients: ingredients.map(ing => ({ name: ing, quantity: '1', unit: 'cup' })),
      instructions: [
        { id: '1', step: 1, description: 'Mix ingredients' },
        { id: '2', step: 2, description: 'Cook for 20 minutes' }
      ],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: 'easy'
    };
  }

  async getMealPlan(preferences: any): Promise<any> {
    return {
      days: [],
      shoppingList: [],
      estimatedCost: 0
    };
  }

  async analyzeIngredients(ingredients: string[]): Promise<any> {
    return {
      ingredients: [],
      suggestions: [],
      nutritionalInfo: null
    };
  }
}

describe('AI Service', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new MockAIService();
  });

  describe('generateRecipe', () => {
    it('should generate a recipe with given ingredients', async () => {
      const ingredients = ['tomato', 'pasta'];
      const recipe = await aiService.generateRecipe(ingredients);

      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.ingredients).toHaveLength(2);
      expect(recipe.prepTime).toBe(10);
      expect(recipe.cookTime).toBe(20);
      expect(recipe.servings).toBe(4);
      expect(recipe.difficulty).toBe('easy');
    });

    it('should handle dietary restrictions', async () => {
      const ingredients = ['vegetables'];
      const dietaryRestrictions = ['vegetarian'];
      const recipe = await aiService.generateRecipe(ingredients, dietaryRestrictions);

      expect(recipe.title).toBeDefined();
      expect(recipe.ingredients).toBeDefined();
    });
  });

  describe('getMealPlan', () => {
    it('should generate a meal plan', async () => {
      const preferences = {
        days: 7,
        mealsPerDay: 3,
        dietaryRestrictions: []
      };

      const mealPlan = await aiService.getMealPlan(preferences);

      expect(mealPlan).toHaveProperty('days');
      expect(mealPlan).toHaveProperty('shoppingList');
      expect(mealPlan).toHaveProperty('estimatedCost');
    });
  });

  describe('analyzeIngredients', () => {
    it('should analyze ingredients', async () => {
      const ingredients = ['chicken', 'rice'];
      const analysis = await aiService.analyzeIngredients(ingredients);

      expect(analysis).toHaveProperty('ingredients');
      expect(analysis).toHaveProperty('suggestions');
      expect(analysis).toHaveProperty('nutritionalInfo');
    });
  });
});
