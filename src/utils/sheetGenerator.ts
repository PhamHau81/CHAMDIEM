/**
 * Utility to generate standardized 1/2 A4 test answer sheets ("Chuẩn 1/2 giấy A4 - To, rõ nét, đẹp mắt, không nhoè")
 * Dimensions: 1/2 A4 Landscape (2480 × 1754 px - Khổ A5 chuẩn in 300 DPI siêu nét)
 * Typography: Times New Roman & Plus Jakarta Sans, font to rõ ràng, độ tương phản cao
 */

export interface SheetStudentInfo {
  name: string;
  studentId: string; // e.g. "120401"
  examCode: string; // e.g. "101"
  classRoom: string;
  schoolName?: string;
  examTitle?: string;
}

export interface StudentAnswersMock {
  part1: Record<number, 'A' | 'B' | 'C' | 'D' | 'BLANK'>;
  part2: Record<number, Record<'a' | 'b' | 'c' | 'd', 'Đ' | 'S' | 'BLANK'>>;
}

/**
 * Draws a standardized Answer Sheet: Chuẩn 1/2 giấy A4 (Khổ A5: 2480 × 1754 px tại 300 DPI)
 * Chuẩn chữ to rõ ràng, không nhoè, tỷ lệ vàng cân đối, đẹp mắt
 */
export function generateTestSheetCanvas(
  studentInfo: SheetStudentInfo,
  part1Count: number = 12,
  part2Count: number = 4,
  filledAnswers?: StudentAnswersMock
): string {
  // Standard A5 landscape 300 DPI: 210mm x 148.5mm (2480 x 1754 pixels)
  const width = 2480;
  const height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sharp text & line rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background - Pure white clean exam paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 4 Optical Registration Markers (Góc định vị quang học cho máy quét / camera nhận dạng chính xác)
  // L-shaped solid markers: 48px long, 14px thick
  const drawCornerMarker = (x: number, y: number, dirX: number, dirY: number) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, dirX * 48, dirY * 14);
    ctx.fillRect(x, y, dirX * 14, dirY * 48);
  };
  drawCornerMarker(28, 28, 1, 1);
  drawCornerMarker(width - 28, 28, -1, 1);
  drawCornerMarker(28, height - 28, 1, -1);
  drawCornerMarker(width - 28, height - 28, -1, -1);

  // Outer border with safe margin (Khung viền đôi trang trọng chuẩn đề thi)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(52, 52, width - 104, height - 104);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Typography Constants (Cỡ chữ to, rõ, chuẩn in ấn không bị nhoè vỡ hạt)
  const FONT_SERIF_TITLE = 'bold 36px "Times New Roman", Times, serif';
  const FONT_SERIF_SUBTITLE = 'bold italic 22px "Times New Roman", Times, serif';
  const FONT_SERIF_BOLD_26 = 'bold 26px "Times New Roman", Times, serif';
  const FONT_SERIF_STD_25 = '25px "Times New Roman", Times, serif';
  const FONT_SERIF_SECTION = 'bold 24px "Times New Roman", Times, serif';
  const FONT_SANS_BUBBLE = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
  const FONT_SANS_BUBBLE_SM = 'bold 20px "Plus Jakarta Sans", Arial, sans-serif';
  const FONT_MONO_BOLD_32 = 'bold 32px "JetBrains Mono", Consolas, monospace';
  const FONT_MONO_BOLD_36 = 'bold 36px "JetBrains Mono", Consolas, monospace';

  // Helper to draw crisp, high-contrast answer bubbles
  const drawBubble = (cx: number, cy: number, label: string, isFilled: boolean, radius: number = 22) => {
    ctx.save();
    if (isFilled) {
      // Filled bubble with realistic dark pencil graphite
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Soft graphite pencil texture highlight
      ctx.beginPath();
      ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#3f3f46';
      ctx.fill();

      // Sharp white text inside bubble
      ctx.font = radius >= 21 ? FONT_SANS_BUBBLE : FONT_SANS_BUBBLE_SM;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
    } else {
      // Unfilled crisp circle with high-contrast border
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Dark text inside circle
      ctx.font = radius >= 21 ? FONT_SANS_BUBBLE : FONT_SANS_BUBBLE_SM;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
    }
    ctx.restore();
  };

  const leftMargin = 85;
  const rightMargin = width - 85;
  const contentWidth = rightMargin - leftMargin;

  // =========================================================================
  // HEADER SECTION: THÔNG TIN TRƯỜNG, BÀI THI, HỌ TÊN, SBD & MÃ ĐỀ
  // =========================================================================
  // Dòng 1: Tên Trường & Tiêu đề phiếu
  const row1Y = 105;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = FONT_SERIF_BOLD_26;
  ctx.fillText(
    studentInfo.schoolName || 'TRƯỜNG: ............................................................................',
    leftMargin,
    row1Y
  );

  ctx.textAlign = 'right';
  ctx.font = FONT_SERIF_TITLE;
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('PHIẾU TRẢ LỜI TRẮC NGHIỆM', rightMargin, row1Y);

  // Dòng phụ: Tiêu đề bài thi bên phải
  if (studentInfo.examTitle) {
    ctx.textAlign = 'right';
    ctx.font = FONT_SERIF_SUBTITLE;
    ctx.fillStyle = '#475569';
    ctx.fillText(studentInfo.examTitle, rightMargin, row1Y + 34);
  }

  // Dòng 2: Thông tin thí sinh & Mã Đề, SBD
  const row2Y = 180;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e293b';
  ctx.font = FONT_SERIF_STD_25;

  ctx.fillText(
    'Họ và tên: ' + (studentInfo.name || '.............................................................................'),
    leftMargin,
    row2Y
  );
  ctx.fillText('Lớp: ' + (studentInfo.classRoom || '..................'), leftMargin + 850, row2Y);
  ctx.fillText('Ngày thi: ....../...... / 202......', leftMargin + 1150, row2Y);

  // Khung SỐ BÁO DANH (SBD) to, số sắc nét
  const sbdBoxX = leftMargin + 1620;
  ctx.textAlign = 'left';
  ctx.font = FONT_SERIF_BOLD_26;
  ctx.fillStyle = '#0f172a';
  ctx.fillText('SBD:', sbdBoxX, row2Y);

  const sbdInputX = sbdBoxX + 68;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(sbdInputX, row2Y - 32, 230, 46);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(sbdInputX + 1, row2Y - 31, 228, 44);

  ctx.font = FONT_MONO_BOLD_32;
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText(studentInfo.studentId || '120401', sbdInputX + 115, row2Y);

  // Khung MÃ ĐỀ THI nổi bật, viền màu đậm
  const examCodeBoxX = leftMargin + 1960;
  ctx.textAlign = 'left';
  ctx.font = FONT_SERIF_BOLD_26;
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('MÃ ĐỀ:', examCodeBoxX, row2Y);

  const examCodeInputX = examCodeBoxX + 105;
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.8;
  ctx.strokeRect(examCodeInputX, row2Y - 34, 180, 50);
  ctx.fillStyle = '#e0e7ff';
  ctx.fillRect(examCodeInputX + 1, row2Y - 33, 178, 48);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = FONT_MONO_BOLD_36;
  ctx.textAlign = 'center';
  ctx.fillText(studentInfo.examCode || '101', examCodeInputX + 90, row2Y + 2);

  // Dòng 3: Khung Hướng dẫn tô bút chì chuẩn (Rõ ràng, trực quan, chuyên nghiệp)
  const instructY = 224;
  const instructH = 46;
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(leftMargin, instructY, contentWidth, instructH, 6);
  ctx.fill();
  ctx.stroke();

  // Text hướng dẫn
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 20px "Times New Roman", Times, serif';
  ctx.fillText('LƯU Ý: Giữ phiếu phẳng, không làm rách hoặc gập mép. Dùng bút chì 2B tô kín ô tròn:', leftMargin + 16, instructY + 29);

  // Mẫu tô đúng / sai trực quan
  const guideBaseX = leftMargin + 820;
  // 1. Tô Đúng: ●
  drawBubble(guideBaseX + 30, instructY + 23, 'A', true, 16);
  ctx.font = 'bold 18px "Times New Roman", Times, serif';
  ctx.fillStyle = '#15803d';
  ctx.textAlign = 'left';
  ctx.fillText('ĐÚNG', guideBaseX + 55, instructY + 29);

  // 2. Tô Sai: gạch chéo, chấm, nửa vời
  const wrongBaseX = guideBaseX + 170;
  ctx.font = 'bold 18px "Times New Roman", Times, serif';
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('SAI:', wrongBaseX, instructY + 29);

  // Mẫu sai 1: gạch chéo
  const w1X = wrongBaseX + 70;
  drawBubble(w1X, instructY + 23, 'B', false, 16);
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(w1X - 11, instructY + 12);
  ctx.lineTo(w1X + 11, instructY + 34);
  ctx.moveTo(w1X + 11, instructY + 12);
  ctx.lineTo(w1X - 11, instructY + 34);
  ctx.stroke();

  // Mẫu sai 2: dấu tick
  const w2X = wrongBaseX + 120;
  drawBubble(w2X, instructY + 23, 'C', false, 16);
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(w2X - 8, instructY + 23);
  ctx.lineTo(w2X - 1, instructY + 30);
  ctx.lineTo(w2X + 10, instructY + 14);
  ctx.stroke();

  // Mẫu sai 3: chấm nhỏ ở giữa
  const w3X = wrongBaseX + 170;
  drawBubble(w3X, instructY + 23, 'D', false, 16);
  ctx.beginPath();
  ctx.arc(w3X, instructY + 23, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Dòng kẻ ngăn cách Header sắc nét
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftMargin, 288);
  ctx.lineTo(rightMargin, 288);
  ctx.stroke();

  // =========================================================================
  // QUESTION SECTIONS: PHẦN I & PHẦN II (TỰ ĐỘNG CÂN CHỈNH VỪA VẶN TRANG GIẤY)
  // =========================================================================
  const questionsStartY = 308;
  const footerReservedY = height - 70;
  const availableContentHeight = footerReservedY - questionsStartY;

  const hasPart1 = part1Count > 0;
  const hasPart2 = part2Count > 0;

  // Tính số cột của Phần 1 tùy theo số câu
  let numP1Cols = 3;
  if (part1Count > 24) numP1Cols = 5;
  else if (part1Count > 12) numP1Cols = 4;
  else numP1Cols = 3;

  const p1QuestionsPerCol = hasPart1 ? Math.ceil(part1Count / numP1Cols) : 0;

  // Phân bổ chiều cao giữa Phần 1 và Phần 2
  const bannerHeight = 44;
  const sectionGap = 20;

  let p1RowHeight = 64;
  let p2RowHeight = 115;

  if (hasPart1 && hasPart2) {
    // Cả 2 phần cùng có mặt: cân bằng tỷ lệ để vừa khít trang
    const netAvailable = availableContentHeight - bannerHeight * 2 - sectionGap * 2;
    const weightP1 = Math.max(1, p1QuestionsPerCol * 1.0);
    const weightP2 = Math.max(1, part2Count * 2.2);
    const totalWeight = weightP1 + weightP2;

    p1RowHeight = Math.min(74, Math.max(48, Math.floor((netAvailable * (weightP1 / totalWeight)) / p1QuestionsPerCol)));
    p2RowHeight = Math.min(145, Math.max(88, Math.floor((netAvailable * (weightP2 / totalWeight)) / part2Count)));
  } else if (hasPart1) {
    p1RowHeight = Math.min(80, Math.max(50, Math.floor((availableContentHeight - bannerHeight - 40) / p1QuestionsPerCol)));
  } else if (hasPart2) {
    p2RowHeight = Math.min(160, Math.max(95, Math.floor((availableContentHeight - bannerHeight - 40) / part2Count)));
  }

  // =========================================================================
  // PHẦN I: TRẮC NGHIỆM 4 PHƯƠNG ÁN (A, B, C, D)
  // =========================================================================
  let p1EndY = questionsStartY;
  if (hasPart1) {
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(leftMargin, questionsStartY, contentWidth, bannerHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = FONT_SERIF_SECTION;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'PHẦN I. TRẮC NGHIỆM 4 PHƯƠNG ÁN (A, B, C, D) — Mỗi câu chỉ chọn 1 đáp án',
      leftMargin + 18,
      questionsStartY + bannerHeight / 2
    );

    const colWidth = contentWidth / numP1Cols;
    const p1Options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const p1FirstRowY = questionsStartY + bannerHeight + 36;

    for (let i = 1; i <= part1Count; i++) {
      const colIdx = Math.floor((i - 1) / p1QuestionsPerCol);
      const rowIdx = (i - 1) % p1QuestionsPerCol;
      const baseX = leftMargin + 12 + colIdx * colWidth;
      const baseY = p1FirstRowY + rowIdx * p1RowHeight;

      // Nhãn Câu (To, rõ ràng font 25px bold)
      ctx.fillStyle = '#0f172a';
      ctx.font = FONT_SERIF_BOLD_26;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const qNumLabel = i < 10 ? `Câu  ${i}:` : `Câu ${i}:`;
      ctx.fillText(qNumLabel, baseX, baseY);

      // Ô tròn A, B, C, D to rõ ràng (radius 21.5px, khoảng cách rộng rãi 76px)
      const filledOpt = filledAnswers?.part1?.[i];
      const bubbleStartOffsetX = 120;
      const bubbleGapX = Math.min(80, Math.max(64, (colWidth - bubbleStartOffsetX - 40) / 4));

      p1Options.forEach((opt, optIdx) => {
        const bubbleX = baseX + bubbleStartOffsetX + optIdx * bubbleGapX;
        const isFilled = filledOpt === opt;
        drawBubble(bubbleX, baseY, opt, isFilled, 21.5);
      });
    }

    p1EndY = p1FirstRowY + (p1QuestionsPerCol - 1) * p1RowHeight + 30;
  }

  // =========================================================================
  // PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (Đ, S)
  // =========================================================================
  if (hasPart2) {
    const p2StartY = hasPart1 ? p1EndY + sectionGap : questionsStartY;

    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.roundRect(leftMargin, p2StartY, contentWidth, bannerHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = FONT_SERIF_SECTION;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI (Thí sinh chọn Đ hoặc S cho mỗi ý a, b, c, d)',
      leftMargin + 18,
      p2StartY + bannerHeight / 2
    );

    const subItems: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
    const p2CardHeight = Math.max(54, p2RowHeight - 12);
    const subColWidth = (contentWidth - 180) / 4;

    for (let q = 1; q <= part2Count; q++) {
      const cardY = p2StartY + bannerHeight + 16 + (q - 1) * p2RowHeight;
      const centerY = cardY + p2CardHeight / 2;

      // Khung câu hỏi viền thanh lịch, nền xen kẽ
      ctx.fillStyle = q % 2 === 0 ? '#f8fafc' : '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(leftMargin, cardY, contentWidth, p2CardHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Nhãn Câu (Size 26 bold, màu xanh ngọc đậm)
      ctx.fillStyle = '#065f46';
      ctx.font = FONT_SERIF_BOLD_26;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Câu ${q}:`, leftMargin + 20, centerY);

      // 4 ý con a, b, c, d dàn đều theo hàng ngang, chữ và ô chọn to rõ
      subItems.forEach((sub, subIdx) => {
        const subX = leftMargin + 150 + subIdx * subColWidth;

        // Chữ cái ý con
        ctx.fillStyle = '#1e293b';
        ctx.font = FONT_SERIF_BOLD_26;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${sub})`, subX, centerY);

        const userChoice = filledAnswers?.part2?.[q]?.[sub];
        const bubbleĐX = subX + 60;
        const bubbleSX = subX + 128;

        drawBubble(bubbleĐX, centerY, 'Đ', userChoice === 'Đ', 20.5);
        drawBubble(bubbleSX, centerY, 'S', userChoice === 'S', 20.5);
      });
    }
  }

  // =========================================================================
  // FOOTER CHÂN TRANG: THÔNG TIN HỆ THỐNG & CHUẨN IN
  // =========================================================================
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 20px "Times New Roman", Times, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    '* Dùng bút chì đen 2B tô đậm kín ô tròn • Mẫu phiếu chuẩn 1/2 giấy A4 (Khổ A5) • Phần mềm HỖ TRỢ CHẤM BÀI _ PHẠM HẬU',
    width / 2,
    height - 52
  );

  return canvas.toDataURL('image/png');
}

/**
 * Pre-configured realistic filled student samples
 */
export const SAMPLE_STUDENTS: {
  id: string;
  name: string;
  studentId: string;
  examCode: string;
  classRoom: string;
  description: string;
  badge: string;
  mockAnswers: StudentAnswersMock;
}[] = [
  {
    id: 'sample-an',
    name: 'Nguyễn Văn An',
    studentId: '120401',
    examCode: '101',
    classRoom: '12A1',
    description: 'Học sinh xuất sắc (Đúng 11/12 câu Phần 1, 15/16 ý Đúng-Sai Phần 2 - Điểm cao)',
    badge: 'Học sinh Giỏi • 9.5 điểm',
    mockAnswers: {
      part1: {
        1: 'A',
        2: 'C',
        3: 'B',
        4: 'D',
        5: 'B',
        6: 'A',
        7: 'D',
        8: 'C',
        9: 'A',
        10: 'C',
        11: 'B',
        12: 'D',
      },
      part2: {
        1: { a: 'Đ', b: 'S', c: 'Đ', d: 'S' }, // 4/4 correct
        2: { a: 'S', b: 'Đ', c: 'Đ', d: 'S' }, // 4/4 correct
        3: { a: 'Đ', b: 'Đ', c: 'S', d: 'Đ' }, // 4/4 correct
        4: { a: 'S', b: 'S', c: 'Đ', d: 'S' }, // 3/4 correct (d is S instead of Đ)
      },
    },
  },
  {
    id: 'sample-mai',
    name: 'Trần Thị Mai',
    studentId: '120402',
    examCode: '101',
    classRoom: '12A1',
    description: 'Học sinh khá (Đúng 9/12 câu Phần 1; Phần 2 đúng 11/16 ý Đúng-Sai)',
    badge: 'Học sinh Khá • 7.25 điểm',
    mockAnswers: {
      part1: {
        1: 'A',
        2: 'C',
        3: 'A', // Wrong (ans is B)
        4: 'D',
        5: 'B',
        6: 'B', // Wrong (ans is A)
        7: 'D',
        8: 'C',
        9: 'A',
        10: 'B', // Wrong (ans is C)
        11: 'B',
        12: 'D',
      },
      part2: {
        1: { a: 'Đ', b: 'S', c: 'Đ', d: 'S' }, // 4/4 correct
        2: { a: 'Đ', b: 'Đ', c: 'Đ', d: 'S' }, // 3/4 correct (a is Đ instead of S)
        3: { a: 'Đ', b: 'S', c: 'S', d: 'Đ' }, // 3/4 correct (b is S instead of Đ)
        4: { a: 'S', b: 'Đ', c: 'S', d: 'Đ' }, // 2/4 correct (b and c wrong)
      },
    },
  },
  {
    id: 'sample-nam',
    name: 'Lê Hoàng Nam',
    studentId: '120403',
    examCode: '102',
    classRoom: '12A2',
    description: 'Mã đề 102 (Hệ thống tự động nhận dạng mã đề 102 để so với đáp án đề 102)',
    badge: 'Mã đề khác 102 • 8.2 điểm',
    mockAnswers: {
      part1: {
        1: 'B',
        2: 'D',
        3: 'A',
        4: 'C',
        5: 'D',
        6: 'B',
        7: 'B', // Wrong (ans is A)
        8: 'C',
        9: 'B',
        10: 'A',
      },
      part2: {
        1: { a: 'Đ', b: 'Đ', c: 'S', d: 'S' }, // 4/4 correct
        2: { a: 'S', b: 'Đ', c: 'Đ', d: 'Đ' }, // 4/4 correct
        3: { a: 'Đ', b: 'Đ', c: 'Đ', d: 'S' }, // 3/4 correct (b is Đ instead of S)
      },
    },
  },
];
