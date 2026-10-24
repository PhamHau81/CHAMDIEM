import React from 'react';
import {
  CheckCircle2,
  FileText,
  Printer,
  Code2,
  Sparkles,
  Key,
  Flame,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'grade' | 'config' | 'scoreboard' | 'python_code';
  setActiveTab: (tab: 'grade' | 'config' | 'scoreboard' | 'python_code') => void;
  onOpenPrintModal: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  gradedCount: number;
  examKeyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPrintModal,
  onOpenApiKeyModal,
  hasApiKey,
  gradedCount,
  examKeyCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-sm text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-slate-900">
                  HỖ TRỢ CHẤM BÀI <span className="text-blue-600 font-black">_ PHẠM HẬU</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống chấm thi trắc nghiệm bằng hình ảnh • 4 lựa chọn (A/B/C/D) & Đúng/Sai (Đ/S)
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* API Key Settings Button with Mandatory Red Note */}
            <button
              onClick={onOpenApiKeyModal}
              className={`inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all border ${
                hasApiKey
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300 ring-2 ring-red-400/40 animate-pulse'
              }`}
              title="Cài đặt Google Gemini API Key & Chọn Model AI"
            >
              <Key className="w-4 h-4 mr-1.5 text-blue-600 shrink-0" />
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center">
                  Settings (API Key)
                </span>
                <span className="text-[10px] font-black text-red-600 tracking-tight leading-none mt-0.5">
                  Lấy API key để sử dụng app
                </span>
              </div>
            </button>

            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="In phiếu trả lời trắc nghiệm trắng để phát cho học sinh"
            >
              <Printer className="w-4 h-4 mr-1.5 text-slate-600" />
              <span className="hidden sm:inline">In Phiếu Trắng</span>
              <span className="sm:hidden">In Phiếu</span>
            </button>

            <button
              onClick={() => setActiveTab('python_code')}
              className={`inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors border ${
                activeTab === 'python_code'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title="Xem và tải mã nguồn Python Streamlit / OpenCV để chạy trên máy cá nhân"
            >
              <Code2 className="w-4 h-4 mr-1.5 text-amber-600" />
              <span className="hidden md:inline">Mã Nguồn Python</span>
              <span className="md:hidden">Python</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 sm:space-x-6 -mb-px border-t border-slate-100 sm:border-t-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('grade')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'grade'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Chụp / Tải Phiếu Chấm Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Cấu Hình Mã Đề ({examKeyCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('scoreboard')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'scoreboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>Bảng Điểm Cả Lớp</span>
            {gradedCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                {gradedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('python_code')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
              activeTab === 'python_code'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Hướng Dẫn Chạy Python Offline</span>
          </button>
        </div>
      </div>
    </header>
  );
};
