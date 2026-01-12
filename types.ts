
export enum CognitiveLevel {
  RECOGNITION = "기억",
  UNDERSTANDING = "이해",
  APPLICATION = "적용",
  ANALYSIS = "분석",
  EVALUATION = "평가",
  CREATION = "창의"
}

export enum QuestionType {
  MULTIPLE_CHOICE = "객관식",
  SHORT_ANSWER = "단답형",
  DESCRIPTIVE = "서술형",
  PROBLEM_SOLVING = "문제해결",
  EXPLORATION = "탐구형"
}

export enum Difficulty {
  LOW = "하",
  MEDIUM = "중",
  HIGH = "상"
}

export interface Question {
  id: string;
  subject: string;
  grade: number;
  achievement: string;
  cognitive_level: string;
  difficulty: string;
  type: string;
  question: string;
  explanation?: string;
  answer_key?: string; // Correct answer for validation
  user_answer?: string;
  status?: 'correct' | 'incorrect' | 'pending';
  timestamp: number;
}

export interface UserStats {
  score: number;
  correctCount: number;
  totalAttempted: number;
  streak: number;
  maxStreak: number;
  level: number;
  exp: number;
}
