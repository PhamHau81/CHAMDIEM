import { GradingResult, ExamKeyConfig } from '../types.ts';

/**
 * Export Class Scoreboard to standard vnEdu / SMAS compatible Excel CSV
 */
export function exportToVnEduSMAS(records: GradingResult[], examTitle: string = 'Kiểm tra') {
  if (records.length === 0) return;

  const headers = [
    'STT',
    'Số báo danh (SBD)',
    'Họ và tên học sinh',
    'Mã đề',
    'Điểm hệ số 1 (Định kỳ)',
    'Số câu đúng P1',
    'Số ý đúng P2',
    'Ghi chú',
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    `"${r.studentId}"`,
    `"${r.studentName}"`,
    `"${r.examCode}"`,
    r.totalScore,
    `"${r.part1Correct}/${r.part1Total}"`,
    `"${r.part2CorrectStatements}/${r.part2TotalStatements}"`,
    `"Chấm tự động AI"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [`# DANH SÁCH ĐIỂM KIỂM TRA — ${examTitle}`, headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );

  downloadBlob(
    csvContent,
    `Bang_Diem_vnEdu_SMAS_${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Export Individual Student Performance Report to Microsoft Word (.doc / .docx compatible)
 */
export function exportStudentWordReport(result: GradingResult, exam?: ExamKeyConfig) {
  const dateStr = new Date(result.timestamp).toLocaleDateString('vi-VN');

  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Phiếu Báo Điểm - ${result.studentName}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #111; margin: 20px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { vertical-align: top; font-size: 11pt; }
    .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 15px 0 5px 0; color: #1e3a8a; text-transform: uppercase; }
    .subtitle { text-align: center; font-size: 12pt; font-style: italic; margin-bottom: 20px; }
    .info-box { border: 1px solid #94a3b8; background-color: #f8fafc; padding: 12px; margin-bottom: 20px; border-radius: 6px; }
    .score-banner { text-align: center; font-size: 20pt; font-weight: bold; color: #b91c1c; margin: 15px 0; padding: 10px; background: #fee2e2; border: 2px dashed #ef4444; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    table.data-table th, table.data-table td { border: 1px solid #334155; padding: 8px; text-align: center; font-size: 11pt; }
    table.data-table th { background-color: #e2e8f0; font-weight: bold; }
    .feedback-box { margin-top: 20px; padding: 12px; background: #ecfdf5; border-left: 4px solid #10b981; }
    .wrong-answer { color: #dc2626; font-weight: bold; }
    .correct-answer { color: #16a34a; font-weight: bold; }
    .signature { width: 100%; margin-top: 40px; border-collapse: collapse; }
    .signature td { text-align: center; vertical-align: top; width: 50%; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="text-align: left; width: 50%;">
        <strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO</strong><br>
        <strong>TRƯỜNG THPT CHUYÊN</strong>
      </td>
      <td style="text-align: right; width: 50%;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
        <em>Độc lập – Tự do – Hạnh phúc</em>
      </td>
    </tr>
  </table>

  <div class="title">PHIẾU BÁO KẾT QUẢ KIỂM TRA TRẮC NGHIỆM</div>
  <div class="subtitle">${result.matchedExamTitle || 'BÀI KIỂM TRA ĐỊNH KỲ'} — Ngày: ${dateStr}</div>

  <div class="info-box">
    <table style="width: 100%;">
      <tr>
        <td><strong>Họ và tên học sinh:</strong> ${result.studentName}</td>
        <td><strong>Số báo danh:</strong> ${result.studentId}</td>
      </tr>
      <tr>
        <td><strong>Mã đề thi:</strong> ${result.examCode}</td>
        <td><strong>Thời gian chấm:</strong> ${new Date(result.timestamp).toLocaleTimeString('vi-VN')}</td>
      </tr>
    </table>
  </div>

  <div class="score-banner">
    TỔNG ĐIỂM BÀI THI: ${result.totalScore} / 10.0
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>Nội dung phần thi</th>
        <th>Số câu/ý đúng</th>
        <th>Tổng số câu</th>
        <th>Điểm thành phần</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: left;"><strong>Phần I:</strong> Trắc nghiệm 4 lựa chọn (A, B, C, D)</td>
        <td>${result.part1Correct} câu</td>
        <td>${result.part1Total} câu</td>
        <td><strong>${result.part1Score} đ</strong></td>
      </tr>
      <tr>
        <td style="text-align: left;"><strong>Phần II:</strong> Trắc nghiệm Đúng / Sai</td>
        <td>${result.part2CorrectStatements} ý</td>
        <td>${result.part2TotalStatements} ý</td>
        <td><strong>${result.part2Score} đ</strong></td>
      </tr>
      <tr style="background: #f1f5f9; font-weight: bold;">
        <td style="text-align: left;">TỔNG KẾT TOÀN BÀI</td>
        <td>${result.totalCorrectQuestions} mục</td>
        <td>${result.totalQuestions} mục</td>
        <td style="color: #b91c1c; font-size: 13pt;">${result.totalScore} đ</td>
      </tr>
    </tbody>
  </table>

  ${
    result.aiFeedback
      ? `
  <div class="feedback-box">
    <h3 style="margin-top: 0; color: #065f46;">ĐÁNH GIÁ SƯ PHẠM TỪ TRỢ LÝ GIÁO VIÊN AI:</h3>
    <p><strong>Nhận xét:</strong> ${result.aiFeedback.overallAssessment}</p>
    <p><strong>Điểm mạnh:</strong> ${result.aiFeedback.strengths.join(', ')}</p>
    <p><strong>Kiến thức cần củng cố:</strong> ${result.aiFeedback.weaknesses.join(', ')}</p>
    <p><strong>Chủ đề nên ôn tập ngay:</strong> ${result.aiFeedback.recommendedTopics.join(', ')}</p>
  </div>
  `
      : ''
  }

  <table class="signature">
    <tr>
      <td>
        <em>Ý kiến phụ huynh học sinh</em><br><br><br><br>
        (Ký và ghi rõ họ tên)
      </td>
      <td>
        <em>Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em><br>
        <strong>GIÁO VIÊN BỘ MÔN</strong><br><br><br><br>
        (Ký và ghi rõ họ tên)
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  downloadBlob(
    htmlContent,
    `Phieu_Diem_${result.studentName.replace(/\s+/g, '_')}_SBD_${result.studentId}.doc`,
    'application/msword;charset=utf-8'
  );
}

/**
 * Export Class Question Review Slides (.html / presentation deck) for teacher projection
 */
export function exportPresentationSlides(records: GradingResult[]) {
  if (records.length === 0) return;

  const total = records.length;
  const avg = (records.reduce((acc, r) => acc + r.totalScore, 0) / total).toFixed(2);
  const excellent = records.filter((r) => r.totalScore >= 8.5).length;
  const good = records.filter((r) => r.totalScore >= 7.0 && r.totalScore < 8.5).length;
  const avgCount = records.filter((r) => r.totalScore >= 5.0 && r.totalScore < 7.0).length;
  const weak = records.filter((r) => r.totalScore < 5.0).length;

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bài Giảng Chữa Bài Kiểm Tra Trắc Nghiệm</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: white; margin: 0; padding: 40px; }
    .slide { background: #1e293b; border-radius: 24px; padding: 50px; margin-bottom: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); min-height: 480px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #334155; }
    h1 { font-size: 38px; color: #38bdf8; margin-top: 0; }
    h2 { font-size: 28px; color: #f8fafc; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 40px 0; }
    .stat-card { background: #0f172a; padding: 24px; border-radius: 16px; text-align: center; border: 1px solid #334155; }
    .stat-val { font-size: 40px; font-weight: 800; color: #38bdf8; }
    .stat-lbl { font-size: 14px; color: #94a3b8; text-transform: uppercase; margin-top: 8px; }
    .footer { font-size: 13px; color: #64748b; border-top: 1px solid #334155; padding-top: 15px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="slide">
    <div>
      <span style="background: #0284c7; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: bold;">SLIDE 1: TỔNG QUAN</span>
      <h1>BÁO CÁO KẾT QUẢ BÀI KIỂM TRA TRẮC NGHIỆM</h1>
      <p style="font-size: 18px; color: #94a3b8;">Phân tích kết quả học tập & Chữa các câu hỏi trọng tâm</p>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Học sinh dự thi</div></div>
        <div class="stat-card"><div class="stat-val" style="color: #34d399;">${avg}</div><div class="stat-lbl">Điểm trung bình</div></div>
        <div class="stat-card"><div class="stat-val" style="color: #fbbf24;">${excellent + good}</div><div class="stat-lbl">Đạt Khá - Giỏi</div></div>
        <div class="stat-card"><div class="stat-val" style="color: #f87171;">${weak}</div><div class="stat-lbl">Cần củng cố (&lt; 5.0)</div></div>
      </div>
    </div>
    <div class="footer">
      <span>HỆ THỐNG HỖ TRỢ CHẤM BÀI _ PHẠM HẬU</span>
      <span>Dành cho máy chiếu lớp học</span>
    </div>
  </div>

  <div class="slide">
    <div>
      <span style="background: #10b981; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: bold;">SLIDE 2: PHÂN BỐ PHỔ ĐIỂM</span>
      <h2>BIỂU ĐỒ PHÂN BỐ THÀNH TÍCH CỦA LỚP</h2>
      <div style="margin: 40px 0; font-size: 18px; line-height: 2;">
        <div style="background: #064e3b; padding: 16px; border-radius: 12px; margin-bottom: 12px;">🌟 <strong>Xuất sắc (8.5 - 10.0):</strong> ${excellent} học sinh (${Math.round((excellent / total) * 100)}%)</div>
        <div style="background: #1e3a8a; padding: 16px; border-radius: 12px; margin-bottom: 12px;">📘 <strong>Khá / Tốt (7.0 - 8.4):</strong> ${good} học sinh (${Math.round((good / total) * 100)}%)</div>
        <div style="background: #78350f; padding: 16px; border-radius: 12px; margin-bottom: 12px;">📙 <strong>Trung bình (5.0 - 6.9):</strong> ${avgCount} học sinh (${Math.round((avgCount / total) * 100)}%)</div>
        <div style="background: #881337; padding: 16px; border-radius: 12px;">⚠️ <strong>Cần phụ đạo (&lt; 5.0):</strong> ${weak} học sinh (${Math.round((weak / total) * 100)}%)</div>
      </div>
    </div>
    <div class="footer">
      <span>Mục tiêu tiết học: Giải đáp toàn bộ các câu hỏi có tỷ lệ sai cao</span>
      <span>Trang 2/2</span>
    </div>
  </div>
</body>
</html>`;

  downloadBlob(
    html,
    `Slide_Chua_Bai_Trac_Nghiem_${new Date().toISOString().split('T')[0]}.html`,
    'text/html;charset=utf-8'
  );
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
