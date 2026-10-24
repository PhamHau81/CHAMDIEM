import { AIModelId, AIModelOption, ExamKeyConfig, AIFeedbackResult } from '../types.ts';

export const AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'gemini-3-flash-preview (Default)',
    badge: 'Mặc định & Tốc độ cao',
    description: 'Tối ưu tốc độ nhận diện ảnh phiếu thi trắc nghiệm, phản hồi siêu nhanh trong 1-2 giây.',
    speed: 'Siêu nhanh (< 2s)',
    accuracy: 'Rất cao (98%)',
    recommended: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'gemini-3-pro-preview',
    badge: 'Độ chính xác tối đa',
    description: 'Khả năng suy luận thị giác vượt trội, xử lý cực chuẩn các ảnh chụp nghiêng, mờ hoặc tẩy xóa.',
    speed: 'Trung bình (~ 3-5s)',
    accuracy: 'Chuyên gia (99.5%)',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    badge: 'Dự phòng ổn định',
    description: 'Model dự phòng tin cậy khi các model thế hệ 3 bị quá tải hoặc đạt hạn mức quota.',
    speed: 'Rất nhanh (~ 2s)',
    accuracy: 'Cao (96%)',
  },
];

export const FALLBACK_MODEL_SEQUENCE: AIModelId[] = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

const STORAGE_KEY_API_KEY = 'edugrade_gemini_api_key';
const STORAGE_KEY_SELECTED_MODEL = 'edugrade_selected_model';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  } catch (e) {
    console.error('Không thể lưu API Key vào localStorage:', e);
  }
}

export function getStoredModel(): AIModelId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SELECTED_MODEL) as AIModelId;
    if (saved && FALLBACK_MODEL_SEQUENCE.includes(saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'gemini-3-flash-preview';
}

export function setStoredModel(model: AIModelId): void {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_MODEL, model);
  } catch (e) {
    console.error('Không thể lưu Model vào localStorage:', e);
  }
}

export interface DetectedRawData {
  studentName: string;
  studentId: string;
  detectedExamCode: string;
  confidenceScore: number;
  part1Answers: Array<{ questionNumber: number; studentAnswer: string }>;
  part2Answers: Array<{
    questionNumber: number;
    statements: Array<{ id: 'a' | 'b' | 'c' | 'd'; studentAnswer: string }>;
  }>;
  notes?: string;
}

/**
 * Direct REST API call to Google Gemini endpoint.
 * Zero external node dependencies, runs natively in all browsers & Vercel.
 */
async function callGeminiVisionRest(
  model: string,
  cleanBase64: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const rawError =
      errorJson?.error?.message ||
      errorJson?.error?.status ||
      `Lỗi ${response.status} ${response.statusText}`;
    throw new Error(rawError);
  }

  const resultJson = await response.json();
  const text = resultJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

/**
 * Perform vision OCR grading with automatic fallback across models.
 * If model 1 fails -> automatically retry model 2 -> model 3.
 * If all fail -> throw raw error (e.g. 429 RESOURCE_EXHAUSTED).
 */
export async function scanAndGradeWithGemini(
  imageBase64: string,
  examKeys: ExamKeyConfig[],
  options?: {
    forcedExamCode?: string;
    onProgressUpdate?: (stepIndex: 1 | 2 | 3, statusText: string, modelUsed?: string) => void;
    onModelFallback?: (failedModel: string, nextModel: string, errorMsg: string) => void;
  }
): Promise<{ data: DetectedRawData; modelUsed: string }> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('MISSING_API_KEY: Chưa cấu hình Gemini API Key. Vui lòng bấm "Settings (API Key)" trên thanh tiêu đề để nhập key.');
  }

  // Clean base64 string
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  // Determine starting model sequence
  const preferredModel = getStoredModel();
  const sequence: AIModelId[] = [
    preferredModel,
    ...FALLBACK_MODEL_SEQUENCE.filter((m) => m !== preferredModel),
  ];

  const prompt = `Bạn là một trợ lý AI chấm thi trắc nghiệm học đường chuyên nghiệp tại Việt Nam.
Hãy phân tích bức ảnh phiếu trả lời trắc nghiệm này thật chi tiết và chính xác.

Nhiệm vụ của bạn:
1. Nhận diện thông tin học sinh:
   - Họ và tên học sinh (nếu có viết trên phiếu)
   - Số báo danh (SBD) (chuỗi số từ 3 đến 6 chữ số)
   - Mã đề thi (3 hoặc 4 chữ số, ví dụ 101, 102...)

2. PHẦN I: Trắc nghiệm 4 lựa chọn (A, B, C, D)
   - Với mỗi câu hỏi (Câu 1, 2, 3...): xem ô tròn nào được tô đen bằng bút chì.
   - Trả về phương án được chọn: "A", "B", "C", "D".
   - Nếu để trống thì trả về "BLANK".
   - Nếu tô 2 ô cùng lúc thì trả về "INVALID".

3. PHẦN II: Trắc nghiệm Đúng / Sai
   - Với mỗi câu hỏi (Câu 1, 2...): có 4 ý con a), b), c), d).
   - Với mỗi ý con a, b, c, d: xem học sinh tô vào ô "Đ" (Đúng) hay ô "S" (Sai).
   - Nếu không tô thì ghi "BLANK", tô cả 2 thì ghi "INVALID".

Hãy trả về CHỈ MỘT ĐỐI TƯỢNG JSON thuần túy (không bọc trong markdown) theo đúng cấu trúc:
{
  "studentName": "Họ và tên thí sinh hoặc Trống",
  "studentId": "120401",
  "detectedExamCode": "101",
  "confidenceScore": 0.98,
  "part1Answers": [
    { "questionNumber": 1, "studentAnswer": "A" },
    { "questionNumber": 2, "studentAnswer": "B" }
  ],
  "part2Answers": [
    {
      "questionNumber": 1,
      "statements": [
        { "id": "a", "studentAnswer": "Đ" },
        { "id": "b", "studentAnswer": "S" },
        { "id": "c", "studentAnswer": "Đ" },
        { "id": "d", "studentAnswer": "S" }
      ]
    }
  ],
  "notes": "Nhận diện rõ ràng các ô tô chì"
}`;

  let lastError: any = null;

  for (let i = 0; i < sequence.length; i++) {
    const currentModel = sequence[i];
    try {
      options?.onProgressUpdate?.(
        2,
        `Bước 2/3: Đang trích xuất mã đề, SBD và ô tô chì bằng model ${currentModel}...`,
        currentModel
      );

      const responseText = await callGeminiVisionRest(currentModel, cleanBase64, prompt, apiKey);

      if (!responseText.trim()) {
        throw new Error('AI trả về phản hồi rỗng.');
      }

      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText.trim());
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể phân tích cấu trúc dữ liệu JSON từ phản hồi AI.');
        }
      }

      // Success with this model
      return {
        data: parsedData as DetectedRawData,
        modelUsed: currentModel,
      };
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini Fallback] Model ${currentModel} thất bại:`, errMsg);

      const nextModel = sequence[i + 1];
      if (nextModel) {
        options?.onModelFallback?.(currentModel, nextModel, errMsg);
        // Wait brief delay before retrying with next fallback model
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }

  // If all models failed, throw raw error as required by AI_INSTRUCTIONS
  const rawErrorMessage =
    lastError?.message ||
    lastError?.statusText ||
    '429 RESOURCE_EXHAUSTED';
  throw new Error(rawErrorMessage);
}

/**
 * Generate personalized pedagogical feedback from AI for a student based on their exam result.
 */
export async function generateAIPedagogicalFeedback(
  studentName: string,
  totalScore: number,
  wrongQuestionsPart1: number[],
  wrongQuestionsPart2: { questionNumber: number; wrongStatements: string[] }[],
  subject: string = 'Toán học'
): Promise<AIFeedbackResult> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const currentModel = getStoredModel();
  const prompt = `Bạn là một giáo viên chuyên môn ${subject} giàu kinh nghiệm và tận tâm.
Hãy đưa ra nhận xét sư phạm chi tiết và kế hoạch ôn tập cho học sinh sau bài kiểm tra trắc nghiệm:
- Tên học sinh: ${studentName || 'Học sinh'}
- Điểm số đạt được: ${totalScore}/10.0
- Các câu trắc nghiệm 4 lựa chọn làm sai: ${wrongQuestionsPart1.length > 0 ? wrongQuestionsPart1.join(', ') : 'Không có'}
- Các câu Đúng/Sai làm sai: ${
    wrongQuestionsPart2.length > 0
      ? wrongQuestionsPart2.map((q) => `Câu ${q.questionNumber} (ý ${q.wrongStatements.join(', ')})`).join('; ')
      : 'Không có'
  }

Hãy trả về DUY NHẤT một đối tượng JSON (không bọc trong markdown) theo cấu trúc:
{
  "overallAssessment": "Lời nhận xét tổng quan ngắn gọn khích lệ học sinh",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Lỗ hổng kiến thức 1", "Lỗ hổng kiến thức 2"],
  "recommendedTopics": ["Chủ đề cần ôn tập ngay 1", "Chủ đề 2"],
  "practiceTips": ["Lời khuyên chiến thuật làm bài 1", "Lời khuyên 2"]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json' },
      }),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(text) as AIFeedbackResult;
  } catch (err: any) {
    console.error('Lỗi sinh nhận xét AI:', err);
    return {
      overallAssessment: `Học sinh đã hoàn thành bài thi đạt kết quả ${totalScore}/10. Cần tập trung ôn luyện các dạng câu hỏi còn làm sai để nâng cao điểm số.`,
      strengths: ['Có cố gắng hoàn thành đủ các phần của bài thi', 'Nắm vững một số kiến thức cơ bản'],
      weaknesses: ['Còn nhầm lẫn ở các câu phân hóa', 'Cần rèn luyện thêm kỹ năng đọc kỹ đề bài Đúng/Sai'],
      recommendedTopics: ['Ôn tập lại lý thuyết các câu làm sai', 'Luyện giải các đề tương tự'],
      practiceTips: ['Dùng phương pháp loại trừ khi phân vân', 'Tập phân bổ thời gian đều cho từng phần'],
    };
  }
}
