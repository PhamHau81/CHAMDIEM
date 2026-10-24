import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ScannerTab } from './components/ScannerTab.tsx';
import { ExamConfigTab } from './components/ExamConfigTab.tsx';
import { GradingResultView } from './components/GradingResultView.tsx';
import { ClassScoreboardTab } from './components/ClassScoreboardTab.tsx';
import { PythonCodeTab } from './components/PythonCodeTab.tsx';
import { PrintSheetModal } from './components/PrintSheetModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { DEFAULT_EXAM_KEYS } from './data/defaultExams.ts';
import { ExamKeyConfig, GradingResult } from './types.ts';
import { getStoredApiKey } from './utils/geminiService.ts';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'grade' | 'config' | 'scoreboard' | 'python_code'>('grade');

  // Exam Configuration State with LocalStorage persistence
  const [examKeys, setExamKeys] = useState<ExamKeyConfig[]>(() => {
    try {
      const saved = localStorage.getItem('edugrade_exam_keys');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load exam keys from localStorage:', e);
    }
    return DEFAULT_EXAM_KEYS;
  });

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return examKeys[0]?.id || 'exam-101';
  });

  // Current Graded Result (if viewing a specific sheet)
  const [currentResult, setCurrentResult] = useState<GradingResult | null>(null);

  // Scoreboard / History State
  const [scoreboardRecords, setScoreboardRecords] = useState<GradingResult[]>(() => {
    try {
      const saved = localStorage.getItem('edugrade_scoreboard');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load scoreboard from localStorage:', e);
    }
    return [];
  });

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getStoredApiKey()));

  // On initial mount, prompt with API key modal if not yet set
  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));
    if (!key) {
      // Delay slightly for smooth initial page render
      const timer = setTimeout(() => {
        setIsApiKeyModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist exam keys
  useEffect(() => {
    try {
      localStorage.setItem('edugrade_exam_keys', JSON.stringify(examKeys));
    } catch (e) {
      console.error('Failed to save exam keys:', e);
    }
  }, [examKeys]);

  // Persist scoreboard
  useEffect(() => {
    try {
      localStorage.setItem('edugrade_scoreboard', JSON.stringify(scoreboardRecords));
    } catch (e) {
      console.error('Failed to save scoreboard:', e);
    }
  }, [scoreboardRecords]);

  // Handler when a sheet is graded
  const handleGradingComplete = (result: GradingResult) => {
    setCurrentResult(result);
  };

  // Handler when batch grading is completed
  const handleBatchComplete = (results: GradingResult[]) => {
    setScoreboardRecords((prev) => {
      const newIds = new Set(results.map((r) => r.id));
      const filtered = prev.filter((r) => !newIds.has(r.id));
      return [...results, ...filtered];
    });
    setActiveTab('scoreboard');
  };

  // Save to scoreboard
  const handleSaveToScoreboard = (result: GradingResult) => {
    setScoreboardRecords((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      return [result, ...filtered];
    });
  };

  // Delete from scoreboard
  const handleDeleteRecord = (id: string) => {
    setScoreboardRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Clear scoreboard
  const handleClearAllRecords = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử điểm của cả lớp không?')) {
      setScoreboardRecords([]);
    }
  };

  // View specific record from scoreboard
  const handleSelectRecordFromScoreboard = (result: GradingResult) => {
    setCurrentResult(result);
    setActiveTab('grade');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        gradedCount={scoreboardRecords.length}
        examKeyCount={examKeys.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'grade' && (
          <>
            {currentResult ? (
              <GradingResultView
                result={currentResult}
                examKeys={examKeys}
                onBackToScanner={() => setCurrentResult(null)}
                onSaveToScoreboard={handleSaveToScoreboard}
                isSavedInScoreboard={scoreboardRecords.some((r) => r.id === currentResult.id)}
              />
            ) : (
              <ScannerTab
                examKeys={examKeys}
                selectedExamId={selectedExamId}
                onGradingComplete={handleGradingComplete}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                onBatchComplete={handleBatchComplete}
              />
            )}
          </>
        )}

        {activeTab === 'config' && (
          <ExamConfigTab
            examKeys={examKeys}
            onUpdateExamKeys={setExamKeys}
            selectedExamId={selectedExamId}
            onSelectExamId={setSelectedExamId}
          />
        )}

        {activeTab === 'scoreboard' && (
          <ClassScoreboardTab
            records={scoreboardRecords}
            onSelectRecord={handleSelectRecordFromScoreboard}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAllRecords}
          />
        )}

        {activeTab === 'python_code' && <PythonCodeTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">HỖ TRỢ CHẤM BÀI _ PHẠM HẬU</span>
            <span>• Hệ thống chấm thi trắc nghiệm thông minh cho giáo viên</span>
          </div>
          <p className="text-slate-400">
            Hỗ trợ cấu trúc đề thi 2 phần: 4 lựa chọn (A/B/C/D) & Đúng/Sai (Đ/S) theo tiêu chuẩn Bộ GD&ĐT.
          </p>
        </div>
      </footer>

      {/* Printable Sheet Modal */}
      <PrintSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        examKeys={examKeys}
        selectedExamId={selectedExamId}
      />

      {/* Gemini API Key & Model Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={() => setHasApiKey(Boolean(getStoredApiKey()))}
      />
    </div>
  );
}
