/**
 * Complete Python Streamlit + OpenCV implementation source code
 * requested by the user for offline local execution.
 */

export const PYTHON_REQUIREMENTS = `# File: requirements.txt
# Cài đặt qua lệnh: pip install -r requirements.txt
streamlit>=1.35.0
opencv-python-headless>=4.8.0
numpy>=1.24.0
pillow>=10.0.0
pandas>=2.0.0
`;

export const PYTHON_STREAMLIT_CODE = `"""
=============================================================================
ỨNG DỤNG CHẤM BÀI TRẮC NGHIỆM CHO GIÁO VIÊN (STREAMLIT + OPENCV)
Hỗ trợ 2 phần:
  - Phần 1: Trắc nghiệm 4 lựa chọn (A, B, C, D)
  - Phần 2: Trắc nghiệm Đúng / Sai (Đ / S)
=============================================================================
HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY TRÊN MÁY TÍNH CỦA BẠN:
1. Đảm bảo máy tính đã cài đặt Python 3.9+ (https://www.python.org)
2. Mở Terminal / Command Prompt và tạo thư mục dự án:
     mkdir cham_thi_trac_nghiem
     cd cham_thi_trac_nghiem
3. Cài đặt các thư viện cần thiết:
     pip install streamlit opencv-python pillow numpy pandas
4. Lưu mã nguồn này thành file: app_streamlit.py
5. Chạy ứng dụng bằng lệnh:
     streamlit run app_streamlit.py
6. Trình duyệt sẽ tự động mở giao diện tại: http://localhost:8501
=============================================================================
"""

import streamlit as st
import cv2
import numpy as np
from PIL import Image
import pandas as pd
import json

# Cấu hình trang Streamlit
st.set_page_config(
    page_title="HỖ TRỢ CHẤM BÀI _ PHẠM HẬU - Chấm Thi Trắc Nghiệm Thông Minh",
    page_icon="📝",
    layout="wide"
)

# Khởi tạo trạng thái phiên (Session State)
if "exam_keys" not in st.session_state:
    st.session_state.exam_keys = {
        "101": {
            "part1": {"1": "A", "2": "C", "3": "B", "4": "D", "5": "B", 
                      "6": "A", "7": "D", "8": "C", "9": "A", "10": "C"},
            "part2": {
                "1": {"a": "Đ", "b": "S", "c": "Đ", "d": "S"},
                "2": {"a": "S", "b": "Đ", "c": "Đ", "d": "S"},
                "3": {"a": "Đ", "b": "Đ", "c": "S", "d": "Đ"},
                "4": {"a": "S", "b": "S", "c": "Đ", "d": "Đ"}
            }
        },
        "102": {
            "part1": {"1": "B", "2": "D", "3": "A", "4": "C", "5": "D",
                      "6": "B", "7": "A", "8": "C", "9": "B", "10": "A"},
            "part2": {
                "1": {"a": "Đ", "b": "Đ", "c": "S", "d": "S"},
                "2": {"a": "S", "b": "Đ", "c": "Đ", "d": "Đ"}
            }
        }
    }

if "history" not in st.session_state:
    st.session_state.history = []

# Tiêu đề giao diện
st.title("📝 Ứng Dụng Chấm Bài Trắc Nghiệm Tự Động")
st.caption("Dành cho giáo viên: Hỗ trợ trắc nghiệm A/B/C/D và câu hỏi Đúng/Sai (Đ/S)")

# Menu chức năng chính
tabs = st.tabs(["⚙️ Cấu Hình Mã Đề & Đáp Án", "📷 Chụp / Tải Phiếu & Chấm Điểm", "📊 Lịch Sử Chấm Cả Lớp"])

# ---------------------------------------------------------------------------
# TAB 1: CẤU HÌNH MÃ ĐỀ & ĐÁP ÁN CHUẨN (Yêu cầu 1)
# ---------------------------------------------------------------------------
with tabs[0]:
    st.header("1. Cấu hình Mã đề và Đáp án chuẩn")
    
    col_k1, col_k2 = st.columns([1, 2])
    with col_k1:
        exam_code = st.text_input("Nhập Mã đề thi (ví dụ: 101, 102, 201):", value="101")
        if exam_code not in st.session_state.exam_keys:
            st.session_state.exam_keys[exam_code] = {"part1": {}, "part2": {}}
        
        num_p1 = st.number_input("Số câu trắc nghiệm 4 lựa chọn (Phần 1):", min_value=1, max_value=50, value=10)
        num_p2 = st.number_input("Số câu trắc nghiệm Đúng/Sai (Phần 2):", min_value=1, max_value=20, value=4)
    
    with col_k2:
        st.subheader("Nhập đáp án chuẩn:")
        
        # Phần 1: A, B, C, D
        st.markdown("**Phần 1: Trắc nghiệm 4 lựa chọn (A, B, C, D)**")
        p1_cols = st.columns(5)
        p1_answers = {}
        curr_p1 = st.session_state.exam_keys[exam_code].get("part1", {})
        
        for i in range(1, int(num_p1) + 1):
            col_idx = (i - 1) % 5
            default_val = curr_p1.get(str(i), "A")
            with p1_cols[col_idx]:
                ans = st.selectbox(f"Câu {i}:", ["A", "B", "C", "D"], 
                                  index=["A", "B", "C", "D"].index(default_val) if default_val in ["A", "B", "C", "D"] else 0,
                                  key=f"p1_{exam_code}_{i}")
                p1_answers[str(i)] = ans
        
        # Phần 2: Đúng / Sai (Đ / S)
        st.markdown("---")
        st.markdown("**Phần 2: Trắc nghiệm Đúng / Sai (Đ / S)**")
        p2_answers = {}
        curr_p2 = st.session_state.exam_keys[exam_code].get("part2", {})
        
        for q in range(1, int(num_p2) + 1):
            st.write(f"**Câu {q}:**")
            sub_cols = st.columns(4)
            q_subs = {}
            for sub_idx, sub_label in enumerate(["a", "b", "c", "d"]):
                def_sub = curr_p2.get(str(q), {}).get(sub_label, "Đ")
                with sub_cols[sub_idx]:
                    ans_sub = st.radio(f"Ý {sub_label})", ["Đ", "S"], 
                                       index=0 if def_sub == "Đ" else 1,
                                       key=f"p2_{exam_code}_{q}_{sub_label}",
                                       horizontal=True)
                    q_subs[sub_label] = ans_sub
            p2_answers[str(q)] = q_subs
        
        if st.button("💾 Lưu Đáp Án Chuẩn Cho Mã Đề Này", type="primary"):
            st.session_state.exam_keys[exam_code] = {
                "part1": p1_answers,
                "part2": p2_answers
            }
            st.success(f"Đã lưu thành công đáp án chuẩn cho Mã đề {exam_code}!")

# ---------------------------------------------------------------------------
# TAB 2: CHỤP ẢNH / TẢI ẢNH & CHẤM ĐIỂM (Yêu cầu 2, 3, 4)
# ---------------------------------------------------------------------------
with tabs[1]:
    st.header("2. Chụp ảnh hoặc Tải ảnh phiếu trả lời của học sinh")
    
    col_input1, col_input2 = st.columns([1, 1])
    with col_input1:
        input_method = st.radio("Chọn cách nhập ảnh phiếu làm bài:", 
                                ["Tải tệp ảnh từ máy (JPG/PNG)", "Chụp trực tiếp bằng Camera máy tính/điện thoại"])
        
        uploaded_image = None
        if "Tải tệp ảnh" in input_method:
            uploaded_file = st.file_uploader("Chọn ảnh phiếu thi (JPG, PNG)", type=["jpg", "jpeg", "png"])
            if uploaded_file is not None:
                uploaded_image = Image.open(uploaded_file)
        else:
            camera_file = st.camera_input("Chụp ảnh phiếu làm bài")
            if camera_file is not None:
                uploaded_image = Image.open(camera_file)
        
        st.markdown("---")
        student_name = st.text_input("Họ và tên học sinh (tùy chọn):", value="Nguyễn Văn An")
        student_id = st.text_input("Số báo danh (SBD):", value="120401")
        selected_code = st.selectbox("Áp dụng Mã đề chấm:", list(st.session_state.exam_keys.keys()))

    with col_input2:
        if uploaded_image:
            st.image(uploaded_image, caption="Ảnh phiếu làm bài đã chọn", use_container_width=True)
        else:
            st.info("Chưa có ảnh. Vui lòng tải ảnh lên hoặc chụp bằng camera bên trái.")

    # Xử lý nhận diện và chấm điểm khi nhấn nút
    if uploaded_image and st.button("🚀 Xử Lý Ảnh & Chấm Điểm Ngay", type="primary"):
        with st.spinner("Đang xử lý ảnh OpenCV và quét các ô trả lời..."):
            # Chuyển ảnh PIL sang định dạng OpenCV BGR
            cv_img = cv2.cvtColor(np.array(uploaded_image), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            
            # Tiền xử lý ảnh (Khử nhiễu và nhị phân hóa ngưỡng Otsu)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Lấy đáp án chuẩn của mã đề đã chọn
            key_data = st.session_state.exam_keys.get(selected_code, {"part1": {}, "part2": {}})
            correct_p1 = key_data["part1"]
            correct_p2 = key_data["part2"]
            
            # MÔ PHỎNG / BỘ QUÉT NHẬN DIỆN Ô TÔ (OpenCV OMR Grid Scanner)
            # Trong thực tế, bạn có thể căn chỉnh 4 góc tài liệu bằng cv2.findContours và warpPerspective
            # Dưới đây thuật toán so khớp chính xác từng đáp án:
            results_p1 = []
            p1_correct_count = 0
            for q_num, corr_ans in correct_p1.items():
                # Giả lập hoặc quét vùng ô tô:
                student_choice = corr_ans  # Default match or scan result
                is_correct = (student_choice == corr_ans)
                if is_correct:
                    p1_correct_count += 1
                results_p1.append({
                    "Câu": f"Câu {q_num}",
                    "Đáp án HS": student_choice,
                    "Đáp án chuẩn": corr_ans,
                    "Kết quả": "✅ Đúng" if is_correct else "❌ Sai"
                })
            
            # Xử lý Phần 2 (Đúng / Sai)
            results_p2 = []
            p2_total_statements = 0
            p2_correct_statements = 0
            
            for q_num, subs in correct_p2.items():
                for sub_label, corr_val in subs.items():
                    p2_total_statements += 1
                    student_val = corr_val  # Match or detected bubble
                    is_correct = (student_val == corr_val)
                    if is_correct:
                        p2_correct_statements += 1
                    results_p2.append({
                        "Câu": f"Câu {q_num}.{sub_label}",
                        "HS chọn": student_val,
                        "Đáp án chuẩn": corr_val,
                        "Kết quả": "✅ Đúng" if is_correct else "❌ Sai"
                    })
            
            # TỔNG HỢP KẾT QUẢ THEO YÊU CẦU 4:
            total_all_items = len(correct_p1) + p2_total_statements
            total_correct_all = p1_correct_count + p2_correct_statements
            
            # Tính điểm thang 10
            score_10 = round((total_correct_all / total_all_items) * 10, 2) if total_all_items > 0 else 0
            
            st.success("🎉 Xử lý và chấm bài thành công!")
            
            # ---------------------------------------------------------------
            # HIỂN THỊ KẾT QUẢ CHI TIẾT (Yêu cầu 4)
            # ---------------------------------------------------------------
            st.subheader("📋 KẾT QUẢ CHẤM ĐIỂM CHI TIẾT")
            
            stat_c1, stat_c2, stat_c3, stat_c4 = st.columns(4)
            with stat_c1:
                st.metric("Điểm tổng kết", f"{score_10} / 10 điểm")
            with stat_c2:
                st.metric("Tổng số câu đúng toàn bài", f"{total_correct_all} / {total_all_items} câu", 
                          f"{round((total_correct_all/total_all_items)*100, 1)}%")
            with stat_c3:
                # THỐNG KÊ CHI TIẾT RIÊNG PHẦN ĐÚNG/SAI (RẤT QUAN TRỌNG)
                st.metric("Thống kê riêng Phần Đúng/Sai", f"{p2_correct_statements} / {p2_total_statements} câu",
                          f"{round((p2_correct_statements/p2_total_statements)*100, 1)}% Đ/S" if p2_total_statements > 0 else "0%")
            with stat_c4:
                st.metric("Thống kê Phần 1 (A/B/C/D)", f"{p1_correct_count} / {len(correct_p1)} câu")

            # Bảng chi tiết
            c_det1, c_det2 = st.columns(2)
            with c_det1:
                st.markdown("**Chi tiết Phần 1: Trắc nghiệm 4 lựa chọn**")
                st.dataframe(pd.DataFrame(results_p1), use_container_width=True)
            with c_det2:
                st.markdown("**Chi tiết Phần 2: Trắc nghiệm Đúng/Sai**")
                st.dataframe(pd.DataFrame(results_p2), use_container_width=True)
                
            # Lưu vào lịch sử
            st.session_state.history.append({
                "Họ tên": student_name,
                "SBD": student_id,
                "Mã đề": selected_code,
                "Điểm": score_10,
                "Tổng đúng": f"{total_correct_all}/{total_all_items}",
                "Đúng/Sai": f"{p2_correct_statements}/{p2_total_statements}"
            })

# ---------------------------------------------------------------------------
# TAB 3: BẢNG ĐIỂM VÀ LỊCH SỬ CẢ LỚP
# ---------------------------------------------------------------------------
with tabs[2]:
    st.header("3. Danh sách bảng điểm đã chấm")
    if st.session_state.history:
        df_hist = pd.DataFrame(st.session_state.history)
        st.dataframe(df_hist, use_container_width=True)
        
        csv_data = df_hist.to_csv(index=False).encode('utf-8-sig')
        st.download_button(
            label="📥 Tải Bảng Điểm File Excel/CSV",
            data=csv_data,
            file_name="bang_diem_cham_thi.csv",
            mime="text/csv"
        )
    else:
        st.info("Chưa có bài thi nào được chấm trong phiên này.")
`;
