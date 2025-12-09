import { GoogleGenAI, Type } from "@google/genai";
import { MathSolution, QuizQuestion, GradingResult } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

// System prompt to enforce the behavior of the backend system described
const SOLVER_SYSTEM_vx = `
You are an advanced Deep Learning Math OCR and Solver system.
Your goal is to act as the backend pipeline which includes:
1. OCR: Extract mathematical LaTeX from the image.
2. Normalization: Clean up the LaTeX.
3. Parsing: Identify the type of problem (Algebra, Calculus, Matrix, etc.).
4. Solving: Provide a step-by-step solution using symbolic logic.

Output a strict JSON object with the following schema:
{
  "originalLatex": "The raw LaTeX extracted from the image",
  "cleanedLatex": "The normalized LaTeX",
  "problemType": "Category of the problem (e.g., Differential Equation, Linear Algebra)",
  "steps": [
    { "latex": "Step 1 math", "explanation": "Explanation of the operation (e.g., 'Apply Chain Rule')", "rule": "Name of rule used" }
  ],
  "finalAnswer": "The final result in LaTeX",
  "confidence": 0.99
}
Ensure all math is in valid LaTeX format without markdown code blocks around the latex strings themselves.
`;

export const solveMathProblem = async (base64Image: string, mimeType: string): Promise<MathSolution> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this image. Extract the math problem and solve it step-by-step."
          }
        ]
      },
      config: {
        systemInstruction: SOLVER_SYSTEM_vx,
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MathSolution;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const PRACTICE_SYSTEM_vx = `
You are a math tutor. Generate a random math practice problem.
Output JSON:
{
  "id": "unique_id",
  "latex": "The problem in LaTeX",
  "difficulty": "Easy | Medium | Hard",
  "topic": "Topic Name"
}
`;

export const generatePracticeQuestion = async (difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<QuizQuestion> => {
  let difficultyPrompt = "";
  switch (difficulty) {
    case 'Easy':
      difficultyPrompt = "Generate a random simple algebra math practice problem suitable for beginners (e.g., linear equations, basic factorization, simple arithmetic).";
      break;
    case 'Hard':
      difficultyPrompt = "Generate a challenging random math practice problem suitable for advanced college level (e.g., Differential Equations, Complex Integrals, Eigenvalues/Eigenvectors, Multivariable Calculus).";
      break;
    case 'Medium':
    default:
      difficultyPrompt = "Generate a random math practice problem suitable for high school or early college level (e.g., Calculus limits/derivatives, quadratic equations, basic matrices).";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: difficultyPrompt,
      config: {
        systemInstruction: PRACTICE_SYSTEM_vx,
        responseMimeType: "application/json",
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion;
    }
    throw new Error("Failed to generate question");
  } catch (error) {
    console.error("Gemini Gen Error:", error);
    throw error;
  }
};

export const gradeAnswer = async (
  questionLatex: string, 
  userAnswerText: string,
  userAnswerImage?: string,
  mimeType?: string
): Promise<GradingResult> => {
  try {
    const promptText = `
      Question: ${questionLatex}
      ${userAnswerText ? `User Text Answer: ${userAnswerText}` : ''}
      ${userAnswerImage ? 'User has also uploaded an image of their solution steps. Analyze the handwriting to evaluate their process.' : ''}
      
      Task:
      1. Verify if the user's answer is mathematically correct based on the question.
      2. If an image is provided, check the steps for logical correctness.
      3. Assign a score out of 10 based on correctness and step quality.
      
      Return JSON:
      {
        "isCorrect": boolean,
        "score": number, // 0 to 10
        "feedback": "Brief explanation of the grade and any errors found.",
        "correctSolution": "The correct solution in LaTeX. IMPORTANT: Use the 'aligned' environment (e.g., \\begin{aligned} ... \\end{aligned}) and use double backslashes (\\\\) to explicitly separate every single step onto a new line for clarity."
      }
    `;

    const parts: any[] = [{ text: promptText }];
    
    if (userAnswerImage && mimeType) {
      parts.unshift({
        inlineData: {
          mimeType: mimeType,
          data: userAnswerImage
        }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GradingResult;
    }
    throw new Error("Failed to grade");
  } catch (error) {
    console.error("Gemini Grade Error:", error);
    throw error;
  }
};
