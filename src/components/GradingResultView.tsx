import React, { useEffect, useState } from 'react';
import {
  GradingResult,
  MultipleChoiceOption,
  TrueFalseOption,
  ExamKeyConfig,
  AIFeedbackResult,
} from '../types.ts';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Printer,
  Save,
  Award,
  Sparkles,
  BarChart3,
  User,
  Hash,
  BookOpen,
  Eye,
  Check,
  RotateCcw,
  FileText,
  Lightbulb,
  BookCheck,
  RefreshCw,
  Brain,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAIPedagogicalFeedback, getStoredApiKey } from '../utils/geminiService.ts';
import { exportStudentWordReport } from '../utils/exportHelpers.ts';

interface GradingResultViewProps {
  result: GradingResult;
  examKeys: ExamKeyConfig[];
  onBackToScanner: () => void;
  onSaveToScoreboard: (result: GradingResult) => void;
  isSavedInScoreboard?: boolean;
}

export const GradingResultView: React.FC<GradingResultViewProps> = ({
  result: initialResult,
  examKeys,
  onBackToScanner,
  onSaveToScoreboard,
  isSavedInScoreboard = false,
}) => {
  const [result, setResult] = useState<GradingResult>(initialResult);
  const [activeDetailTab, setActiveDetailTab] = useState<'all' | 'part1' | 'part2'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'wrong_only' | 'correct_only'>('all');
  const [savedSuccess, setSavedSuccess] = useState(isSavedInScoreboard);

  // AI Pedagogical feedback state
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackResult | null>(result.aiFeedback || null);

  // Trigger celebration confetti for high grades (>= 8.0)
  useEffect(() => {
    if (result.totalScore >= 8.0) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result.totalScore]);

  // Handle manual correction for Part 1
  const handleUpdatePart1Answer = (qNumber: number, newAns: MultipleChoiceOption) => {
    const updatedDetails = result.part1Details.map((item) => {
      if (item.questionNumber === qNumber) {
        const isCorrect = newAns === item.correctAnswer;
        return {
          ...item,
          studentAnswer: newAns,
          isCorrect,
          score: isCorrect ? 0.25 : 0,
        };
      }
      return item;
    });

    const newPart1Correct = updatedDetails.filter((d) => d.isCorrect).length;
    const newPart1Score = Math.round(newPart1Correct * 0.25 * 100) / 100;
    const newTotalCorrect = newPart1Correct + result.part2CorrectStatements;
    const newTotalScore = Math.min(10, Math.round((newPart1Score + result.part2Score) * 100) / 100);

    setResult({
      ...result,
      part1Details: updatedDetails,
      part1Correct: newPart1Correct,
      part1Score: newPart1Score,
      totalCorrectQuestions: newTotalCorrect,
      totalScore: newTotalScore,
    });
  };

  // Handle manual correction for Part 2
  const handleUpdatePart2Answer = (
    qNumber: number,
    subId: 'a' | 'b' | 'c' | 'd',
    newAns: TrueFalseOption
  ) => {
    let newPart2CorrectSubs = 0;
    let newPart2Score = 0;

    const updatedP2Details = result.part2Details.map((q) => {
      let qCorrectCount = 0;
      const updatedStatements = q.statements.map((st) => {
        const studentAns = q.questionNumber === qNumber && st.id === subId ? newAns : st.studentAnswer;
        const isCorrect = studentAns === st.correctAnswer;
        if (isCorrect) {
          qCorrectCount++;
          newPart2CorrectSubs++;
        }
        return {
          ...st,
          studentAnswer: studentAns,
          isCorrect,
        };
      });

      // MoET standard scoring rule
      let qScore = 0;
      if (qCorrectCount === 1) qScore = 0.1;
      else if (qCorrectCount === 2) qScore = 0.25;
      else if (qCorrectCount === 3) qScore = 0.5;
      else if (qCorrectCount === 4) qScore = 1.0;
      newPart2Score += qScore;

      return {
        ...q,
        statements: updatedStatements,
        correctCount: qCorrectCount,
        score: qScore,
      };
    });

    newPart2Score = Math.round(newPart2Score * 100) / 100;
    const newTotalCorrect = result.part1Correct + newPart2CorrectSubs;
    const newTotalScore = Math.min(10, Math.round((result.part1Score + newPart2Score) * 100) / 100);

    setResult({
      ...result,
      part2Details: updatedP2Details,
      part2CorrectStatements: newPart2CorrectSubs,
      part2Score: newPart2Score,
      totalCorrectQuestions: newTotalCorrect,
      totalScore: newTotalScore,
    });
  };

  const handleSave = () => {
    const finalResult = { ...result, aiFeedback: aiFeedback || undefined };
    onSaveToScoreboard(finalResult);
    setSavedSuccess(true);
  };

  const handleRequestAIFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      // Find wrong questions
      const wrongP1 = result.part1Details.filter((d) => !d.isCorrect).map((d) => d.questionNumber);
      const wrongP2 = result.part2Details
        .map((q) => ({
          questionNumber: q.questionNumber,
          wrongStatements: q.statements.filter((s) => !s.isCorrect).map((s) => s.id),
        }))
        .filter((q) => q.wrongStatements.length > 0);

      const feedback = await generateAIPedagogicalFeedback(
        result.studentName,
        result.totalScore,
        wrongP1,
        wrongP2,
        result.matchedExamTitle || 'Toán học'
      );

      setAiFeedback(feedback);
      setResult((prev) => ({ ...prev, aiFeedback: feedback }));
    } catch (e: any) {
      console.error('Error generating feedback:', e);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const getRankBadge = (score: number) => {
    if (score >= 9.0) return { label: 'Xuất sắc', color: 'bg-emerald-500 text-white' };
    if (score >= 8.0) return { label: 'Giỏi', color: 'bg-blue-600 text-white' };
    if (score >= 6.5) return { label: 'Khá', color: 'bg-indigo-500 text-white' };
    if (score >= 5.0) return { label: 'Trung bình', color: 'bg-amber-500 text-white' };
    return { label: 'Cần cố gắng', color: 'bg-rose-500 text-white' };
  };

  const rank = getRankBadge(result.totalScore);
  const overallPercentage = Math.round((result.totalCorrectQuestions / result.totalQuestions) * 100);
  const part2Percentage = Math.round((result.part2CorrectStatements / result.part2TotalStatements) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToScanner}
          className="inline-flex items-center px-4 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Quay lại quét bài khác</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* AI Feedback Button */}
          <button
            onClick={handleRequestAIFeedback}
            disabled={isGeneratingFeedback}
            className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200 shadow-xs"
            title="Sử dụng AI phân tích lỗ hổng kiến thức và đề xuất ôn tập"
          >
            {isGeneratingFeedback ? (
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin text-purple-600" />
            ) : (
              <Brain className="w-4 h-4 mr-1.5 text-purple-600" />
            )}
            <span>{isGeneratingFeedback ? 'Đang phân tích...' : 'AI Nhận Xét & Ôn Tập'}</span>
          </button>

          {/* Export to Word Button */}
          <button
            onClick={() => exportStudentWordReport(result)}
            className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-xs"
            title="Xuất phiếu điểm gửi phụ huynh định dạng Microsoft Word (.doc)"
          >
            <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
            <span>Xuất Phiếu Báo Điểm (Word)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>In Phiếu</span>
          </button>

          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className={`inline-flex items-center px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                <span>Đã lưu vào Sổ điểm</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Lưu Vào Sổ Điểm Lớp</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Student Score Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Student Meta */}
          <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {result.studentName}
                </h2>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    SBD: {result.studentId}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Mã đề: {result.examCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-2">
              <p className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>{result.matchedExamTitle}</span>
              </p>
              <p className="text-slate-400 text-2xs">
                Chấm lúc: {new Date(result.timestamp).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Center: Total Score Banner */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-2 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Điểm Tổng Kết Bài Thi
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-6xl font-black tracking-tight text-blue-700">
                {result.totalScore}
              </span>
              <span className="text-xl font-bold text-slate-400">/ 10.0</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rank.color}`}>
              Xếp loại: {rank.label}
            </span>
          </div>

          {/* Right: Quick Breakdown Stats */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Tổng câu/ý đúng toàn bài:</span>
              <span className="font-extrabold text-slate-900">
                {result.totalCorrectQuestions} / {result.totalQuestions} ({overallPercentage}%)
              </span>
            </div>

            {/* Part 1 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Phần I (A/B/C/D)</span>
                <span className="text-[11px] text-slate-500">
                  Đúng {result.part1Correct}/{result.part1Total} câu
                </span>
              </div>
              <span className="text-sm font-black text-blue-700">{result.part1Score} đ</span>
            </div>

            {/* Part 2 */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Phần II (Đúng/Sai)</span>
                <span className="text-[11px] text-emerald-700">
                  Đúng {result.part2CorrectStatements}/{result.part2TotalStatements} ý ({result.part2QuestionsCount} câu)
                </span>
              </div>
              <span className="text-sm font-black text-emerald-700">{result.part2Score} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI PEDAGOGICAL FEEDBACK CARD (SKILL: ai-agents-architect) */}
      {aiFeedback && (
        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-3xl border border-purple-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-purple-950">
                Đánh Giá Sư Phạm & Kế Hoạch Ôn Tập Từ Trợ Lý AI
              </h3>
            </div>
            <button
              onClick={() => exportStudentWordReport(result)}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>In nhận xét này vào phiếu Word</span>
            </button>
          </div>

          <p className="text-sm text-purple-900 leading-relaxed font-medium">
            &quot;{aiFeedback.overallAssessment}&quot;
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/90 p-4 rounded-2xl border border-purple-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Điểm Mạnh Của Học Sinh</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {aiFeedback.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-purple-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700">
                <XCircle className="w-4 h-4" />
                <span>Lỗ Hổng Kiến Thức Cần Củng Cố</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {aiFeedback.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-purple-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700">
                <Lightbulb className="w-4 h-4" />
                <span>Chủ Đề Nên Ôn Luyện Ngay</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {aiFeedback.recommendedTopics.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Answer Detail Tables */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Chi Tiết Từng Câu Hỏi & Chỉnh Sửa Đáp Án
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterMode === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterMode('wrong_only')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterMode === 'wrong_only' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Chỉ câu sai
              </button>
              <button
                onClick={() => setFilterMode('correct_only')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterMode === 'correct_only' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Chỉ câu đúng
              </button>
            </div>
          </div>
        </div>

        {/* TABLE PHẦN 1: TRẮC NGHIỆM 4 LỰA CHỌN */}
        {(activeDetailTab === 'all' || activeDetailTab === 'part1') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>PHẦN I: Trắc Nghiệm 4 Lựa Chọn (A, B, C, D)</span>
              </h4>
              <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Đúng {result.part1Correct}/{result.part1Total} câu • {result.part1Score} điểm
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Câu</th>
                    <th className="py-2.5 px-3">Học sinh chọn (Bấm để sửa)</th>
                    <th className="py-2.5 px-3">Đáp án chuẩn</th>
                    <th className="py-2.5 px-3 text-center">Kết quả</th>
                    <th className="py-2.5 px-3 text-right">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.part1Details
                    .filter((item) => {
                      if (filterMode === 'wrong_only') return !item.isCorrect;
                      if (filterMode === 'correct_only') return item.isCorrect;
                      return true;
                    })
                    .map((item) => {
                      return (
                        <tr
                          key={item.questionNumber}
                          className={`hover:bg-slate-50 transition-colors ${
                            !item.isCorrect ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-bold text-slate-800">
                            Câu {item.questionNumber}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-1">
                              {(['A', 'B', 'C', 'D'] as MultipleChoiceOption[]).map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => handleUpdatePart1Answer(item.questionNumber, opt)}
                                  className={`w-6 h-6 rounded font-bold text-xs transition-all ${
                                    item.studentAnswer === opt
                                      ? item.isCorrect
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                              {item.studentAnswer === 'BLANK' && (
                                <span className="text-2xs text-amber-600 font-medium ml-1">
                                  (Chưa tô)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {item.correctAnswer}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.isCorrect ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                Đúng
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                                <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                                Sai
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800">
                            {item.score > 0 ? `+${item.score}` : '0'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE PHẦN 2: TRẮC NGHIỆM ĐÚNG / SAI */}
        {(activeDetailTab === 'all' || activeDetailTab === 'part2') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>PHẦN II: Trắc Nghiệm Đúng / Sai (Đ / S)</span>
              </h4>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Đúng {result.part2CorrectStatements}/{result.part2TotalStatements} ý ({part2Percentage}%) • {result.part2Score} điểm
              </span>
            </div>

            <div className="space-y-3">
              {result.part2Details.map((q) => (
                <div
                  key={q.questionNumber}
                  className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-xs">
                      Câu {q.questionNumber} (Đúng {q.correctCount}/4 ý)
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      +{q.score} điểm
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {q.statements.map((st) => (
                      <div
                        key={st.id}
                        className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                          st.isCorrect
                            ? 'bg-white border-emerald-200'
                            : 'bg-rose-50/60 border-rose-200'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-700 mr-1.5 font-mono">
                            {st.id})
                          </span>
                          <span className="text-2xs text-slate-400">
                            (Chuẩn:{' '}
                            <strong className={st.correctAnswer === 'Đ' ? 'text-emerald-700' : 'text-rose-700'}>
                              {st.correctAnswer}
                            </strong>
                            )
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleUpdatePart2Answer(q.questionNumber, st.id, 'Đ')}
                            title="Sửa thành Đúng"
                            className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                              st.studentAnswer === 'Đ'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Đ
                          </button>
                          <button
                            onClick={() => handleUpdatePart2Answer(q.questionNumber, st.id, 'S')}
                            title="Sửa thành Sai"
                            className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                              st.studentAnswer === 'S'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            S
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
