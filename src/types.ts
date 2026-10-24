/**
 * EduGrade Data Models & Types
 */

export type MultipleChoiceOption = 'A' | 'B' | 'C' | 'D';
export type TrueFalseOption = 'Đ' | 'S';

export type AIModelId = 'gemini-3-flash-preview' | 'gemini-3-pro-preview' | 'gemini-2.5-flash';

export interface AIModelOption {
  id: AIModelId;
  name: string;
  badge: string;
  description: string;
  speed: string;
  accuracy: string;
  recommended?: boolean;
}

export interface Part1QuestionConfig {
  questionNumber: number;
  correctAnswer: MultipleChoiceOption;
}

export interface Part2StatementConfig {
  id: 'a' | 'b' | 'c' | 'd';
  correctAnswer: TrueFalseOption;
}

export interface Part2QuestionConfig {
  questionNumber: number;
  statements: Part2StatementConfig[];
}

export interface ExamKeyConfig {
  id: string;
  code: string; // e.g. "101", "102"
  title: string;
  subject: string;
  createdAt: string;
  part1: Part1QuestionConfig[];
  part2: Part2QuestionConfig[];
  scoringConfig: {
    part1ScorePerQuestion: number; // e.g. 0.25
    part2ScoreMethod: 'subitem' | 'vietnam_standard'; // subitem: 0.25 each, or standard MoET (1 correct: 0.1, 2: 0.25, 3: 0.5, 4: 1.0)
    maxScore: number;
  };
}

export interface Part1ResultItem {
  questionNumber: number;
  studentAnswer: MultipleChoiceOption | 'BLANK' | 'INVALID';
  correctAnswer: MultipleChoiceOption;
  isCorrect: boolean;
  score: number;
}

export interface Part2StatementResult {
  id: 'a' | 'b' | 'c' | 'd';
  studentAnswer: TrueFalseOption | 'BLANK' | 'INVALID';
  correctAnswer: TrueFalseOption;
  isCorrect: boolean;
}

export interface Part2ResultItem {
  questionNumber: number;
  statements: Part2StatementResult[];
  correctCount: number; // 0 to 4
  totalCount: number; // usually 4
  score: number;
}

export interface AIFeedbackResult {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  practiceTips: string[];
}

export interface GradingResult {
  id: string;
  timestamp: number;
  studentName: string;
  studentId: string;
  examCode: string;
  matchedExamTitle: string;
  imagePreviewUrl: string;

  // Overview stats (Requirement 4)
  totalScore: number;
  maxScore: number;
  
  // Total overall
  totalQuestions: number;
  totalCorrectQuestions: number; // Overall items correct

  // Part 1 Breakdown
  part1Total: number;
  part1Correct: number;
  part1Score: number;
  part1Details: Part1ResultItem[];

  // Part 2 Breakdown (Specifically requested in Requirement 4: "Thống kê chi tiết riêng phần Đúng/Sai")
  part2QuestionsCount: number;
  part2TotalStatements: number;
  part2CorrectStatements: number;
  part2Score: number;
  part2Details: Part2ResultItem[];

  notes?: string;
  detectionConfidence?: number;
  aiFeedback?: AIFeedbackResult;
}

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  fileName: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progressStep?: string;
  result?: GradingResult;
  error?: string;
}
