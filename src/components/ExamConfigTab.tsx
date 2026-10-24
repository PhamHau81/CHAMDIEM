import React, { useState } from 'react';
import {
  ExamKeyConfig,
  MultipleChoiceOption,
  TrueFalseOption,
  Part1QuestionConfig,
  Part2QuestionConfig,
} from '../types.ts';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  FileCode,
  Sparkles,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

interface ExamConfigTabProps {
  examKeys: ExamKeyConfig[];
  onUpdateExamKeys: (updated: ExamKeyConfig[]) => void;
  selectedExamId: string;
  onSelectExamId: (id: string) => void;
}

export const ExamConfigTab: React.FC<ExamConfigTabProps> = ({
  examKeys,
  onUpdateExamKeys,
  selectedExamId,
  onSelectExamId,
}) => {
  const currentExam = examKeys.find((k) => k.id === selectedExamId) || examKeys[0];

  const [activeExam, setActiveExam] = useState<ExamKeyConfig>(
    JSON.parse(JSON.stringify(currentExam))
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [quickPasteP1Text, setQuickPasteP1Text] = useState('');
  const [showQuickPaste, setShowQuickPaste] = useState(false);

  // Sync when selectedExamId changes from outside
  React.useEffect(() => {
    const found = examKeys.find((k) => k.id === selectedExamId);
    if (found) {
      setActiveExam(JSON.parse(JSON.stringify(found)));
    }
  }, [selectedExamId, examKeys]);

  // Handle switching exam
  const handleSelectExam = (id: string) => {
    onSelectExamId(id);
    const found = examKeys.find((k) => k.id === id);
    if (found) {
      setActiveExam(JSON.parse(JSON.stringify(found)));
    }
  };

  // Add new exam
  const handleAddNewExam = () => {
    const newCode = `${Math.floor(100 + Math.random() * 900)}`;
    const newExam: ExamKeyConfig = {
      id: `exam-${Date.now()}`,
      code: newCode,
      title: `Đề kiểm tra trắc nghiệm mã đề ${newCode}`,
      subject: 'Toán học',
      createdAt: new Date().toISOString().split('T')[0],
      scoringConfig: {
        part1ScorePerQuestion: 0.25,
        part2ScoreMethod: 'vietnam_standard',
        maxScore: 10.0,
      },
      part1: Array.from({ length: 12 }, (_, i) => ({
        questionNumber: i + 1,
        correctAnswer: (['A', 'B', 'C', 'D'][i % 4] as MultipleChoiceOption),
      })),
      part2: Array.from({ length: 4 }, (_, i) => ({
        questionNumber: i + 1,
        statements: [
          { id: 'a', correctAnswer: 'Đ' },
          { id: 'b', correctAnswer: 'S' },
          { id: 'c', correctAnswer: 'Đ' },
          { id: 'd', correctAnswer: 'S' },
        ],
      })),
    };

    const updated = [...examKeys, newExam];
    onUpdateExamKeys(updated);
    onSelectExamId(newExam.id);
    setActiveExam(newExam);
  };

  // Duplicate exam
  const handleDuplicateExam = () => {
    const duplicatedCode = `${Number(activeExam.code) + 1 || '103'}`;
    const duplicated: ExamKeyConfig = {
      ...JSON.parse(JSON.stringify(activeExam)),
      id: `exam-${Date.now()}`,
      code: duplicatedCode,
      title: `${activeExam.title} (Bản sao - Mã ${duplicatedCode})`,
    };
    const updated = [...examKeys, duplicated];
    onUpdateExamKeys(updated);
    onSelectExamId(duplicated.id);
    setActiveExam(duplicated);
  };

  // Delete exam
  const handleDeleteExam = (id: string) => {
    if (examKeys.length <= 1) {
      alert('Hệ thống cần tối thiểu 1 mã đề.');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa mã đề ${activeExam.code}?`)) {
      const filtered = examKeys.filter((k) => k.id !== id);
      onUpdateExamKeys(filtered);
      onSelectExamId(filtered[0].id);
      setActiveExam(JSON.parse(JSON.stringify(filtered[0])));
    }
  };

  // Change answer Part 1
  const handleSetPart1Answer = (qNumber: number, opt: MultipleChoiceOption) => {
    const updatedP1 = activeExam.part1.map((q) =>
      q.questionNumber === qNumber ? { ...q, correctAnswer: opt } : q
    );
    setActiveExam({ ...activeExam, part1: updatedP1 });
  };

  // Change answer Part 2
  const handleSetPart2Answer = (
    qNumber: number,
    subId: 'a' | 'b' | 'c' | 'd',
    opt: TrueFalseOption
  ) => {
    const updatedP2 = activeExam.part2.map((q) => {
      if (q.questionNumber === qNumber) {
        return {
          ...q,
          statements: q.statements.map((s) =>
            s.id === subId ? { ...s, correctAnswer: opt } : s
          ),
        };
      }
      return q;
    });
    setActiveExam({ ...activeExam, part2: updatedP2 });
  };

  // Change Part 1 question count
  const handleChangePart1Count = (newCount: number) => {
    let p1 = [...activeExam.part1];
    if (newCount > p1.length) {
      for (let i = p1.length + 1; i <= newCount; i++) {
        p1.push({
          questionNumber: i,
          correctAnswer: 'A',
        });
      }
    } else {
      p1 = p1.slice(0, newCount);
    }
    setActiveExam({ ...activeExam, part1: p1 });
  };

  // Change Part 2 question count
  const handleChangePart2Count = (newCount: number) => {
    let p2 = [...activeExam.part2];
    if (newCount > p2.length) {
      for (let i = p2.length + 1; i <= newCount; i++) {
        p2.push({
          questionNumber: i,
          statements: [
            { id: 'a', correctAnswer: 'Đ' },
            { id: 'b', correctAnswer: 'S' },
            { id: 'c', correctAnswer: 'Đ' },
            { id: 'd', correctAnswer: 'S' },
          ],
        });
      }
    } else {
      p2 = p2.slice(0, newCount);
    }
    setActiveExam({ ...activeExam, part2: p2 });
  };

  // Quick parse string into Part 1 answers
  const applyQuickPasteP1 = () => {
    const clean = quickPasteP1Text.toUpperCase().replace(/[^ABCD]/g, '');
    if (!clean) return;

    const newP1: Part1QuestionConfig[] = clean.split('').map((letter, idx) => ({
      questionNumber: idx + 1,
      correctAnswer: letter as MultipleChoiceOption,
    }));

    setActiveExam({ ...activeExam, part1: newP1 });
    setShowQuickPaste(false);
    setQuickPasteP1Text('');
  };

  // Save changes
  const handleSave = () => {
    const updated = examKeys.map((k) => (k.id === activeExam.id ? activeExam : k));
    onUpdateExamKeys(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Exam Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <span>Cấu Hình Đáp Án Chuẩn & Mã Đề</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Thiết lập đáp án chuẩn cho từng mã đề: Phần 1 (A, B, C, D) và Phần 2 (Đúng / Sai)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddNewExam}
              className="inline-flex items-center px-3.5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Thêm Mã Đề Mới</span>
            </button>
            <button
              onClick={handleDuplicateExam}
              className="inline-flex items-center px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="Nhân bản mã đề này"
            >
              <Copy className="w-4 h-4 mr-1.5 text-slate-500" />
              <span>Nhân Bản</span>
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </div>

        {/* Exam Code Pills */}
        <div className="pt-5 flex items-center space-x-3 overflow-x-auto pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Danh sách mã đề:
          </span>
          {examKeys.map((exam) => (
            <button
              key={exam.id}
              onClick={() => handleSelectExam(exam.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center space-x-2 ${
                exam.id === activeExam.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>Mã {exam.code}</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-md ${
                exam.id === activeExam.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {exam.subject}
              </span>
            </button>
          ))}
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Đã lưu thành công đáp án chuẩn cho Mã đề {activeExam.code}!</span>
          </div>
        )}
      </div>

      {/* Exam Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <span>Thông Tin Mã Đề</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Mã đề thi (3 hoặc 4 số):
            </label>
            <input
              type="text"
              value={activeExam.code}
              onChange={(e) => setActiveExam({ ...activeExam, code: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-lg text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="101"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Tên bài kiểm tra:
            </label>
            <input
              type="text"
              value={activeExam.title}
              onChange={(e) => setActiveExam({ ...activeExam, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kiểm tra 1 tiết HK2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Môn học:
            </label>
            <input
              type="text"
              value={activeExam.subject}
              onChange={(e) => setActiveExam({ ...activeExam, subject: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toán học"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Cách tính điểm Phần 2 (Đúng / Sai):
            </label>
            <select
              value={activeExam.scoringConfig.part2ScoreMethod}
              onChange={(e) =>
                setActiveExam({
                  ...activeExam,
                  scoringConfig: {
                    ...activeExam.scoringConfig,
                    part2ScoreMethod: e.target.value as any,
                  },
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
            >
              <option value="vietnam_standard">
                Thang điểm bậc thang 4 ý (1 ý: 0.1đ | 2 ý: 0.25đ | 3 ý: 0.5đ | 4 ý: 1.0đ)
              </option>
              <option value="subitem">Tính đều điểm mỗi ý (0.25đ / ý đúng)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleDeleteExam(activeExam.id)}
              className="w-full py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Mã Đề Này</span>
            </button>
          </div>
        </div>

        {/* Right 2 columns: Quick settings */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cấu trúc đề kiểm tra 2 Phần</span>
            </div>
            <h3 className="text-xl font-bold">
              Trắc Nghiệm 4 Lựa Chọn (A, B, C, D) & Đúng / Sai (Đ, S)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cấu trúc bài thi gồm Phần I (Trắc nghiệm nhiều lựa chọn A, B, C, D) và Phần II (Trắc nghiệm Đúng/Sai với các ý a, b, c, d). Hệ thống sẽ tự động quét và đối soát chính xác từng ô tô trên phiếu làm bài của học sinh và tính điểm chi tiết.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-slate-400 block font-medium">Phần 1 đang có:</span>
              <span className="text-lg font-extrabold text-blue-300">
                {activeExam.part1.length} câu hỏi
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-slate-400 block font-medium">Phần 2 Đúng/Sai có:</span>
              <span className="text-lg font-extrabold text-emerald-300">
                {activeExam.part2.length} câu ({activeExam.part2.length * 4} ý Đ/S)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PHẦN I - TRẮC NGHIỆM 4 LỰA CHỌN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                PHẦN I
              </span>
              <h3 className="font-bold text-slate-900 text-lg">
                Trắc Nghiệm 4 Phương Án (A, B, C, D)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Thí sinh chỉ chọn 1 phương án duy nhất trong mỗi câu
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <span>Số câu:</span>
              <select
                value={activeExam.part1.length}
                onChange={(e) => handleChangePart1Count(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              >
                {[6, 8, 10, 12, 15, 20, 24, 30, 40].map((num) => (
                  <option key={num} value={num}>
                    {num} câu
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowQuickPaste(!showQuickPaste)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
            >
              <FileCode className="w-3.5 h-3.5 mr-1" />
              <span>Dán Nhanh Chuỗi Đáp Án</span>
            </button>
          </div>
        </div>

        {/* Quick Paste Modal / Drawer */}
        {showQuickPaste && (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <label className="block text-xs font-bold text-indigo-900">
              Nhập nhanh chuỗi đáp án (Ví dụ: &quot;ABCDABCDACBD&quot; hoặc &quot;1A 2B 3C...&quot;):
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={quickPasteP1Text}
                onChange={(e) => setQuickPasteP1Text(e.target.value)}
                placeholder="VD: ACBDDCBACBDA..."
                className="flex-1 px-3 py-2 bg-white border border-indigo-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <button
                onClick={applyQuickPasteP1}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Áp dụng
              </button>
              <button
                onClick={() => setShowQuickPaste(false)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Question Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {activeExam.part1.map((q) => {
            const options: MultipleChoiceOption[] = ['A', 'B', 'C', 'D'];
            return (
              <div
                key={q.questionNumber}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between"
              >
                <div className="w-16 font-bold text-slate-700 text-sm">
                  Câu {q.questionNumber}:
                </div>
                <div className="flex items-center space-x-1.5">
                  {options.map((opt) => {
                    const isSelected = q.correctAnswer === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSetPart1Answer(q.questionNumber, opt)}
                        className={`w-8 h-8 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs scale-105 ring-2 ring-blue-300'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PHẦN II - TRẮC NGHIỆM ĐÚNG / SAI */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                PHẦN II
              </span>
              <h3 className="font-bold text-slate-900 text-lg">
                Trắc Nghiệm Đúng / Sai (Ký hiệu: Đ hoặc S)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mỗi câu gồm 4 ý hỏi a), b), c), d). Thí sinh chọn Đúng (Đ) hoặc Sai (S) cho từng ý.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <span>Số câu Đúng/Sai:</span>
            <select
              value={activeExam.part2.length}
              onChange={(e) => handleChangePart2Count(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                <option key={num} value={num}>
                  {num} câu ({num * 4} ý)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Part 2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeExam.part2.map((q) => (
            <div
              key={q.questionNumber}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Câu {q.questionNumber} (Phần Đúng/Sai):</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">4 ý a, b, c, d</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {q.statements.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-700 text-sm font-mono">
                      Ý {st.id})
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleSetPart2Answer(q.questionNumber, st.id, 'Đ')}
                        className={`px-3 py-1 rounded-md text-xs font-extrabold transition-all ${
                          st.correctAnswer === 'Đ'
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Đ (Đúng)
                      </button>
                      <button
                        onClick={() => handleSetPart2Answer(q.questionNumber, st.id, 'S')}
                        className={`px-3 py-1 rounded-md text-xs font-extrabold transition-all ${
                          st.correctAnswer === 'S'
                            ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        S (Sai)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating or Bottom Save Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Mẹo: Sau khi chỉnh sửa xong, hãy nhấn &quot;Lưu cấu hình&quot; để cập nhật đáp án vào hệ thống.</span>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>Lưu Cấu Hình Mã Đề {activeExam.code}</span>
        </button>
      </div>
    </div>
  );
};
