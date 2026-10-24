import { ExamKeyConfig } from '../types.ts';

export const DEFAULT_EXAM_KEYS: ExamKeyConfig[] = [
  {
    id: 'exam-101',
    code: '101',
    title: 'Đề kiểm tra Giữa kỳ II - Môn Toán 12',
    subject: 'Toán học',
    createdAt: '2026-10-20',
    scoringConfig: {
      part1ScorePerQuestion: 0.25,
      part2ScoreMethod: 'vietnam_standard', // 1 đúng: 0.1đ, 2 đúng: 0.25đ, 3 đúng: 0.5đ, 4 đúng: 1.0đ
      maxScore: 10.0,
    },
    part1: [
      { questionNumber: 1, correctAnswer: 'A' },
      { questionNumber: 2, correctAnswer: 'C' },
      { questionNumber: 3, correctAnswer: 'B' },
      { questionNumber: 4, correctAnswer: 'D' },
      { questionNumber: 5, correctAnswer: 'B' },
      { questionNumber: 6, correctAnswer: 'A' },
      { questionNumber: 7, correctAnswer: 'D' },
      { questionNumber: 8, correctAnswer: 'C' },
      { questionNumber: 9, correctAnswer: 'A' },
      { questionNumber: 10, correctAnswer: 'C' },
      { questionNumber: 11, correctAnswer: 'B' },
      { questionNumber: 12, correctAnswer: 'D' },
    ],
    part2: [
      {
        questionNumber: 1,
        statements: [
          { id: 'a', correctAnswer: 'Đ' },
          { id: 'b', correctAnswer: 'S' },
          { id: 'c', correctAnswer: 'Đ' },
          { id: 'd', correctAnswer: 'S' },
        ],
      },
      {
        questionNumber: 2,
        statements: [
          { id: 'a', correctAnswer: 'S' },
          { id: 'b', correctAnswer: 'Đ' },
          { id: 'c', correctAnswer: 'Đ' },
          { id: 'd', correctAnswer: 'S' },
        ],
      },
      {
        questionNumber: 3,
        statements: [
          { id: 'a', correctAnswer: 'Đ' },
          { id: 'b', correctAnswer: 'Đ' },
          { id: 'c', correctAnswer: 'S' },
          { id: 'd', correctAnswer: 'Đ' },
        ],
      },
      {
        questionNumber: 4,
        statements: [
          { id: 'a', correctAnswer: 'S' },
          { id: 'b', correctAnswer: 'S' },
          { id: 'c', correctAnswer: 'Đ' },
          { id: 'd', correctAnswer: 'Đ' },
        ],
      },
    ],
  },
  {
    id: 'exam-102',
    code: '102',
    title: 'Đề kiểm tra Định kỳ - Môn Vật Lí 11',
    subject: 'Vật lí',
    createdAt: '2026-10-21',
    scoringConfig: {
      part1ScorePerQuestion: 0.3,
      part2ScoreMethod: 'vietnam_standard',
      maxScore: 10.0,
    },
    part1: [
      { questionNumber: 1, correctAnswer: 'B' },
      { questionNumber: 2, correctAnswer: 'D' },
      { questionNumber: 3, correctAnswer: 'A' },
      { questionNumber: 4, correctAnswer: 'C' },
      { questionNumber: 5, correctAnswer: 'D' },
      { questionNumber: 6, correctAnswer: 'B' },
      { questionNumber: 7, correctAnswer: 'A' },
      { questionNumber: 8, correctAnswer: 'C' },
      { questionNumber: 9, correctAnswer: 'B' },
      { questionNumber: 10, correctAnswer: 'A' },
    ],
    part2: [
      {
        questionNumber: 1,
        statements: [
          { id: 'a', correctAnswer: 'Đ' },
          { id: 'b', correctAnswer: 'Đ' },
          { id: 'c', correctAnswer: 'S' },
          { id: 'd', correctAnswer: 'S' },
        ],
      },
      {
        questionNumber: 2,
        statements: [
          { id: 'a', correctAnswer: 'S' },
          { id: 'b', correctAnswer: 'Đ' },
          { id: 'c', correctAnswer: 'Đ' },
          { id: 'd', correctAnswer: 'Đ' },
        ],
      },
      {
        questionNumber: 3,
        statements: [
          { id: 'a', correctAnswer: 'Đ' },
          { id: 'b', correctAnswer: 'S' },
          { id: 'c', correctAnswer: 'Đ' },
          { id: 'd', correctAnswer: 'S' },
        ],
      },
    ],
  },
];
