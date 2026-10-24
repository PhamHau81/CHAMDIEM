import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Info,
  Lock,
} from 'lucide-react';
import {
  AI_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../utils/geminiService.ts';
import { AIModelId } from '../types.ts';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestStatus('idle');
      setTestError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKeyInput.trim());
    setStoredModel(selectedModel);
    onSave?.();
    onClose();
  };

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestStatus('error');
      setTestError('Vui lòng nhập API Key trước khi kiểm tra.');
      return;
    }

    setTestStatus('testing');
    setTestError(null);

    try {
      // Test directly with Google Gemini API
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyInput.trim()}`
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Lỗi ${res.status}: API Key không hợp lệ`);
      }
      setTestStatus('success');
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Không thể xác thực API Key');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Thiết lập Model & API Key
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Nhập API Key của riêng bạn để sử dụng tính năng chấm thi không giới hạn.
            </p>
          </div>
        </div>

        {/* Warning / Instruction banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900">
              <span className="font-bold">Lấy API Key Miễn Phí:</span> Bạn có thể tạo API Key hoàn toàn miễn phí từ Google AI Studio trong vòng 1 phút.
              <div className="mt-2">
                <a
                  href="https://aistudio.google.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs hover:shadow-xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Mở Google AI Studio để lấy Key (aistudio.google.com/api-keys)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">
            Google Gemini API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all pr-24"
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200"
              >
                {showKey ? 'Ẩn' : 'Hiện'}
              </button>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testStatus === 'testing' || !apiKeyInput.trim()}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg disabled:opacity-50"
              >
                {testStatus === 'testing' ? 'Kiểm tra...' : 'Test'}
              </button>
            </div>
          </div>

          {testStatus === 'success' && (
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>API Key hợp lệ và sẵn sàng hoạt động!</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="flex items-center space-x-1.5 text-xs font-bold text-red-600 mt-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="truncate">{testError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>API Key chỉ lưu trực tiếp trên trình duyệt của bạn (localStorage), không gửi về máy chủ thứ ba.</span>
          </p>
        </div>

        {/* Model Selection Cards */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Chọn Model AI Ưu Tiên</span>
            <span className="text-[11px] font-normal text-slate-500">
              (Hệ thống tự động chuyển đổi fallback nếu model gặp lỗi quota)
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AI_MODELS.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {model.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      {model.name}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {model.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-0.5 text-amber-500" />
                      {model.speed}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {model.accuracy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Lưu Cấu Hình</span>
          </button>
        </div>
      </div>
    </div>
  );
};
