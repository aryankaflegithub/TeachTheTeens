export type AppMode = 'solver' | 'practice';

export type ProcessingStage = 'idle' | 'preprocessing' | 'ocr' | 'parsing' | 'solving' | 'complete' | 'error';

export interface Step {
  latex: string;
  explanation: string;
  rule?: string; // e.g., "Chain Rule", "Determinant Expansion"
}

export interface MathSolution {
  originalLatex: string;
  cleanedLatex: string;
  problemType: string;
  steps: Step[];
  finalAnswer: string;
  confidence: number;
}

export interface QuizQuestion {
  id: string;
  latex: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

export interface GradingResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctSolution: string;
}
