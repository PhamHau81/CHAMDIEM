import React, { useState } from 'react';
import {
  PYTHON_STREAMLIT_CODE,
  PYTHON_REQUIREMENTS,
} from '../data/pythonSourceCode.ts';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  BookOpen,
  FileCode,
  Sparkles,
} from 'lucide-react';

export const PythonCodeTab: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState<'app' | 'requirements'>('app');

  const copyToClipboard = (text: string, type: 'app' | 'req') => {
    navigator.clipboard.writeText(text);
    if (type === 'app') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Mã Nguồn Python (Streamlit & OpenCV) Cho Máy Cá Nhân
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Dành cho giáo viên muốn chạy offline trực tiếp trên máy tính riêng bằng Python & Streamlit.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => downloadFile('requirements.txt', PYTHON_REQUIREMENTS)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-500" />
              <span>Tải requirements.txt</span>
            </button>

            <button
              onClick={() => downloadFile('app_streamlit.py', PYTHON_STREAMLIT_CODE)}
              className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Tải file app_streamlit.py</span>
            </button>
          </div>
        </div>

        {/* 4-Step Installation Guide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-xs">Cài đặt Python</h4>
            <p className="text-2xs text-slate-500 leading-relaxed">
              Tải Python 3.9 trở lên từ trang chính thức <code className="bg-slate-200 px-1 py-0.5 rounded">python.org</code>. Nhớ tick &quot;Add Python to PATH&quot;.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-xs">Cài đặt thư viện</h4>
            <p className="text-2xs text-slate-500 leading-relaxed">
              Mở Command Prompt / Terminal và chạy lệnh:
              <br />
              <code className="text-blue-700 font-mono font-bold block mt-1">
                pip install streamlit opencv-python pillow pandas
              </code>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-xs">Lưu file mã nguồn</h4>
            <p className="text-2xs text-slate-500 leading-relaxed">
              Nhấn nút &quot;Tải file app_streamlit.py&quot; ở trên hoặc copy toàn bộ mã vào một file tên <code className="bg-slate-200 px-1 py-0.5 rounded">app_streamlit.py</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-emerald-900 text-xs">Chạy ứng dụng</h4>
            <p className="text-2xs text-emerald-800 leading-relaxed">
              Khởi động ứng dụng bằng lệnh:
              <br />
              <code className="text-emerald-950 font-mono font-bold block mt-1 bg-emerald-100/70 p-1 rounded">
                streamlit run app_streamlit.py
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        {/* Code Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveCodeFile('app')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
                activeCodeFile === 'app'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>app_streamlit.py</span>
            </button>

            <button
              onClick={() => setActiveCodeFile('requirements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
                activeCodeFile === 'requirements'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>requirements.txt</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                copyToClipboard(
                  activeCodeFile === 'app' ? PYTHON_STREAMLIT_CODE : PYTHON_REQUIREMENTS,
                  activeCodeFile === 'app' ? 'app' : 'req'
                )
              }
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            >
              {copiedCode || copiedReq ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Body */}
        <pre className="p-6 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed max-h-[600px] selection:bg-blue-800">
          <code>
            {activeCodeFile === 'app' ? PYTHON_STREAMLIT_CODE : PYTHON_REQUIREMENTS}
          </code>
        </pre>
      </div>
    </div>
  );
};
