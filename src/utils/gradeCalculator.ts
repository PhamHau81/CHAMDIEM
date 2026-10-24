import {
  ExamKeyConfig,
  GradingResult,
  Part1ResultItem,
  Part2ResultItem,
  Part2StatementResult,
} from '../types.ts';

export interface RawDetectedAnswers {
  studentName?: string;
  studentId?: string;
  detectedExamCode?: string;
  confidenceScore?: number;
  part1Answers?: Array<{
    questionNumber: number;
    studentAnswer: 'A' | 'B' | 'C' | 'D' | 'BLANK' | 'INVALID';
  }>;
  part2Answers?: Array<{
    questionNumber: number;
    statements: Array<{
      id: 'a' | 'b' | 'c' | 'd';
      studentAnswer: 'Đ' | 'S' | 'BLANK' | 'INVALID';
    }>;
  }>;
  notes?: string;
}

/**
 * Calculates grading comparison and detailed statistics
 */
export function calculateGradingResult(
  detected: RawDetectedAnswers,
  examKeys: ExamKeyConfig[],
  forcedExamCode?: string,
  imagePreviewUrl: string = ''
): GradingResult {
  // Determine matching exam key
  const codeToMatch = forcedExamCode || detected.detectedExamCode || '101';
  let matchedExam = examKeys.find((k) => k.code === codeToMatch);
  if (!matchedExam) {
    matchedExam = examKeys[0];
  }

  const p1DetectedMap = new Map<number, string>();
  if (detected.part1Answers) {
    detected.part1Answers.forEach((item) => {
      p1DetectedMap.set(item.questionNumber, item.studentAnswer);
    });
  }

  // 1. Process Part 1 (Multiple Choice A, B, C, D)
  let part1Correct = 0;
  const part1Details: Part1ResultItem[] = matchedExam.part1.map((item) => {
    const rawStudentAns = p1DetectedMap.get(item.questionNumber);
    const studentAnswer = (rawStudentAns as any) || 'BLANK';
    const isCorrect = studentAnswer === item.correctAnswer;
    if (isCorrect) part1Correct++;

    return {
      questionNumber: item.questionNumber,
      studentAnswer,
      correctAnswer: item.correctAnswer,
      isCorrect,
      score: isCorrect ? matchedExam!.scoringConfig.part1ScorePerQuestion : 0,
    };
  });

  const part1Score = Math.round(part1Correct * matchedExam.scoringConfig.part1ScorePerQuestion * 100) / 100;

  // 2. Process Part 2 (True/False Đ / S)
  const p2DetectedMap = new Map<number, Map<string, string>>();
  if (detected.part2Answers) {
    detected.part2Answers.forEach((q) => {
      const subMap = new Map<string, string>();
      q.statements.forEach((st) => {
        subMap.set(st.id, st.studentAnswer);
      });
      p2DetectedMap.set(q.questionNumber, subMap);
    });
  }

  let part2TotalStatements = 0;
  let part2CorrectStatements = 0;
  let part2Score = 0;

  const part2Details: Part2ResultItem[] = matchedExam.part2.map((q) => {
    const subMap = p2DetectedMap.get(q.questionNumber);
    let questionCorrectSubs = 0;

    const statements: Part2StatementResult[] = q.statements.map((st) => {
      part2TotalStatements++;
      const studentAnswer = (subMap?.get(st.id) as any) || 'BLANK';
      const isCorrect = studentAnswer === st.correctAnswer;
      if (isCorrect) {
        questionCorrectSubs++;
        part2CorrectStatements++;
      }

      return {
        id: st.id,
        studentAnswer,
        correctAnswer: st.correctAnswer,
        isCorrect,
      };
    });

    // Score calculation according to Vietnam Ministry of Education standard for True/False:
    // 1 đúng -> 0.1đ, 2 đúng -> 0.25đ, 3 đúng -> 0.5đ, 4 đúng -> 1.0đ
    let qScore = 0;
    if (matchedExam!.scoringConfig.part2ScoreMethod === 'vietnam_standard') {
      if (questionCorrectSubs === 1) qScore = 0.1;
      else if (questionCorrectSubs === 2) qScore = 0.25;
      else if (questionCorrectSubs === 3) qScore = 0.5;
      else if (questionCorrectSubs === 4) qScore = 1.0;
    } else {
      qScore = questionCorrectSubs * 0.25;
    }
    part2Score += qScore;

    return {
      questionNumber: q.questionNumber,
      statements,
      correctCount: questionCorrectSubs,
      totalCount: q.statements.length,
      score: qScore,
    };
  });

  part2Score = Math.round(part2Score * 100) / 100;

  // 3. Totals (Requirement 4)
  const totalQuestions = matchedExam.part1.length + part2TotalStatements;
  const totalCorrectQuestions = part1Correct + part2CorrectStatements;
  const totalScore = Math.min(
    matchedExam.scoringConfig.maxScore,
    Math.round((part1Score + part2Score) * 100) / 100
  );

  return {
    id: `result-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    studentName: detected.studentName || 'Thí sinh (Chưa nhận dạng tên)',
    studentId: detected.studentId || '120401',
    examCode: matchedExam.code,
    matchedExamTitle: matchedExam.title,
    imagePreviewUrl,
    totalScore,
    maxScore: matchedExam.scoringConfig.maxScore,
    totalQuestions,
    totalCorrectQuestions,
    part1Total: matchedExam.part1.length,
    part1Correct,
    part1Score,
    part1Details,
    part2QuestionsCount: matchedExam.part2.length,
    part2TotalStatements,
    part2CorrectStatements,
    part2Score,
    part2Details,
    notes: detected.notes,
    detectionConfidence: detected.confidenceScore || 0.95,
  };
}
