# HỖ TRỢ CHẤM BÀI _ PHẠM HẬU

Hệ thống chấm thi trắc nghiệm học đường tự động thông minh bằng Camera và Thị giác AI (Google Gemini Vision AI).

---

## 🌟 Tính Năng Nổi Bật

1. **Chấm Thi Đa Cấu Trúc (Chuẩn Bộ GD&ĐT)**:
   - **Phần I**: Trắc nghiệm 4 lựa chọn (A, B, C, D).
   - **Phần II**: Trắc nghiệm Đúng / Sai (mỗi câu gồm 4 ý con a, b, c, d với thang điểm lũy tiến 0.1 - 0.25 - 0.5 - 1.0 điểm).
2. **Cơ Chế AI Vision & Fallback Tự Động**:
   - Sử dụng Google Gemini Vision AI (`gemini-3-flash-preview`, `gemini-3-pro-preview`, `gemini-2.5-flash`).
   - Tự động chuyển đổi fallback sang model tiếp theo khi hết quota hoặc quá tải (429 RESOURCE_EXHAUSTED).
   - Người dùng tự nhập API Key cá nhân từ [Google AI Studio](https://aistudio.google.com/api-keys), lưu bảo mật tại `localStorage` trình duyệt.
3. **Chế Độ Chấm Hàng Loạt (Batch Upload)**:
   - Tải lên 20 - 50 ảnh phiếu thi cùng lúc để hệ thống tự động quét và chấm điểm liên tục cho cả lớp.
4. **Phân Tích Ma Trận Đề Thi & Trực Quan Hóa (D3 / SVG)**:
   - Đồ thị phổ điểm (Histogram) trực quan theo 10 thang điểm và 4 nhóm học lực.
   - Phân tích độ khó (Item Analysis): Thống kê tỷ lệ chọn A/B/C/D ở từng câu, tự động gắn cờ cảnh báo các "câu bẫy" có tỷ lệ học sinh làm sai trên 50%.
5. **Trợ Lý AI Nhận Xét Sư Phạm & Kế Hoạch Ôn Tập**:
   - Tự động phân tích các câu làm sai để tìm ra lỗ hổng kiến thức và đề xuất chủ đề ôn tập ngay trong bài chấm.
6. **Xuất Báo Cáo Đa Định Dạng (Word, PowerPoint, Excel vnEdu / SMAS)**:
   - Xuất phiếu báo điểm cá nhân gửi phụ huynh dạng file Word (`.doc`).
   - Xuất bảng điểm chuẩn tương thích hệ thống quản lý điểm **vnEdu** và **SMAS**.
   - Xuất slide trình chiếu chữa bài kiểm tra cho giáo viên (`.html / PowerPoint deck`).

---

## 🚀 Triển Khai Lên Vercel Từ GitHub

Ứng dụng đã được cấu hình tối ưu để triển khai tĩnh (Static Single Page App) lên Vercel:

1. Đẩy mã nguồn lên kho chứa GitHub của bạn.
2. Đăng nhập vào [Vercel](https://vercel.com/) ➔ Chọn **Add New Project** ➔ Chọn repository GitHub của bạn.
3. Cấu hình Build:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. File `vercel.json` ở thư mục gốc sẽ tự động xử lý toàn bộ SPA routing:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
5. Bấm **Deploy**. Người dùng khi truy cập web chỉ cần bấm nút **"Cài đặt API Key"** trên thanh tiêu đề để dán Gemini API key miễn phí từ [Google AI Studio](https://aistudio.google.com/api-keys).

---

## 💻 Chạy Trực Tiếp Tại Máy Cá Nhân (Local)

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt tại: `http://localhost:3000`
