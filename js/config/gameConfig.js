export const ROUND_TIME_SECONDS = 60;

export const LAYER_WIDTH = 220;
export const LAYER_HEIGHT = 48;
export const CELEBRATION_VIEWPORT_SIZE = 240;

export const SCORING_V2_CONFIG = {
  recipePassThreshold: 0.84,
  totalPassThreshold: 0.72,
  weights: {
    recipeScore: 0.38,
    alignmentScore: 0.16,
    stabilityScore: 0.16,
    materialScore: 0.14,
    presentationScore: 0.08,
    timeScore: 0.08
  },
  recipe: {
    exactOrderWeight: 0.7,
    ingredientSetWeight: 0.3,
    lengthPenaltyPerLayer: 0.12
  }
};

export const DEV_FLAGS = {
  debugOverlay: false
};
