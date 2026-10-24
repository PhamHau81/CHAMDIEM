import React, { useState, useEffect } from 'react';
import { ExamKeyConfig } from '../types.ts';
import {
  X,
  Printer,
  Download,
  FileText,
  Copy,
  Scissors,
  Sparkles,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import {
  generateTestSheetCanvas,
  SheetStudentInfo,
} from '../utils/sheetGenerator.ts';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  examKeys: ExamKeyConfig[];
  selectedExamId: string;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  examKeys,
  selectedExamId,
}) => {
  const activeExam = examKeys.find((k) => k.id === selectedExamId) || examKeys[0];

  const [schoolName, setSchoolName] = useState('TRƯỜNG THPT: ................................................................');
  const [examTitle, setExamTitle] = useState(activeExam?.title || 'BÀI KIỂM TRA ĐỊNH KỲ');
  const [printLayout, setPrintLayout] = useState<'two_per_page' | 'a5_single' | 'a4_single'>('two_per_page');
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && activeExam) {
      renderSheet();
    }
  }, [isOpen, activeExam, schoolName, examTitle]);

  const renderSheet = () => {
    const studentInfo: SheetStudentInfo = {
      name: '.............................................................................',
      studentId: '......',
      examCode: activeExam.code,
      classRoom: '..................',
      schoolName,
      examTitle,
    };

    const dataUrl = generateTestSheetCanvas(
      studentInfo,
      activeExam.part1.length,
      activeExam.part2.length,
      undefined // Blank sheet for printing
    );
    setSheetPreviewUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!sheetPreviewUrl) return;
    const link = document.createElement('a');
    link.href = sheetPreviewUrl;
    link.download = `Phieu_tra_loi_trac_nghiem_ma_${activeExam.code}_300DPI.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    if (printLayout === 'two_per_page') {
      // 2 sheets per A4 portrait page (each sheet is exactly 1/2 A4 Landscape - A5)
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Phiếu Trả Lời Trắc Nghiệm (2 phiếu / A4 - Chuẩn 1/2 A4) - Mã ${activeExam.code}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
                background-color: #ffffff;
                box-sizing: border-box;
                font-family: "Times New Roman", Times, serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                overflow: hidden;
              }
              .print-container {
                width: 210mm;
                height: 297mm;
                box-sizing: border-box;
                padding: 4mm 5mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
              }
              .sheet-box {
                width: 200mm;
                height: 140mm;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                overflow: hidden;
              }
              .sheet-box img {
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
              .cut-line-wrap {
                width: 100%;
                height: 6mm;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
              }
              .cut-line {
                position: absolute;
                left: 2mm;
                right: 2mm;
                top: 50%;
                border-top: 1.5px dashed #475569;
              }
              .cut-tag {
                position: relative;
                background: #ffffff;
                padding: 0 8mm;
                font-size: 10.5px;
                font-weight: 600;
                color: #475569;
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 500);">
            <div class="print-container">
              <div class="sheet-box">
                <img src="${sheetPreviewUrl}" alt="Phiếu 1" />
              </div>
              <div class="cut-line-wrap">
                <div class="cut-line"></div>
                <div class="cut-tag">✂ ĐƯỜNG CẮT ĐÔI TỜ GIẤY A4 (MỖI NỬA LÀ 1 PHIẾU KHỔ A5 CHUẨN)</div>
              </div>
              <div class="sheet-box">
                <img src="${sheetPreviewUrl}" alt="Phiếu 2" />
              </div>
            </div>
          </body>
        </html>
      `);
    } else if (printLayout === 'a5_single') {
      // 1 sheet on A5 landscape
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Phiếu Trả Lời Trắc Nghiệm Chuẩn A5 (1/2 A4) - Mã ${activeExam.code}</title>
            <style>
              @page {
                size: A5 landscape;
                margin: 4mm;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 148.5mm;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                overflow: hidden;
              }
              .single-a5-wrap {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
              }
              .single-a5-wrap img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 500);">
            <div class="single-a5-wrap">
              <img src="${sheetPreviewUrl}" alt="Phiếu Khổ A5" />
            </div>
          </body>
        </html>
      `);
    } else {
      // 1 sheet on A4 landscape full page
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Phiếu Trả Lời Trắc Nghiệm Toàn Trang A4 - Mã ${activeExam.code}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 6mm;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 297mm;
                height: 210mm;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                overflow: hidden;
              }
              .single-a4-wrap {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
              }
              .single-a4-wrap img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 500);">
            <div class="single-a4-wrap">
              <img src="${sheetPreviewUrl}" alt="Phiếu Khổ A4" />
            </div>
          </body>
        </html>
      `);
    }

    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                In Phiếu Trả Lời Trắc Nghiệm — <span className="text-blue-700">HỖ TRỢ CHẤM BÀI _ PHẠM HẬU</span>
              </h2>
              <p className="text-2xs text-slate-500">
                Chuẩn 1/2 giấy A4 (Khổ A5) • To, rõ nét, chữ không nhoè • Khay cắt đôi chuẩn xác
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Controls */}
          <div className="md:col-span-5 space-y-4 text-xs">
            {/* Print Layout Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Chế độ in ra giấy:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPrintLayout('two_per_page')}
                  className={`py-2 px-2 rounded-lg font-bold transition-all text-center flex flex-col items-center justify-center text-2xs ${
                    printLayout === 'two_per_page'
                      ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5 mb-1 text-blue-600" />
                  <span>2 phiếu / Tờ A4</span>
                  <span className="text-3xs font-normal text-slate-400">(Khuyên dùng)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintLayout('a5_single')}
                  className={`py-2 px-2 rounded-lg font-bold transition-all text-center flex flex-col items-center justify-center text-2xs ${
                    printLayout === 'a5_single'
                      ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                  <span>1 phiếu (Khổ A5)</span>
                  <span className="text-3xs font-normal text-slate-400">(Vừa khít 1/2 A4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintLayout('a4_single')}
                  className={`py-2 px-2 rounded-lg font-bold transition-all text-center flex flex-col items-center justify-center text-2xs ${
                    printLayout === 'a4_single'
                      ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5 mb-1 text-purple-600" />
                  <span>1 phiếu (Khổ A4)</span>
                  <span className="text-3xs font-normal text-slate-400">(Toàn trang to)</span>
                </button>
              </div>
            </div>

            {/* Quality Note */}
            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-950 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-xs text-blue-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Chuẩn in 300 DPI — Chữ to rõ, không vỡ hạt</span>
              </div>
              <p className="text-2xs text-blue-700 leading-relaxed">
                Phiếu được thiết kế tỷ lệ vàng với kích thước chuẩn 1/2 giấy A4 (Khổ A5). Ô tô chì to tròn (bán kính 21px) giúp học sinh tô nhanh bằng bút chì 2B và camera máy quét nhận diện cực kỳ chính xác.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên Trường / Đơn vị:
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tiêu đề bài kiểm tra:
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-2xs text-slate-600">
              <span className="font-bold text-slate-800 block text-xs">Thông số đề thi:</span>
              <p>• Mã đề: <strong className="text-blue-700 font-mono font-bold">{activeExam.code}</strong> — Môn: <strong>{activeExam.subject}</strong></p>
              <p>• Phần 1 (4 lựa chọn A/B/C/D): <strong>{activeExam.part1.length} câu</strong></p>
              <p>• Phần 2 (Đúng / Sai Đ/S): <strong>{activeExam.part2.length} câu ({activeExam.part2.length * 4} ý con a,b,c,d)</strong></p>
              <p>• Độ phân giải in ấn: <strong className="text-emerald-700">2480 × 1754 px (300 DPI siêu nét)</strong></p>
            </div>
          </div>

          {/* Right Sheet Preview */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-100/80 border border-slate-200 rounded-xl p-3 sm:p-4 min-h-[380px] max-h-[520px] overflow-auto">
            {sheetPreviewUrl ? (
              <div className="flex flex-col items-center space-y-2 w-full">
                <img
                  src={sheetPreviewUrl}
                  alt="Phiếu trả lời trắc nghiệm"
                  className="max-h-[440px] w-auto shadow-md rounded border border-slate-300 bg-white"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <span className="text-2xs text-slate-500 font-medium text-center">
                  {printLayout === 'two_per_page'
                    ? 'Ảnh xem trước 1 phiếu (Khi in 1 tờ A4 sẽ tự động ghép 2 phiếu đối xứng kèm vạch cắt)'
                    : printLayout === 'a5_single'
                    ? 'Ảnh xem trước khổ A5 (1/2 A4 vừa khít)'
                    : 'Ảnh xem trước khổ A4 to'}
                </span>
              </div>
            ) : (
              <div className="text-slate-400 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
                <span>Đang dựng bản in độ nét cao...</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-xs"
              title="Tải ảnh PNG độ phân giải cao 300 DPI để chèn vào Word hoặc in tại tiệm"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span>Tải Ảnh PNG (300 DPI)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>
                {printLayout === 'two_per_page'
                  ? 'In 2 Phiếu / 1 Tờ A4'
                  : printLayout === 'a5_single'
                  ? 'In Phiếu Khổ A5'
                  : 'In Phiếu Khổ A4'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
