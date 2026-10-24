import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Body parser with 50MB limit for high-res test sheet photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasEnvKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/grade
 * Process student answer sheet image using Gemini Vision AI with model fallback
 */
app.post('/api/grade', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', examKeys, forcedExamCode, preferredModel, apiKey: clientKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh (imageBase64)' });
    }

    const effectiveApiKey = (clientKey || req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY || '') as string;

    if (!effectiveApiKey) {
      return res.json({
        fallback: true,
        message: 'Chưa cấu hình GEMINI_API_KEY.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Bạn là một trợ lý AI chấm thi trắc nghiệm học đường chuyên nghiệp tại Việt Nam.
Hãy phân tích bức ảnh phiếu trả lời trắc nghiệm này thật chi tiết và chính xác.

Nhiệm vụ của bạn:
1. Nhận diện thông tin học sinh:
   - Họ và tên học sinh (nếu có viết trên phiếu)
   - Số báo danh (SBD) (chuỗi số)
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
  "studentName": "Nguyễn Văn An",
  "studentId": "120401",
  "detectedExamCode": "101",
  "confidenceScore": 0.95,
  "part1Answers": [
    { "questionNumber": 1, "studentAnswer": "A" },
    { "questionNumber": 2, "studentAnswer": "C" }
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
  "notes": "Nhận diện rõ ràng tất cả các ô tô bút chì"
}`;

    const modelsToTry = [
      preferredModel || 'gemini-3-flash-preview',
      'gemini-3-pro-preview',
      'gemini-2.5-flash',
    ].filter(Boolean);

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    };

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [imagePart, { text: prompt }] },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const responseText = response.text || '{}';
        let parsedData: any = {};
        try {
          parsedData = JSON.parse(responseText.trim());
        } catch {
          const match = responseText.match(/\{[\s\S]*\}/);
          if (match) {
            parsedData = JSON.parse(match[0]);
          } else {
            throw new Error('Định dạng phản hồi AI không hợp lệ.');
          }
        }

        return res.json({
          success: true,
          data: parsedData,
          modelUsed: model,
        });
      } catch (err: any) {
        lastError = err;
        console.warn(`Server fallback: model ${model} failed:`, err?.message);
      }
    }

    throw lastError;
  } catch (err: any) {
    console.error('Error in /api/grade:', err);
    res.status(500).json({
      error: err.message || '429 RESOURCE_EXHAUSTED',
    });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`HỖ TRỢ CHẤM BÀI _ PHẠM HẬU server listening at http://localhost:${port}`);
  });
}

startServer();
