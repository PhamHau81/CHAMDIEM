import React, { useState } from 'react';
import { GradingResult } from '../types.ts';
import {
  Download,
  Trash2,
  Eye,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  FileSpreadsheet,
  BarChart3,
  ListFilter,
  AlertTriangle,
  Presentation,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  exportToVnEduSMAS,
  exportPresentationSlides,
} from '../utils/exportHelpers.ts';

interface ClassScoreboardTabProps {
  records: GradingResult[];
  onSelectRecord: (result: GradingResult) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const ClassScoreboardTab: React.FC<ClassScoreboardTabProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}) => {
  const [subTab, setSubTab] = useState<'list' | 'analytics' | 'item_analysis'>('list');

  // Statistics
  const totalCount = records.length;
  const avgScore =
    totalCount > 0
      ? Math.round((records.reduce((acc, r) => acc + r.totalScore, 0) / totalCount) * 100) / 100
      : 0;

  const maxScore = totalCount > 0 ? Math.max(...records.map((r) => r.totalScore)) : 0;
  const minScore = totalCount > 0 ? Math.min(...records.map((r) => r.totalScore)) : 0;

  // Grade distributions
  const excellentCount = records.filter((r) => r.totalScore >= 8.5).length;
  const goodCount = records.filter((r) => r.totalScore >= 7.0 && r.totalScore < 8.5).length;
  const avgCount = records.filter((r) => r.totalScore >= 5.0 && r.totalScore < 7.0).length;
  const weakCount = records.filter((r) => r.totalScore < 5.0).length;

  // Calculate Item Analysis (Question Difficulty & Answer Distribution)
  const itemAnalysis = React.useMemo(() => {
    if (records.length === 0) return [];

    // Collect max questions in Part 1 from records
    const maxP1 = Math.max(...records.map((r) => r.part1Details?.length || 0));
    const items = [];

    for (let q = 1; q <= maxP1; q++) {
      let countA = 0;
      let countB = 0;
      let countC = 0;
      let countD = 0;
      let countOther = 0;
      let countCorrect = 0;
      let totalAnswered = 0;
      let correctAnswer = '';

      records.forEach((r) => {
        const p1Item = r.part1Details?.find((d) => d.questionNumber === q);
        if (p1Item) {
          totalAnswered++;
          correctAnswer = p1Item.correctAnswer;
          if (p1Item.isCorrect) countCorrect++;

          if (p1Item.studentAnswer === 'A') countA++;
          else if (p1Item.studentAnswer === 'B') countB++;
          else if (p1Item.studentAnswer === 'C') countC++;
          else if (p1Item.studentAnswer === 'D') countD++;
          else countOther++;
        }
      });

      if (totalAnswered > 0) {
        const correctRate = Math.round((countCorrect / totalAnswered) * 100);
        items.push({
          questionNumber: q,
          correctAnswer,
          totalAnswered,
          countCorrect,
          correctRate,
          isDifficult: correctRate < 50,
          dist: {
            A: Math.round((countA / totalAnswered) * 100),
            B: Math.round((countB / totalAnswered) * 100),
            C: Math.round((countC / totalAnswered) * 100),
            D: Math.round((countD / totalAnswered) * 100),
          },
        });
      }
    }

    return items;
  }, [records]);

  // Export to CSV with UTF-8 BOM
  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'STT',
      'Họ và tên thí sinh',
      'Số báo danh (SBD)',
      'Mã đề thi',
      'Điểm tổng kết (thang 10)',
      'Tổng câu đúng toàn bài',
      'Thống kê riêng Phần Đúng/Sai',
      'Điểm Phần 1',
      'Điểm Phần 2 (Đúng/Sai)',
      'Thời gian chấm',
    ];

    const rows = records.map((r, idx) => [
      idx + 1,
      `"${r.studentName}"`,
      `"${r.studentId}"`,
      `"${r.examCode}"`,
      r.totalScore,
      `"${r.totalCorrectQuestions}/${r.totalQuestions}"`,
      `"${r.part2CorrectStatements}/${r.part2TotalStatements}"`,
      r.part1Score,
      r.part2Score,
      `"${new Date(r.timestamp).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_diem_lop_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <span>Sổ Điểm & Báo Cáo Thống Kê Cả Lớp</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Lưu trữ danh sách bài thi, phân tích phổ điểm (D3) và xuất file Excel / vnEdu / SMAS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {records.length > 0 && (
              <>
                <button
                  onClick={() => exportToVnEduSMAS(records)}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
                  title="Xuất định dạng cột chuẩn vnEdu và SMAS"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  <span>Mẫu vnEdu / SMAS</span>
                </button>

                <button
                  onClick={() => exportPresentationSlides(records)}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                  title="Xuất slide chữa bài để giáo viên trình chiếu trên lớp"
                >
                  <Presentation className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  <span>Xuất Slide Chữa Bài</span>
                </button>

                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>Xuất Excel</span>
                </button>

                <button
                  onClick={onClearAll}
                  className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Xóa hết</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase block">
              Tổng số bài đã chấm
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {totalCount} bài
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-xs text-blue-700 font-semibold uppercase block">
              Điểm trung bình lớp
            </span>
            <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
              {avgScore} / 10
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold uppercase block">
              Điểm cao nhất
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
              {maxScore} điểm
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase block">
              Tỷ lệ đạt (&gt;= 5.0)
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {totalCount > 0 ? Math.round(((totalCount - weakCount) / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setSubTab('list')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Danh Sách Bài Thi ({totalCount})</span>
          </button>

          <button
            onClick={() => setSubTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Phổ Điểm & Trực Quan Hóa (D3)</span>
          </button>

          <button
            onClick={() => setSubTab('item_analysis')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'item_analysis'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Phân Tích Ma Trận Đề Thi ({itemAnalysis.length} câu)</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: RECORD LIST */}
      {subTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">
            Danh Sách Bài Thi Đã Chấm ({records.length})
          </h3>

          {records.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-4">Họ và tên thí sinh</th>
                    <th className="py-3 px-3">Số báo danh</th>
                    <th className="py-3 px-3">Mã đề</th>
                    <th className="py-3 px-3 text-center">Tổng câu đúng</th>
                    <th className="py-3 px-3 text-center">Phần Đúng/Sai</th>
                    <th className="py-3 px-4 text-right">Điểm số</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{r.studentId}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold font-mono text-2xs">
                          {r.examCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {r.totalCorrectQuestions} / {r.totalQuestions}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-2xs border border-emerald-200">
                          {r.part2CorrectStatements} / {r.part2TotalStatements} ý
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-base text-blue-700">
                          {r.totalScore}
                        </span>
                        <span className="text-slate-400 text-2xs"> / 10</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectRecord(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Xem chi tiết bài thi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(r.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Xóa bài này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">Chưa có bài thi nào trong sổ điểm</p>
              <p className="text-xs">
                Hãy chụp hoặc tải ảnh phiếu thi ở thẻ &quot;Chụp / Tải Phiếu Chấm Điểm&quot; để bắt đầu.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SCORE DISTRIBUTION & ANALYTICS (D3 / SVG) */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          {totalCount > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Phân Phối Nhóm Học Lực Của Lớp:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="block font-black text-2xl text-emerald-700">{excellentCount}</span>
                    <span className="font-bold">Xuất sắc (8.5 - 10)</span>
                    <span className="block text-[11px] text-emerald-600 mt-1">
                      {Math.round((excellentCount / totalCount) * 100)}% tổng số
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                    <span className="block font-black text-2xl text-blue-700">{goodCount}</span>
                    <span className="font-bold">Khá / Giỏi (7.0 - 8.4)</span>
                    <span className="block text-[11px] text-blue-600 mt-1">
                      {Math.round((goodCount / totalCount) * 100)}% tổng số
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <span className="block font-black text-2xl text-amber-700">{avgCount}</span>
                    <span className="font-bold">Trung bình (5.0 - 6.9)</span>
                    <span className="block text-[11px] text-amber-600 mt-1">
                      {Math.round((avgCount / totalCount) * 100)}% tổng số
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                    <span className="block font-black text-2xl text-rose-700">{weakCount}</span>
                    <span className="font-bold">Cần phụ đạo (&lt; 5.0)</span>
                    <span className="block text-[11px] text-rose-600 mt-1">
                      {Math.round((weakCount / totalCount) * 100)}% tổng số
                    </span>
                  </div>
                </div>
              </div>

              {/* D3-Style SVG Histogram Chart */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Đồ Thị Phổ Điểm Chi Tiết (Histogram 10 Thang Điểm)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Trực quan hóa trực tiếp</span>
                </div>

                <div className="w-full overflow-x-auto pt-6 pb-2">
                  <div className="min-w-[600px] h-[240px] flex items-end gap-3 px-4 border-b-2 border-slate-300">
                    {Array.from({ length: 10 }, (_, i) => {
                      const lower = i;
                      const upper = i + 1;
                      const count = records.filter(
                        (r) =>
                          r.totalScore >= lower && (upper === 10 ? r.totalScore <= upper : r.totalScore < upper)
                      ).length;
                      const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                      const barHeight = totalCount > 0 ? Math.max(12, (count / totalCount) * 200) : 12;

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                          {/* Value tooltip */}
                          <span className="text-[11px] font-bold text-slate-700 mb-1">
                            {count > 0 ? `${count} hs` : ''}
                          </span>

                          {/* Bar */}
                          <div
                            style={{ height: `${barHeight}px` }}
                            className={`w-full rounded-t-lg transition-all cursor-pointer ${
                              i >= 8
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-110'
                                : i >= 6
                                ? 'bg-gradient-to-t from-blue-600 to-blue-400 group-hover:brightness-110'
                                : i >= 5
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300 group-hover:brightness-110'
                                : 'bg-gradient-to-t from-rose-500 to-rose-300 group-hover:brightness-110'
                            }`}
                          />

                          {/* Label */}
                          <span className="text-[11px] font-semibold text-slate-600 mt-2 whitespace-nowrap">
                            [{lower}-{upper}]
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Chưa có dữ liệu để vẽ biểu đồ phổ điểm.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ITEM ANALYSIS (MA TRẬN ĐỀ THI) */}
      {subTab === 'item_analysis' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Phân Tích Độ Khó & Ma Trận Câu Hỏi (Item Analysis)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem tỷ lệ học sinh chọn từng phương án A, B, C, D để phát hiện các câu hỏi bẫy hoặc học sinh bị hổng kiến thức.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Câu khó (&lt; 50% đúng)
              </span>
            </div>
          </div>

          {itemAnalysis.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Câu</th>
                    <th className="py-3 px-3 text-center">Đáp án đúng</th>
                    <th className="py-3 px-3 text-center">% Trả lời đúng</th>
                    <th className="py-3 px-3 text-center">% Chọn A</th>
                    <th className="py-3 px-3 text-center">% Chọn B</th>
                    <th className="py-3 px-3 text-center">% Chọn C</th>
                    <th className="py-3 px-3 text-center">% Chọn D</th>
                    <th className="py-3 px-4">Đánh giá sư phạm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemAnalysis.map((item) => (
                    <tr
                      key={item.questionNumber}
                      className={`hover:bg-slate-50 transition-colors ${
                        item.isDifficult ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-800">
                        Câu {item.questionNumber}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-black">
                          {item.correctAnswer}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-black text-sm ${
                            item.correctRate >= 70
                              ? 'text-emerald-600'
                              : item.correctRate >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {item.correctRate}%
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-mono ${
                          item.correctAnswer === 'A' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-600'
                        }`}
                      >
                        {item.dist.A}%
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-mono ${
                          item.correctAnswer === 'B' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-600'
                        }`}
                      >
                        {item.dist.B}%
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-mono ${
                          item.correctAnswer === 'C' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-600'
                        }`}
                      >
                        {item.dist.C}%
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-mono ${
                          item.correctAnswer === 'D' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-600'
                        }`}
                      >
                        {item.dist.D}%
                      </td>
                      <td className="py-3 px-4">
                        {item.isDifficult ? (
                          <span className="text-rose-700 font-bold flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Câu bẫy / Nhiều em sai — Cần chữa kỹ</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Học sinh nắm vững</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              Chưa có dữ liệu bài thi để phân tích ma trận.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
