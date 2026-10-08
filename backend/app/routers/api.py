import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import (
    User, UserRole, Student, Roadmap, DailyCheckin, FlowerStatus,
    FlowerState, MoodType, PlannedTask, Badge, StudentBadge, StreakInventory,
    TimeCapsule, CapsuleStatus, Classroom, QuizQuestion, StudentQuizAttempt
)
from app.schemas import (
    UserRegister, UserLogin, UserResponse, AuthTokenResponse,
    DiagnosticQuestion, DiagnosticOption,
    StudentCreate, StudentResponse, RoadmapResponse,
    PlannedTaskCreate, PlannedTaskUpdate, PlannedTaskResponse, PlanningOverviewResponse,
    CheckinCreate, CheckinResponse,
    GardenStatusResponse, WaterActionResponse, StreakRestoreResponse,
    TeacherDashboardResponse, StudentAlertItem,
    BadgeResponse, StreakInventoryResponse, TimeCapsuleCreate, TimeCapsuleResponse,
    MilestoneReward, DailyQuizPackageResponse, QuizSubmissionCreate, QuizSubmissionResponse,
    TeacherInjectQuizCreate, TeacherQuizStatsItem, QuizQuestionAdmin,
    TeacherCreateRequest, TeacherUpdateRequest, TeacherResponseItem,
    StudentAssignClassRequest, AdminStudentCreateRequest, AdminOverviewStats,
    ClassroomCreateRequest, ClassroomItem, QuizQuestionUpdateRequest, SubjectQuestionGroup
)
from app.services.quiz_service import (
    get_daily_quiz_package, submit_student_quiz,
    inject_teacher_quiz, get_teacher_quiz_stats, ensure_quiz_bank_seeded
)
from app.auth import hash_password, verify_password, generate_session_token
from app.services.ai_service import call_ai_roadmap, call_ai_mentor
from app.services.garden_service import (
    calculate_flower_state, evaluate_inactive_state, STORY_MESSAGES,
    ensure_badges_seeded, get_or_create_inventory, check_and_award_badges,
    get_journey_milestones_status, DEFAULT_BADGES, restore_student_streak
)
router = APIRouter(prefix="/api", tags=["Sunflower API"])

# --- 1. HỆ THỐNG XÁC THỰC (AUTH: REGISTER / LOGIN / CURRENT USER) ---
@router.post("/auth/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if data.role in [UserRole.TEACHER, UserRole.ADMIN] or str(data.role).lower() in ["teacher", "admin"]:
        raise HTTPException(
            status_code=403, 
            detail="Tài khoản Giáo viên không thể tự đăng ký. Tài khoản Giáo viên và phân công lớp phải do Admin khởi tạo trực tiếp."
        )

    existing = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng")
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    new_user = User(
        id=user_id,
        email=data.email.strip().lower(),
        name=data.name.strip(),
        password_hash=hash_password(data.password),
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = generate_session_token(new_user.id)
    return AuthTokenResponse(
        token=token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            role=new_user.role,
            created_at=new_user.created_at,
            student_id=None
        )
    )

@router.post("/auth/login", response_model=AuthTokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    account_input = data.email.strip().lower()
    if account_input in ["admin", "admin@sunflower.edu.vn"]:
        user = db.query(User).filter(User.email.in_(["admin", "admin@sunflower.edu.vn"])).first()
    else:
        user = db.query(User).filter(User.email == account_input).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không chính xác")
    student_id = None
    if user.student_profile:
        student_id = user.student_profile.id

    token = generate_session_token(user.id)
    return AuthTokenResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            created_at=user.created_at,
            student_id=student_id
        )
    )

@router.get("/auth/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")

    token = authorization.split(" ")[1]
    user_id = token.split(":")[0] if ":" in token else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Không tìm thấy người dùng")

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        created_at=user.created_at,
        student_id=user.student_profile.id if user.student_profile else None
    )

# --- 2. HỆ THỐNG CÂU HỎI CHẨN ĐOÁN CÁ NHÂN HÓA (DIAGNOSTIC QUESTION BANK) ---
@router.get("/diagnostics/{subject}", response_model=List[DiagnosticQuestion])
def get_diagnostic_questions(subject: str, grade: str = "10"):
    """
    Trả về bộ câu hỏi chẩn đoán phân nhánh được cá nhân hóa cao theo từng môn học.
    """
    subject_normalized = subject.strip().lower()

    if "toán" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="math_archetype",
                subject="Toán học",
                question="Ở môn Toán học, trình độ xuất phát và mục tiêu cốt lõi của bạn hiện tại là gì?",
                category="archetype",
                options=[
                    DiagnosticOption(id="rescue_foundation", label="Cứu gốc / Lấy lại căn bản (mục tiêu 5.0 - 6.5)", subtext="Hổng nhiều định lý, hay quên công thức biến đổi cơ bản"),
                    DiagnosticOption(id="break_plateau", label="Phá bình nguyên 7+ (mục tiêu 7.0 - 8.4)", subtext="Chắc căn bản nhưng hay sai vặt và lúng túng khi gặp câu phân loại"),
                    DiagnosticOption(id="conquer_high", label="Chinh phục 9+ / Thủ khoa (mục tiêu 8.6 - 10.0)", subtext="Muốn tối ưu hóa thời gian và làm chủ các bài toán cực trị vận dụng cao"),
                    DiagnosticOption(id="build_early", label="Xây móng sớm lớp 10 - 11 theo cấu trúc GDPT mới", subtext="Học sớm để không bị áp lực dồn dập vào năm lớp 12")
                ]
            ),
            DiagnosticQuestion(
                id="math_blocker",
                subject="Toán học",
                question="Khi giải đề thi Toán GDPT mới, rào cản lớn nhất của bạn là gì?",
                category="blocker",
                options=[
                    DiagnosticOption(id="read_unseen", label="Đọc đề bài ngữ cảnh thực tế lạ chưa biết lập mô hình toán", subtext="Khó chuyển từ mô tả đời sống sang hàm số/phương trình"),
                    DiagnosticOption(id="calc_slip", label="Hay nhầm lẫn biến đổi đại số / tham số m", subtext="Biết hướng đi nhưng tính toán sai dấu hoặc sót điều kiện xác định"),
                    DiagnosticOption(id="spatial_geometry", label="Hình học không gian & phương pháp tọa độ Oxyz", subtext="Khó tưởng tượng hình chiếu, góc, khoảng cách trong không gian"),
                    DiagnosticOption(id="new_format_traps", label="Lúng túng trước câu trắc nghiệm Đúng/Sai và Trả lời ngắn", subtext="Dễ mất trọn điểm ở 4 ý Đúng/Sai hoặc sai đơn vị ở phần trả lời ngắn")
                ]
            )
        ]
    elif "lý" in subject_normalized or "vật lý" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="physics_blocker",
                subject="Vật lí",
                question="Rào cản lớn nhất của bạn khi học môn Vật lí theo chương trình mới:",
                category="blocker",
                options=[
                    DiagnosticOption(id="new_circuits", label="Lúng túng 4 mạch GDPT mới (Nhiệt, Khí lí tưởng, Cảm ứng, Hạt nhân)", subtext="Khái niệm vi mô, mô hình phân tử và phương trình trạng thái khí"),
                    DiagnosticOption(id="dimension_units", label="Sai thứ nguyên đơn vị và quy đổi chuẩn SI", subtext="Nhầm lẫn đơn vị áp suất (Pa, mmHg), nhiệt độ Kenvin và Celsius"),
                    DiagnosticOption(id="graph_experiment", label="Sợ câu hỏi khai thác đồ thị và thí nghiệm thực hành", subtext="Khó bóc tách sai số và hệ số góc trên đồ thị thực nghiệm"),
                    DiagnosticOption(id="true_false_traps", label="Bẫy lý thuyết ở phần câu hỏi Đúng/Sai", subtext="Nắm hời hợt bản chất nên dễ chọn nhầm các mệnh đề bẫy")
                ]
            ),
            DiagnosticQuestion(
                id="physics_method",
                subject="Vật lí",
                question="Phương pháp học tập bạn cảm thấy hiệu quả nhất cho môn Lí:",
                category="method",
                options=[
                    DiagnosticOption(id="nature_first", label="Học lại bản chất hiện tượng từ ví dụ thực tiễn", subtext="Hiểu sâu 'tại sao' trước khi học thuộc lòng công thức"),
                    DiagnosticOption(id="graph_mastery", label="Luyện kỹ năng đọc và giải mã đồ thị thực nghiệm", subtext="Nắm phương pháp xác định điểm đầu, điểm cuối và độ dốc đồ thị")
                ]
            )
        ]
    elif "hóa" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="chem_blocker",
                subject="Hóa học",
                question="Ở môn Hóa học GDPT mới, trở ngại lớn nhất của bạn lúc này là gì?",
                category="blocker",
                options=[
                    DiagnosticOption(id="iupac_nomenclature", label="Chưa quen danh pháp IUPAC quốc tế và thuật ngữ mới", subtext="Dễ lẫn lộn tên gọi acid, este, amine theo phiên âm cũ vs quốc tế"),
                    DiagnosticOption(id="thermo_complex", label="Sợ phần Nhiệt hóa học (Biến thiên Enthalpy) & Phức chất", subtext="Khó nhớ công thức tính Delta_r H và cấu trúc phối tử phức chất"),
                    DiagnosticOption(id="practical_experiment", label="Thao tác thí nghiệm và mô tả hiện tượng trực quan", subtext="Chưa hình dung rõ màu sắc kết tủa, khí thoát ra và biện pháp an toàn"),
                    DiagnosticOption(id="conservation_math", label="Bài toán vận dụng định luật bảo toàn", subtext="Bảo toàn khối lượng, bảo toàn electron, bảo toàn điện tích")
                ]
            ),
            DiagnosticQuestion(
                id="chem_method",
                subject="Hóa học",
                question="Bạn muốn củng cố môn Hóa theo định hướng nào?",
                category="method",
                options=[
                    DiagnosticOption(id="reaction_mindmap", label="Sơ đồ tư duy cơ chế phản ứng và màu sắc đặc trưng", subtext="Học qua hình ảnh và sơ đồ chuỗi phản ứng trực quan"),
                    DiagnosticOption(id="true_false_breakdown", label="Rèn kỹ thuật bóc tách 4 ý của câu hỏi Đúng/Sai", subtext="Kiểm tra kỹ từng nhận định để lấy trọn vẹn điểm số phần II")
                ]
            )
        ]
    elif "sinh" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="bio_blocker",
                subject="Sinh học",
                question="Khó khăn lớn nhất khiến bạn cảm thấy môn Sinh học quá tải:",
                category="blocker",
                options=[
                    DiagnosticOption(id="dna_mechanisms", label="Nhầm lẫn chiều 3' -> 5' và các enzyme nhân đôi/phiên mã", subtext="Dễ nhầm mạch mã gốc, mạch bổ sung và vai trò của DNA/RNA polymerase"),
                    DiagnosticOption(id="hardy_weinberg", label="Bài toán di truyền quần thể & cân bằng Hardy-Weinberg", subtext="Lúng túng khi quần thể chịu tác động của đột biến, chọn lọc tự nhiên"),
                    DiagnosticOption(id="pedigree_analysis", label="Phân tích phả hệ y học và xác suất di truyền liên kết", subtext="Khó xác định gen trội/lặn trên NST thường hay NST giới tính"),
                    DiagnosticOption(id="wording_traps", label="Bẫy câu chữ tinh vi về tỉ lệ kiểu gen / kiểu hình", subtext="Đọc lướt dẫn đến tính sai tỉ lệ cá thể mang kiểu hình trội/lặn")
                ]
            ),
            DiagnosticQuestion(
                id="bio_method",
                subject="Sinh học",
                question="Cách tiếp cận giúp bạn ghi nhớ kiến thức Sinh học lâu nhất:",
                category="method",
                options=[
                    DiagnosticOption(id="diagram_visual", label="Trực quan hóa qua sơ đồ cơ chế tế bào & infographic", subtext="Học quy luật sinh học qua hình ảnh thay vì đọc chữ dài"),
                    DiagnosticOption(id="eval_logic", label="Rèn tư duy logic giải quyết bài toán Đúng/Sai và phân tích số liệu", subtext="Phân tích câu hỏi theo phương pháp khoa học thực nghiệm")
                ]
            )
        ]
    elif "tin" in subject_normalized or "tin học" in subject_normalized or "computer" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="cs_blocker",
                subject="Tin học",
                question="Ở môn Tin học, phần kiến thức nào khiến bạn hay bị lỗi nhất?",
                category="blocker",
                options=[
                    DiagnosticOption(id="python_trace", label="Truy vết giá trị biến trong vòng lặp/đệ quy Python", subtext="Khó nắm bắt biến đổi giá trị sau từng bước lặp hoặc gọi đệ quy"),
                    DiagnosticOption(id="sql_db", label="Nhầm lẫn Khóa chính, Khóa ngoại và quan hệ bảng CSDL", subtext="Lúng túng khi viết câu truy vấn SELECT, JOIN và lọc dữ liệu"),
                    DiagnosticOption(id="web_html_css", label="Cú pháp thẻ HTML và cấu trúc bố cục CSS", subtext="Quên thuộc tính và cấu trúc phân cấp cây DOM"),
                    DiagnosticOption(id="network_ip", label="Phân biệt dải địa chỉ IP Public/Private và thiết bị mạng", subtext="Khái niệm trừu tượng về tầng mạng và bảo mật dữ liệu")
                ]
            ),
            DiagnosticQuestion(
                id="cs_direction",
                subject="Tin học",
                question="Định hướng môn Tin học của bạn trong kỳ thi tốt nghiệp / nghề nghiệp:",
                category="direction",
                options=[
                    DiagnosticOption(id="cs_algorithms", label="Khoa học máy tính (CS): Thuật toán & Tư duy lập trình", subtext="Rèn luyện kỹ năng giải thuật toán tối ưu với Python"),
                    DiagnosticOption(id="ict_applied", label="Tin học ứng dụng (ICT): Thiết kế Web, CSDL và Mạng máy tính", subtext="Tập trung xây dựng ứng dụng thực tế và phân tích dữ liệu")
                ]
            )
        ]
    elif "văn" in subject_normalized or "ngữ văn" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="lit_blocker",
                subject="Ngữ văn",
                question="Khi làm bài kiểm tra Ngữ văn cấu trúc mới, khó khăn lớn nhất của bạn là gì?",
                category="blocker",
                options=[
                    DiagnosticOption(id="unseen_text", label="Lúng túng trước ngữ liệu mới toanh ngoài sách giáo khoa", subtext="Chưa có phương pháp giải mã văn bản văn học lạ và văn bản thông tin"),
                    DiagnosticOption(id="social_essay", label="Viết đoạn Nghị luận xã hội 200 chữ thiếu dẫn chứng thực tế", subtext="Lập luận chung chung, chưa đưa ra góc nhìn đa chiều và bài học hành động"),
                    DiagnosticOption(id="literary_essay", label="Bài Nghị luận văn học sa vào kể chuyện, thiếu chất lý luận", subtext="Chưa biết làm nổi bật đặc trưng thể loại, nghệ thuật và phong cách tác giả"),
                    DiagnosticOption(id="time_pacing", label="Kiểm soát thời gian 120 phút không kịp phân bổ đều", subtext="Dành quá nhiều thời gian cho phần Đọc hiểu dẫn đến viết vội phần Nghị luận")
                ]
            ),
            DiagnosticQuestion(
                id="lit_method",
                subject="Ngữ văn",
                question="Chiến lược ôn luyện Văn bạn muốn tập trung phát triển:",
                category="method",
                options=[
                    DiagnosticOption(id="rubric_mastery", label="Nắm vững khung Rubrics chấm điểm 5 câu phần Đọc hiểu", subtext="Rèn kỹ thuật trả lời ngắn gọn, chuẩn từ khóa, ăn trọn 4.0 điểm"),
                    DiagnosticOption(id="argument_technique", label="Rèn công thức lập luận đa chiều và kho dẫn chứng thời sự", subtext="Xây dựng ngân hàng dẫn chứng sống động cho đoạn văn 200 chữ")
                ]
            )
        ]
    elif "sử" in subject_normalized or "lịch sử" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="history_blocker",
                subject="Lịch sử",
                question="Rào cản khiến bạn sợ môn Lịch sử nhất hiện nay:",
                category="blocker",
                options=[
                    DiagnosticOption(id="rote_forgetting", label="Học vẹt nhớ trước quên sau do nhồi nhét mốc thời gian rời rạc", subtext="Không liên kết được dòng chảy lịch sử thành một câu chuyện logic"),
                    DiagnosticOption(id="cause_vs_pretext", label="Nhầm lẫn nguyên nhân sâu xa với duyên cớ bùng nổ sự kiện", subtext="Dễ mắc bẫy ở các câu hỏi phân tích bản chất lịch sử"),
                    DiagnosticOption(id="absolute_wording", label="Sập bẫy các từ ngữ mang tính tuyệt đối ('hoàn toàn', 'duy nhất')", subtext="Đọc lướt qua các từ khóa hạn chế dẫn đến chọn sai đáp án"),
                    DiagnosticOption(id="primary_sources", label="Lúng túng khai thác đoạn trích tư liệu gốc ở câu Đúng/Sai", subtext="Khó đối chiếu nhận định trong đề với ngữ cảnh lịch sử thực tế")
                ]
            ),
            DiagnosticQuestion(
                id="history_method",
                subject="Lịch sử",
                question="Cách bạn muốn hệ thống hóa kiến thức Lịch sử:",
                category="method",
                options=[
                    DiagnosticOption(id="timeline_cause_effect", label="Tiếp cận theo trục thời gian nhân - quả và so sánh chuyên đề", subtext="Học lịch sử như một chuỗi nguyên nhân và hệ quả tất yếu"),
                    DiagnosticOption(id="mindmap_global", label="Sơ đồ tư duy liên kết sự kiện Việt Nam với bối cảnh thế giới", subtext="Mở rộng tầm nhìn liên môn và khả năng đánh giá toàn diện")
                ]
            )
        ]
    elif "địa" in subject_normalized or "địa lí" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="geo_blocker",
                subject="Địa lí",
                question="Khó khăn lớn nhất của bạn trong bài thi Địa lí GDPT mới:",
                category="blocker",
                options=[
                    DiagnosticOption(id="map_reliance", label="Phụ thuộc Atlat giấy cũ, chưa quen đọc bản đồ số/lược đồ chuyên đề", subtext="Đề thi mới tập trung vào lược đồ biểu diễn quy luật tự nhiên và kinh tế"),
                    DiagnosticOption(id="climate_winds", label="Nhầm lẫn hướng gió mùa và sự phân hóa khí hậu các miền", subtext="Gió mùa mùa đông, gió mùa mùa hạ và tác động của dải hội tụ nhiệt đới"),
                    DiagnosticOption(id="data_calculation", label="Tính toán sai số liệu và quy tắc làm tròn (biên độ nhiệt, cán cân...)", subtext="Dễ mất điểm ở phần III trả lời ngắn do sai quy tắc làm tròn 1 chữ số thập phân"),
                    DiagnosticOption(id="economic_shift", label="Chưa nắm rõ chuyển dịch cơ cấu ngành kinh tế và vùng kinh tế trọng điểm", subtext="Khó giải thích nguyên nhân tăng trưởng các ngành công nghiệp mũi nhọn")
                ]
            ),
            DiagnosticQuestion(
                id="geo_method",
                subject="Địa lí",
                question="Kỹ năng Địa lí bạn muốn rèn luyện sắc bén nhất:",
                category="method",
                options=[
                    DiagnosticOption(id="rule_nature_economy", label="Phân tích quy luật nhân quả địa lí tự nhiên & kinh tế vùng", subtext="Hiểu mối quan hệ biện chứng giữa tài nguyên thiên nhiên và phát triển kinh tế"),
                    DiagnosticOption(id="data_speed", label="Rèn kỹ năng giải bài tính toán điền số phần III nhanh và chuẩn", subtext="Luyện công thức tính mật độ, tỉ trọng, tốc độ tăng trưởng")
                ]
            )
        ]
    elif "kinh tế" in subject_normalized or "pháp luật" in subject_normalized or "gdkt" in subject_normalized or "gkt" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="law_blocker",
                subject="GDKT & PL",
                question="Trở ngại lớn nhất của bạn khi giải quyết các tình huống môn GDKT & PL:",
                category="blocker",
                options=[
                    DiagnosticOption(id="multi_character_case", label="Bối rối trước các tình huống nhiều nhân vật lắt léo (A, B, C, D)", subtext="Dễ xác định nhầm ai là người vi phạm và vi phạm quyền gì"),
                    DiagnosticOption(id="rights_confusion", label="Nhầm lẫn quyền bất khả xâm phạm thân thể với bảo hộ tính mạng/sức khỏe", subtext="Khái niệm pháp lý gần nhau dễ dẫn đến chọn sai phương án"),
                    DiagnosticOption(id="violation_types", label="Phân biệt 4 loại vi phạm pháp luật (Hình sự, Hành chính, Dân sự, Kỷ luật)", subtext="Chưa nắm vững ranh giới mức độ nguy hiểm cho xã hội của hành vi"),
                    DiagnosticOption(id="market_economy", label="Các chỉ tiêu kinh tế vĩ mô (GDP, CPI, Lạm phát, Thất nghiệp)", subtext="Khó áp dụng lý thuyết kinh tế để giải thích biến động thị trường thực tế")
                ]
            ),
            DiagnosticQuestion(
                id="law_method",
                subject="GDKT & PL",
                question="Cách học giúp bạn giải quyết nhanh các tình huống thực tế:",
                category="method",
                options=[
                    DiagnosticOption(id="case_diagram", label="Vẽ sơ đồ bóc tách hành vi nhân vật trong case study", subtext="Phương pháp phân vai tách bạch hành vi vi phạm từng cá nhân"),
                    DiagnosticOption(id="rights_table", label="Bảng so sánh cốt lõi các quyền tự do cơ bản và nghĩa vụ công dân", subtext="Ghi nhớ nhanh các dấu hiệu đặc trưng của từng quyền")
                ]
            )
        ]
    elif "anh" in subject_normalized or "tiếng anh" in subject_normalized or "english" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="eng_blocker",
                subject="Tiếng Anh",
                question="Rào cản lớn nhất của bạn với cấu trúc đề thi Tiếng Anh GDPT mới:",
                category="blocker",
                options=[
                    DiagnosticOption(id="thematic_vocab", label="Thiếu từ vựng theo chủ đề mới (Trí tuệ nhân tạo, Môi trường, Lối sống xanh)", subtext="Gặp nhiều từ lạ trong bài đọc dẫn đến mất phương hướng"),
                    DiagnosticOption(id="reading_stamina", label="Yếu phản xạ đọc hiểu đoạn văn dài và bẫy câu hỏi suy luận (Inference)", subtext="Mất quá nhiều thời gian đọc từng chữ, không kịp giờ làm bài"),
                    DiagnosticOption(id="phonetics_traps", label="Bẫy trọng âm - phát âm và ngữ điệu câu giao tiếp", subtext="Dễ mất điểm ở phần ngữ âm do quen phát âm theo thói quen"),
                    DiagnosticOption(id="complex_structures", label="Nhầm lẫn các thì và cấu trúc câu phức, câu đảo ngữ, giả định", subtext="Khó nhận biết công thức khi đề bài thay đổi trật tự từ")
                ]
            ),
            DiagnosticQuestion(
                id="eng_method",
                subject="Tiếng Anh",
                question="Phương pháp bạn muốn áp dụng để nâng bậc điểm môn Tiếng Anh:",
                category="method",
                options=[
                    DiagnosticOption(id="context_collocations", label="Học từ vựng qua ngữ cảnh văn cảnh & cụm Collocations / Idioms", subtext="Ghi nhớ từ đi kèm với giới từ và ví dụ câu thực tế"),
                    DiagnosticOption(id="skimming_scanning", label="Kỹ thuật Skimming & Scanning dò từ khóa bài đọc chuẩn xác", subtext="Định vị nhanh thông tin mà không cần dịch từng câu chữ")
                ]
            )
        ]
    else:
        return [
            DiagnosticQuestion(
                id="general_blocker",
                subject=subject,
                question=f"Mục tiêu quan trọng nhất với môn {subject} trong 30 ngày tới:",
                category="blocker",
                options=[
                    DiagnosticOption(id="core_foundation", label="Lấp đầy các lỗ hổng kiến thức nền tảng", subtext="Hiểu rõ các khái niệm căn bản và định lý cốt lõi"),
                    DiagnosticOption(id="practice_speed", label="Tăng tốc độ làm bài và độ chính xác", subtext="Rèn luyện phản xạ giải đề thi"),
                    DiagnosticOption(id="confidence", label="Xóa bỏ cảm giác sợ môn học, tạo thói quen học nhẹ nhàng", subtext="Tự tin mỗi khi mở sách vở ra học")
                ]
            )
        ]

# --- 3. ONBOARDING & KHẢO SÁT CÁ NHÂN HÓA ---
@router.post("/onboarding", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def onboard_student(data: StudentCreate, db: Session = Depends(get_db)):
    student_id = f"hs_{uuid.uuid4().hex[:8]}"

    # Xử lý danh sách môn học
    subjects = data.target_subjects if (data.target_subjects and len(data.target_subjects) > 0) else [data.target_subject or "Toán học"]
    primary_subject = subjects[0]

    # Suy luận mặc định nếu người dùng để trống
    weakness_val = data.weakness or f"Kiến thức cốt lõi môn {', '.join(subjects)}"
    goal_val = data.long_term_goal or f"Đạt 8.5+ môn {', '.join(subjects)} và tự tin khi làm bài"

    student = Student(
        id=student_id,
        user_id=data.user_id,
        name=data.name.strip() if data.name else "Bạn học nhỏ",
        grade=data.grade,
        target_subject=primary_subject,
        target_subjects=subjects,
        emotion_scale=data.emotion_scale,
        weakness=weakness_val,
        long_term_goal=goal_val,
        timeframe=data.timeframe,
        learning_style=data.learning_style or "visual",
        selected_flower=data.selected_flower or "sunflower",
        diagnostic_answers=data.diagnostic_answers or {}
    )
    db.add(student)
    db.flush()

    # Sinh lộ trình qua AI (kèm fallback sư phạm)
    roadmap_data = await call_ai_roadmap(data)
    roadmap = Roadmap(
        student_id=student.id,
        milestones=[m.model_dump() for m in roadmap_data.milestones],
        initial_daily_tasks=[t.model_dump() for t in roadmap_data.initial_daily_tasks],
        encouraging_message=roadmap_data.encouraging_message
    )
    db.add(roadmap)

    # Gieo sẵn nhiệm vụ vào Planning Page, có gắn môn học tương ứng
    categories = ["Lý thuyết", "Bài tập", "Ôn luyện", "Lý thuyết", "Nghỉ ngơi"]
    for idx, task in enumerate(roadmap_data.initial_daily_tasks):
        assigned_subject = task.subject if task.subject else subjects[idx % len(subjects)]
        planned = PlannedTask(
            student_id=student.id,
            title=task.title,
            duration_minutes=task.duration_minutes,
            subject=assigned_subject,
            category=task.category or categories[idx % len(categories)],
            tip=task.tip,
            is_completed=False,
            day_offset=idx + 1
        )
        db.add(planned)

    # Khởi tạo chậu hoa ban đầu: 0 ngày (Hạt mầm), ngày điểm danh trước là hôm qua để hôm nay làm nhiệm vụ xong điểm danh sẽ lên Ngày 1!
    yesterday = date.today() - timedelta(days=1)
    initial_flower = FlowerStatus(
        student_id=student.id,
        current_state=FlowerState.TICH_CUC,
        consecutive_days=0,
        last_checkin_date=yesterday,
        water_drops=1,
        story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
    )
    db.add(initial_flower)
    inventory = get_or_create_inventory(student_id, db)
    ensure_badges_seeded(db)
    # Thưởng huy hiệu Tiên Phong ngày đầu
    check_and_award_badges(student_id, 1, None, db)

    # Lưu tâm thư ngày 1 nếu có
    if data.initial_time_capsule and data.initial_time_capsule.strip():
        capsule_id = f"cap_{uuid.uuid4().hex[:8]}"
        capsule = TimeCapsule(
            id=capsule_id,
            student_id=student_id,
            author_type="STUDENT",
            title="Tâm thư ngày đầu tiên gửi người vượt trọng lực",
            letter_content=data.initial_time_capsule.strip(),
            target_unlock_day=21,
            status=CapsuleStatus.SEALED
        )
        db.add(capsule)
        db.commit()

    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.name,
        grade=student.grade,
        target_subject=student.target_subject,
        target_subjects=student.target_subjects,
        emotion_scale=student.emotion_scale,
        weakness=student.weakness,
        long_term_goal=student.long_term_goal,
        timeframe=student.timeframe,
        learning_style=student.learning_style,
        diagnostic_answers=student.diagnostic_answers,
        created_at=student.created_at,
        roadmap=roadmap_data,
        flower_state=initial_flower.current_state
    )

@router.get("/student/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    roadmap = db.query(Roadmap).filter(Roadmap.student_id == student_id).order_by(desc(Roadmap.created_at)).first()
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()

    roadmap_resp = None
    if roadmap:
        roadmap_resp = RoadmapResponse(
            milestones=roadmap.milestones,
            initial_daily_tasks=roadmap.initial_daily_tasks,
            encouraging_message=roadmap.encouraging_message
        )

    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.name,
        grade=student.grade,
        target_subject=student.target_subject,
        target_subjects=student.target_subjects or [student.target_subject],
        emotion_scale=student.emotion_scale or 4,
        weakness=student.weakness,
        long_term_goal=student.long_term_goal,
        timeframe=student.timeframe,
        learning_style=student.learning_style,
        diagnostic_answers=student.diagnostic_answers,
        created_at=student.created_at,
        roadmap=roadmap_resp,
        flower_state=flower.current_state if flower else None
    )

# --- 4. PLANNING PAGE API (KẾ HOẠCH HỌC TẬP) ---
@router.get("/planning/{student_id}", response_model=PlanningOverviewResponse)
def get_planning_overview(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    tasks = db.query(PlannedTask).filter(PlannedTask.student_id == student_id).order_by(PlannedTask.day_offset, PlannedTask.id).all()
    roadmap = db.query(Roadmap).filter(Roadmap.student_id == student_id).order_by(desc(Roadmap.created_at)).first()

    tasks_by_day: Dict[int, List[PlannedTaskResponse]] = {}
    completed_count = 0
    for t in tasks:
        day = t.day_offset
        if day not in tasks_by_day:
            tasks_by_day[day] = []
        tasks_by_day[day].append(PlannedTaskResponse.model_validate(t))
        if t.is_completed:
            completed_count += 1

    total_tasks = len(tasks)
    percentage = int((completed_count / total_tasks * 100)) if total_tasks > 0 else 0

    milestones = roadmap.milestones if roadmap else []

    return PlanningOverviewResponse(
        student_id=student.id,
        student_name=student.name,
        target_subject=student.target_subject,
        target_subjects=student.target_subjects or [student.target_subject],
        emotion_scale=student.emotion_scale or 4,
        long_term_goal=student.long_term_goal,
        total_tasks=total_tasks,
        completed_tasks=completed_count,
        completion_percentage=percentage,
        tasks_by_day=tasks_by_day,
        milestones=milestones
    )

@router.post("/planning/{student_id}/task", response_model=PlannedTaskResponse)
def add_planned_task(student_id: str, data: PlannedTaskCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    task = PlannedTask(
        student_id=student_id,
        title=data.title.strip(),
        duration_minutes=data.duration_minutes,
        subject=data.subject or student.target_subject,
        category=data.category,
        tip=data.tip,
        day_offset=data.day_offset,
        is_completed=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return PlannedTaskResponse.model_validate(task)

@router.patch("/planning/task/{task_id}", response_model=PlannedTaskResponse)
def update_task_status(task_id: int, data: PlannedTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")

    if data.is_completed is not None:
        task.is_completed = data.is_completed
    if data.title is not None:
        task.title = data.title.strip()
    if data.duration_minutes is not None:
        task.duration_minutes = data.duration_minutes
    if data.subject is not None:
        task.subject = data.subject
    if data.category is not None:
        task.category = data.category
    if data.tip is not None:
        task.tip = data.tip

    db.commit()
    db.refresh(task)
    return PlannedTaskResponse.model_validate(task)

@router.delete("/planning/task/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")
    db.delete(task)
    db.commit()
    return {"success": True, "message": "Đã xóa nhiệm vụ"}

# --- 5. DAILY CHECK-IN & AI FEEDBACK ---
@router.post("/checkin", response_model=CheckinResponse)
async def submit_daily_checkin(data: CheckinCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    # Kiểm tra điều kiện: Phải hoàn thành tất cả nhiệm vụ trong To-do list của ngày hôm nay (day_offset = 1 hoặc các nhiệm vụ đang giao)
    # Lấy các nhiệm vụ của ngày hôm nay (day_offset == 1, nếu không có day_offset == 1 thì kiểm tra tất cả nhiệm vụ ngày đầu)
    planned_tasks = db.query(PlannedTask).filter(
        PlannedTask.student_id == data.student_id,
        PlannedTask.day_offset == 1
    ).all()
    if not planned_tasks:
        # Nếu chưa phân day_offset == 1, lấy các nhiệm vụ đang có
        planned_tasks = db.query(PlannedTask).filter(PlannedTask.student_id == data.student_id).all()

    if planned_tasks:
        uncompleted_tasks = [t for t in planned_tasks if not t.is_completed]
        if uncompleted_tasks:
            raise HTTPException(
                status_code=400,
                detail=f"Bạn còn {len(uncompleted_tasks)} nhiệm vụ hôm nay chưa hoàn thành! Hãy đánh dấu hoàn thành tất cả nhiệm vụ trong danh sách để được thắp sáng chuỗi nhé."
            )
    ai_feedback = await call_ai_mentor(data, student)
    recent_checkins = db.query(DailyCheckin)\
        .order_by(desc(DailyCheckin.created_at))\
        .limit(2)\
        .all()

    needs_attention = False
    scale = data.emotion_scale or 4
    if (scale <= 2 or data.mood in [MoodType.STRESSED, MoodType.TIRED]) and data.completion_rate < 50:
        if any(c.mood in [MoodType.STRESSED, MoodType.TIRED] for c in recent_checkins):
            needs_attention = True

    checkin_record = DailyCheckin(
        student_id=data.student_id,
        completion_rate=data.completion_rate or 75,
        subject_difficulty=data.subject_difficulty,
        action_reflection=data.action_reflection,
        mood=data.mood or MoodType.HAPPY,
        emotion_scale=scale,
        energy_level=data.energy_level if data.energy_level is not None else 70,
        confidence_stars=data.confidence_stars if data.confidence_stars is not None else 3,
        completed_subjects=data.completed_subjects or [],
        micro_wins=data.micro_wins or [],
        bottleneck_key=data.bottleneck_key or "none",
        weekday_answer=data.weekday_answer,
        ai_feedback=ai_feedback,
        needs_attention=needs_attention
    )
    db.add(checkin_record)

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == data.student_id).first()
    inventory = get_or_create_inventory(data.student_id, db)
    today = date.today()
    shield_used = False
    shield_message = None

    if not flower:
        flower = FlowerStatus(
            student_id=data.student_id,
            current_state=FlowerState.TICH_CUC,
            consecutive_days=1,
            last_checkin_date=today,
            water_drops=1,
            story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
        )
        db.add(flower)
    else:
        new_state, new_consecutive, story, shield_used, shield_message = calculate_flower_state(
            current_state=flower.current_state,
            last_checkin_date=flower.last_checkin_date,
            checkin_date=today,
            consecutive_days=flower.consecutive_days,
            completion_rate=data.completion_rate or 75,
            mood=data.mood or MoodType.HAPPY,
            inventory=inventory
        )
        flower.current_state = new_state
        flower.consecutive_days = new_consecutive
        flower.last_checkin_date = today
        flower.water_drops += 1
        flower.story_message = story

    # Kiểm tra trao thưởng cột mốc streak & hành vi
    newly_unlocked = check_and_award_badges(
        student_id=data.student_id,
        streak=flower.consecutive_days,
        micro_wins=data.micro_wins,
        db=db
    )

    # Thưởng khiên hộ mệnh tại mốc ngày 3
    if flower.consecutive_days == 3 and inventory.freeze_shields_available < 2:
        inventory.freeze_shields_available += 1

    # Tự động mở khóa Time Capsule nếu đạt ngày 21
    if flower.consecutive_days >= 21:
        caps = db.query(TimeCapsule).filter(
            TimeCapsule.student_id == data.student_id,
            TimeCapsule.status == CapsuleStatus.SEALED
        ).all()
        for c in caps:
            c.status = CapsuleStatus.UNLOCKED
            c.unlocked_at = datetime.now()

    db.commit()
    db.refresh(checkin_record)
    db.refresh(flower)
    db.refresh(inventory)

    return CheckinResponse(
        id=checkin_record.id,
        student_id=checkin_record.student_id,
        completion_rate=checkin_record.completion_rate,
        subject_difficulty=checkin_record.subject_difficulty,
        action_reflection=checkin_record.action_reflection,
        mood=checkin_record.mood,
        emotion_scale=scale,
        energy_level=checkin_record.energy_level,
        confidence_stars=checkin_record.confidence_stars,
        completed_subjects=checkin_record.completed_subjects,
        micro_wins=checkin_record.micro_wins,
        bottleneck_key=checkin_record.bottleneck_key,
        weekday_answer=checkin_record.weekday_answer,
        ai_feedback=checkin_record.ai_feedback,
        needs_attention=checkin_record.needs_attention,
        created_at=checkin_record.created_at,
        streak_days=flower.consecutive_days,
        flower_state=flower.current_state,
        water_drops=flower.water_drops,
        shield_used=shield_used,
        shield_message=shield_message,
        newly_unlocked_badges=newly_unlocked
    )

# --- 6. KHU VƯỜN & TƯỚI NƯỚC (GARDEN STATUS) ---
@router.get("/garden/{student_id}", response_model=GardenStatusResponse)
def get_garden_status(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    today = date.today()

    if not flower:
        flower = FlowerStatus(
            student_id=student_id,
            current_state=FlowerState.TICH_CUC,
            consecutive_days=1,
            last_checkin_date=today,
            water_drops=1,
            story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
        )
        db.add(flower)
        db.commit()
        db.refresh(flower)
    else:
        delta_days = (today - flower.last_checkin_date).days
        if delta_days >= 2 and flower.current_state not in [FlowerState.THIEU_NUOC, FlowerState.HEO_KHO]:
            new_state, story = evaluate_inactive_state(flower.last_checkin_date, today, consecutive_days=flower.consecutive_days)
            flower.current_state = new_state
            flower.story_message = story
            db.commit()
            db.refresh(flower)
    recent_checkins = db.query(DailyCheckin)\
        .filter(DailyCheckin.student_id == student_id)\
        .order_by(desc(DailyCheckin.created_at))\
        .limit(7)\
        .all()

    recent_moods = [c.mood.value for c in reversed(recent_checkins)]
    completion_trend = [c.completion_rate for c in reversed(recent_checkins)]

    inventory = get_or_create_inventory(student_id, db)
    ensure_badges_seeded(db)

    # Danh sách badges
    student_badge_records = db.query(StudentBadge).filter(StudentBadge.student_id == student_id).all()
    unlocked_badge_map = {sb.badge_id: sb.unlocked_at for sb in student_badge_records}
    all_badges = db.query(Badge).all()
    badge_responses = []
    for b in all_badges:
        is_unlocked = b.id in unlocked_badge_map
        badge_responses.append(BadgeResponse(
            id=b.id,
            category=b.category.value if hasattr(b.category, "value") else str(b.category),
            title=b.title,
            description=b.description,
            icon=b.icon,
            required_streak=b.required_streak,
            unlocked=is_unlocked,
            unlocked_at=unlocked_badge_map.get(b.id)
        ))

    # Time capsule
    capsule = db.query(TimeCapsule).filter(TimeCapsule.student_id == student_id).order_by(desc(TimeCapsule.created_at)).first()
    capsule_resp = None
    if capsule:
        capsule_resp = TimeCapsuleResponse(
            id=capsule.id,
            student_id=capsule.student_id,
            author_type=capsule.author_type,
            title=capsule.title,
            letter_content=capsule.letter_content,
            target_unlock_day=capsule.target_unlock_day,
            unlock_at_date=capsule.unlock_at_date,
            status=capsule.status.value if hasattr(capsule.status, "value") else str(capsule.status),
            created_at=capsule.created_at,
            unlocked_at=capsule.unlocked_at
        )

    # Hành trình 21 ngày
    journey_milestones = [
        MilestoneReward(**m) for m in get_journey_milestones_status(flower.consecutive_days)
    ]

    return GardenStatusResponse(
        student_id=student.id,
        student_name=student.name,
        selected_flower=getattr(student, "selected_flower", "sunflower") or "sunflower",
        current_state=flower.current_state,
        consecutive_days=flower.consecutive_days,
        water_drops=flower.water_drops,
        last_checkin_date=flower.last_checkin_date,
        story_message=flower.story_message or STORY_MESSAGES[flower.current_state],
        recent_moods=recent_moods,
        completion_trend=completion_trend,
        shields_available=inventory.freeze_shields_available,
        grace_passes_available=inventory.grace_passes_available or 0,
        saved_streak_before_break=inventory.saved_streak_before_break or 0,
        can_restore_streak=(inventory.grace_passes_available or 0) > 0 and (inventory.saved_streak_before_break or 0) > flower.consecutive_days,
        unlocked_badges_count=len(unlocked_badge_map),
        badges=badge_responses,
        active_capsule=capsule_resp,
        journey_milestones=journey_milestones
    )

@router.post("/garden/{student_id}/water", response_model=WaterActionResponse)
def water_flower(student_id: str, db: Session = Depends(get_db)):
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    if not flower:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vườn")

    if flower.water_drops <= 0:
        return WaterActionResponse(
            success=False,
            message="Hết giọt nước rồi. Hoàn thành check-in để nhận thêm nước mát nhé!",
            new_state=flower.current_state,
            water_drops=flower.water_drops
        )

    flower.water_drops -= 1
    if flower.current_state == FlowerState.THIEU_NUOC:
        flower.current_state = FlowerState.TICH_CUC
        flower.story_message = "Cành lá đã tươi tỉnh và vươn mình trở lại sau khi nhận nước mát!"
    elif flower.current_state == FlowerState.HEO_KHO:
        flower.current_state = FlowerState.TICH_CUC
        flower.consecutive_days = 1
        flower.story_message = "Một mầm xanh non tơ đã nhú lên từ lòng đất ấm. Bắt đầu lại thật nhẹ nhàng!"

    db.commit()
    db.refresh(flower)

    return WaterActionResponse(
        success=True,
        message="Tưới nước thành công! Bông hoa đang mỉm cười đón nhận sự chăm sóc của bạn.",
        new_state=flower.current_state,
        water_drops=flower.water_drops
    )
@router.post("/garden/{student_id}/restore-streak", response_model=StreakRestoreResponse)
def restore_streak_endpoint(student_id: str, db: Session = Depends(get_db)):
    """Khôi phục lại chuỗi streak cho học sinh khi cây bị héo/đứt chuỗi"""
    success, msg, restored_streak, passes_left, flower_state = restore_student_streak(student_id=student_id, db=db)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return StreakRestoreResponse(
        success=True,
        message=msg,
        restored_streak=restored_streak,
        grace_passes_left=passes_left,
        flower_state=flower_state
    )

# --- 7. TIME CAPSULE & BADGES ENDPOINTS ---
@router.post("/capsule", response_model=TimeCapsuleResponse, status_code=status.HTTP_201_CREATED)
def create_time_capsule(data: TimeCapsuleCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    capsule_id = f"cap_{uuid.uuid4().hex[:8]}"
    capsule = TimeCapsule(
        id=capsule_id,
        student_id=data.student_id,
        author_type="STUDENT",
        title=data.title,
        letter_content=data.letter_content.strip(),
        target_unlock_day=data.target_unlock_day or 21,
        status=CapsuleStatus.SEALED
    )
    db.add(capsule)
    db.commit()
    db.refresh(capsule)

    return TimeCapsuleResponse(
        id=capsule.id,
        student_id=capsule.student_id,
        author_type=capsule.author_type,
        title=capsule.title,
        letter_content=capsule.letter_content,
        target_unlock_day=capsule.target_unlock_day,
        unlock_at_date=capsule.unlock_at_date,
        status=capsule.status.value,
        created_at=capsule.created_at,
        unlocked_at=capsule.unlocked_at
    )

@router.get("/capsule/{student_id}", response_model=List[TimeCapsuleResponse])
def get_student_capsules(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    capsules = db.query(TimeCapsule).filter(TimeCapsule.student_id == student_id).order_by(desc(TimeCapsule.created_at)).all()
    return [
        TimeCapsuleResponse(
            id=c.id,
            student_id=c.student_id,
            author_type=c.author_type,
            title=c.title,
            letter_content=c.letter_content,
            target_unlock_day=c.target_unlock_day,
            unlock_at_date=c.unlock_at_date,
            status=c.status.value if hasattr(c.status, "value") else str(c.status),
            created_at=c.created_at,
            unlocked_at=c.unlocked_at
        )
        for c in capsules
    ]

@router.post("/capsule/{capsule_id}/unlock", response_model=TimeCapsuleResponse)
def unlock_time_capsule(capsule_id: str, db: Session = Depends(get_db)):
    capsule = db.query(TimeCapsule).filter(TimeCapsule.id == capsule_id).first()
    if not capsule:
        raise HTTPException(status_code=404, detail="Không tìm thấy tâm thư")

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == capsule.student_id).first()
    current_streak = flower.consecutive_days if flower else 0

    if current_streak < capsule.target_unlock_day:
        raise HTTPException(
            status_code=400,
            detail=f"Tâm thư này được phong ấn đến ngày {capsule.target_unlock_day}. Hiện tại bạn đang ở ngày {current_streak}. Hãy kiên trì thêm chút nữa nhé!"
        )

    capsule.status = CapsuleStatus.UNLOCKED
    capsule.unlocked_at = datetime.now()
    db.commit()
    db.refresh(capsule)

    return TimeCapsuleResponse(
        id=capsule.id,
        student_id=capsule.student_id,
        author_type=capsule.author_type,
        title=capsule.title,
        letter_content=capsule.letter_content,
        target_unlock_day=capsule.target_unlock_day,
        unlock_at_date=capsule.unlock_at_date,
        status=capsule.status.value,
        created_at=capsule.created_at,
        unlocked_at=capsule.unlocked_at
    )

@router.get("/badges/{student_id}", response_model=List[BadgeResponse])
def get_student_badges(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    ensure_badges_seeded(db)
    student_badge_records = db.query(StudentBadge).filter(StudentBadge.student_id == student_id).all()
    unlocked_map = {sb.badge_id: sb.unlocked_at for sb in student_badge_records}

    all_badges = db.query(Badge).all()
    return [
        BadgeResponse(
            id=b.id,
            category=b.category.value if hasattr(b.category, "value") else str(b.category),
            title=b.title,
            description=b.description,
            icon=b.icon,
            required_streak=b.required_streak,
            unlocked=b.id in unlocked_map,
            unlocked_at=unlocked_map.get(b.id)
        )
        for b in all_badges
    ]

@router.get("/inventory/{student_id}", response_model=StreakInventoryResponse)
def get_student_inventory(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    inv = get_or_create_inventory(student_id, db)
    return StreakInventoryResponse(
        freeze_shields_available=inv.freeze_shields_available,
        grace_passes_available=inv.grace_passes_available,
        total_shields_used=inv.total_shields_used,
        last_shield_used_at=inv.last_shield_used_at
    )


# --- 7. TEACHER DASHBOARD ---
@router.get("/teacher/dashboard", response_model=TeacherDashboardResponse)
def get_teacher_dashboard(
    authorization: Optional[str] = Header(None),
    classroom: Optional[str] = None,
    db: Session = Depends(get_db)
):
    current_user: Optional[User] = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        u_id = token.split(":")[0] if ":" in token else None
        if u_id:
            current_user = db.query(User).filter(User.id == u_id).first()

    query = db.query(Student)

    # Nếu người dùng là Giáo Viên (không phải Admin) -> Chỉ lọc các học sinh thuộc lớp được phân công
    if current_user and current_user.role == UserRole.TEACHER:
        assigned = current_user.assigned_classes or []
        if "ALL" not in assigned and len(assigned) > 0:
            query = query.filter(Student.classroom.in_(assigned))
        elif len(assigned) == 0:
            # Chưa được phân công lớp nào
            query = query.filter(Student.id == "__NO_CLASS__")

    if classroom and classroom != "ALL":
        query = query.filter(Student.classroom == classroom)

    students = query.all()
    today = date.today()

    alert_items: List[StudentAlertItem] = []
    all_items: List[StudentAlertItem] = []

    for s in students:
        flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == s.id).first()
        latest_checkin = db.query(DailyCheckin)\
            .filter(DailyCheckin.student_id == s.id)\
            .order_by(desc(DailyCheckin.created_at))\
            .first()

        last_date = flower.last_checkin_date if flower else s.created_at.date()
        days_inactive = (today - last_date).days
        current_state = flower.current_state if flower else FlowerState.TICH_CUC
        consecutive_days = flower.consecutive_days if flower else 0

        alert_reason = "Bình thường"
        severity = "low"
        needs_attention = False

        if days_inactive >= 7:
            alert_reason = f"Đã vắng mặt {days_inactive} ngày"
            severity = "high"
            needs_attention = True
        elif latest_checkin and latest_checkin.needs_attention:
            alert_reason = "Áp lực kéo dài (Mood căng thẳng & tiến độ thấp)"
            severity = "high"
            needs_attention = True
        elif s.emotion_scale and s.emotion_scale <= 2:
            alert_reason = f"Cảm xúc học tập rất tiêu cực (Mức {s.emotion_scale}/7)"
            severity = "high"
            needs_attention = True
        elif current_state == FlowerState.THIEU_NUOC:
            alert_reason = "Cây thiếu nước (nghỉ 3-7 ngày)"
            severity = "medium"
            needs_attention = True
        elif latest_checkin and latest_checkin.mood in [MoodType.STRESSED, MoodType.TIRED]:
            alert_reason = "Tâm trạng gần đây mệt mỏi"
            severity = "medium"

        item = StudentAlertItem(
            student_id=s.id,
            student_name=s.name,
            grade=s.grade,
            classroom=s.classroom or "12A1",
            target_subject=s.target_subject,
            target_subjects=s.target_subjects or [s.target_subject],
            emotion_scale=s.emotion_scale or 4,
            current_state=current_state,
            consecutive_days=consecutive_days,
            days_since_last_checkin=days_inactive,
            last_mood=latest_checkin.mood if latest_checkin else None,
            selected_flower=getattr(s, "selected_flower", "sunflower") or "sunflower",
            alert_reason=alert_reason,
            severity=severity,
            needs_attention=needs_attention,
            latest_reflection=latest_checkin.action_reflection if latest_checkin else None
        )

        all_items.append(item)
        if needs_attention or severity in ["high", "medium"]:
            alert_items.append(item)

    return TeacherDashboardResponse(
        total_students=len(students),
        alert_students_count=len(alert_items),
        healthy_students_count=len(students) - len(alert_items),
        students_needing_attention=alert_items,
        all_students=all_items
    )

# --- 8. MICRO-QUIZ ENGINE ENDPOINTS (plan-Quest.txt) ---
@router.get("/quiz/daily/{student_id}", response_model=DailyQuizPackageResponse)
def get_daily_quiz(student_id: str, block: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Lấy bộ 3 câu trắc nghiệm nhanh hằng ngày (45s - 60s - 90s) theo khối thi.
    Tự động áp dụng cơ chế Ổ khóa 30 ngày (30-Day Streak Gatekeeper) để mở câu hỏi Boss phân hóa 8.5+.
    """
    try:
        return get_daily_quiz_package(db=db, student_id=student_id, requested_block=block)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/quiz/submit", response_model=QuizSubmissionResponse)
def submit_quiz_attempt(data: QuizSubmissionCreate, db: Session = Depends(get_db)):
    """
    Nộp bài trắc nghiệm nhanh 3 câu: chấm điểm tự động, giải thích vi mô tức thì,
    cộng giọt nước tưới cây và chuyển tiếp câu hỏi Boss sai đến Giáo viên Dashboard.
    """
    try:
        return submit_student_quiz(db=db, submission=data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/quiz/questions/grouped", response_model=List[SubjectQuestionGroup])
def get_all_questions_grouped_by_subject(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Quy toàn bộ câu hỏi (hệ thống tự sinh, giáo viên nạp, admin nạp) về 1 nơi lưu trữ tập trung
    và phân chia theo từng môn học có cấu trúc dữ liệu KaTeX.
    """
    ensure_quiz_bank_seeded(db)
    questions = db.query(QuizQuestion).order_by(QuizQuestion.subject, desc(QuizQuestion.created_at)).all()
    
    grouped: Dict[str, List[QuizQuestionAdmin]] = {}
    for q in questions:
        sub = q.subject or "Chung"
        if sub not in grouped:
            grouped[sub] = []
        grouped[sub].append(QuizQuestionAdmin.model_validate(q))
    
    result: List[SubjectQuestionGroup] = []
    for sub, q_list in sorted(grouped.items(), key=lambda x: x[0]):
        result.append(SubjectQuestionGroup(
            subject=sub,
            total_count=len(q_list),
            questions=q_list
        ))
    return result

@router.post("/quiz/inject", status_code=status.HTTP_201_CREATED)
def inject_new_quiz_question(
    data: TeacherInjectQuizCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Nạp câu hỏi mới:
    - Admin: Toàn quyền nạp mọi môn học.
    - Giáo viên: Chỉ được nạp câu hỏi thuộc môn được phân công (assigned_subject).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập để nạp câu hỏi")
    
    token = authorization.split(" ")[1]
    u_id = token.split(":")[0] if ":" in token else None
    current_user = db.query(User).filter(User.id == u_id).first()
    if not current_user or current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Chỉ có Giáo viên hoặc Quản trị viên mới có quyền nạp câu hỏi")

    # Kiểm tra ràng buộc phân công môn của Giáo viên
    if current_user.role == UserRole.TEACHER:
        teacher_sub = current_user.assigned_subject or "Toán học"
        if teacher_sub != "ALL" and teacher_sub.strip().lower() != data.subject.strip().lower():
            raise HTTPException(
                status_code=403,
                detail=f"Thầy/Cô chỉ được phân công phụ trách môn '{teacher_sub}', không thể tạo câu hỏi cho môn '{data.subject}'."
            )

    try:
        new_q = inject_teacher_quiz(db=db, data=data)
        # Ghi nhận người tạo cụ thể
        new_q.creator_role = "ADMIN" if current_user.role == UserRole.ADMIN else "TEACHER"
        new_q.creator_id = current_user.id
        db.commit()
        db.refresh(new_q)
        return {
            "success": True,
            "message": "Nạp câu hỏi mới vào hệ thống thành công!",
            "question_id": new_q.id,
            "block": new_q.block,
            "subject": new_q.subject,
            "creator_id": new_q.creator_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/quiz/questions/{question_id}", response_model=QuizQuestionAdmin)
def update_quiz_question(
    question_id: str,
    data: QuizQuestionUpdateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Sửa câu hỏi:
    - Admin: Có toàn quyền sửa bất kỳ câu hỏi nào.
    - Giáo viên: Chỉ được sửa câu hỏi do chính mình tạo (creator_id == current_user.id).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập")
    token = authorization.split(" ")[1]
    u_id = token.split(":")[0] if ":" in token else None
    current_user = db.query(User).filter(User.id == u_id).first()
    if not current_user or current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Không có quyền chỉnh sửa câu hỏi")

    q = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")

    if current_user.role == UserRole.TEACHER and q.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Giáo viên chỉ có quyền chỉnh sửa câu hỏi do chính mình tạo")

    # Cập nhật các trường
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(q, field, val)

    db.commit()
    db.refresh(q)
    return QuizQuestionAdmin.model_validate(q)

@router.delete("/quiz/questions/{question_id}")
def delete_quiz_question(
    question_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Xóa câu hỏi:
    - Admin: Có toàn quyền xóa bất kỳ câu hỏi nào.
    - Giáo viên: Chỉ có quyền xóa các câu hỏi do chính mình tạo.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập")
    token = authorization.split(" ")[1]
    u_id = token.split(":")[0] if ":" in token else None
    current_user = db.query(User).filter(User.id == u_id).first()
    if not current_user or current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Không có quyền xóa câu hỏi")

    q = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")

    if current_user.role == UserRole.TEACHER and q.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Giáo viên chỉ có quyền xóa các câu hỏi do chính mình tạo")

    db.delete(q)
    db.commit()
    return {"success": True, "message": f"Đã xóa thành công câu hỏi {question_id}"}

@router.get("/quiz/teacher/stats", response_model=List[TeacherQuizStatsItem])
def get_teacher_quiz_stats(db: Session = Depends(get_db)):
    """
    Thống kê các câu hỏi trắc nghiệm hay sai nhất để giáo viên nắm bắt lỗ hổng kiến thức của học sinh.
    """
    # Gom toàn bộ attempts
    attempts = db.query(StudentQuizAttempt).all()
    stat_map = {} # question_id -> {"total": int, "correct": int, "wrong": int}

    for a in attempts:
        if not a.details or not isinstance(a.details, list):
            continue
        for item in a.details:
            qid = item.get("question_id")
            if not qid:
                continue
            is_correct = bool(item.get("is_correct", False))
            if qid not in stat_map:
                stat_map[qid] = {"total": 0, "correct": 0, "wrong": 0}
            stat_map[qid]["total"] += 1
            if is_correct:
                stat_map[qid]["correct"] += 1
            else:
                stat_map[qid]["wrong"] += 1

    results: List[TeacherQuizStatsItem] = []
    for qid, s in stat_map.items():
        q = db.query(QuizQuestion).filter(QuizQuestion.id == qid).first()
        if not q:
            continue
        correct_rate = round((s["correct"] / s["total"] * 100), 1) if s["total"] > 0 else 0.0
        results.append(TeacherQuizStatsItem(
            question_id=q.id,
            block=q.block,
            subject=q.subject,
            question_text=q.question_text,
            source=q.source,
            total_attempts=s["total"],
            correct_rate=correct_rate,
            wrong_count=s["wrong"]
        ))

    # Sắp xếp câu hỏi có tỷ lệ sai nhiều nhất lên đầu
    results.sort(key=lambda x: (x.wrong_count, -x.correct_rate), reverse=True)
    return results

# --- 9. ADMIN PANEL APIS (QUẢN TRỊ VIÊN: THÊM/XÓA GIÁO VIÊN & HỌC SINH, PHÂN LỚP) ---
def require_admin_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập quyền Quản trị viên (Admin)")
    token = authorization.split(" ")[1]
    user_id = token.split(":")[0] if ":" in token else None
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Chỉ có Quản Trị Viên (Admin) mới có quyền thực hiện thao tác này")
    return user

@router.get("/admin/overview", response_model=AdminOverviewStats)
def get_admin_overview(
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Lấy tổng quan danh sách Giáo viên, Học sinh và Danh mục lớp học toàn trường."""
    teachers = db.query(User).filter(User.role == UserRole.TEACHER).order_by(desc(User.created_at)).all()
    students = db.query(Student).order_by(desc(Student.created_at)).all()
    classrooms_db = db.query(Classroom).order_by(Classroom.id).all()

    # Thu thập toàn bộ danh mục lớp
    classes_set = set(["12A1", "12A2", "12A3", "11B1", "11B2", "10C1"])
    for cr in classrooms_db:
        classes_set.add(cr.id)
    for s in students:
        if s.classroom:
            classes_set.add(s.classroom)
    for t in teachers:
        for c in t.assigned_classes or []:
            if c != "ALL":
                classes_set.add(c)

    teacher_items = [
        TeacherResponseItem(
            id=t.id,
            name=t.name,
            email=t.email,
            role=t.role,
            assigned_classes=t.assigned_classes or [],
            created_at=t.created_at
        )
        for t in teachers
    ]

    student_items = [
        StudentAlertItem(
            student_id=s.id,
            student_name=s.name,
            grade=s.grade,
            classroom=s.classroom or "12A1",
            target_subject=s.target_subject,
            target_subjects=s.target_subjects or [s.target_subject],
            emotion_scale=s.emotion_scale or 4,
            current_state=FlowerState.TICH_CUC,
            consecutive_days=s.flower_status.consecutive_days if s.flower_status else 1,
            days_since_last_checkin=0,
            last_mood=None,
            alert_reason="Đã phân lớp",
            severity="low",
            needs_attention=False,
            username=s.user.email if s.user else f"hs_{s.id}",
            initial_password=s.initial_password or "123456"
        )
        for s in students
    ]
    return AdminOverviewStats(
        total_teachers=len(teachers),
        total_students=len(students),
        total_classes=len(classes_set),
        classes_list=sorted(list(classes_set)),
        classrooms_details=[ClassroomItem.model_validate(c) for c in classrooms_db],
        teachers=teacher_items,
        students=student_items
    )
@router.post("/admin/teachers", response_model=TeacherResponseItem, status_code=status.HTTP_201_CREATED)
def create_teacher_account(
    data: TeacherCreateRequest,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin tạo mới tài khoản Giáo viên và phân công lớp ngay từ đầu."""
    existing = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tài khoản hoặc email giáo viên này đã tồn tại")

    new_teacher = User(
        id=f"usr_tch_{uuid.uuid4().hex[:8]}",
        email=data.email.strip().lower(),
        name=data.name.strip(),
        password_hash=hash_password(data.password),
        role=UserRole.TEACHER,
        assigned_classes=data.assigned_classes or ["12A1"]
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)

    return TeacherResponseItem(
        id=new_teacher.id,
        name=new_teacher.name,
        email=new_teacher.email,
        role=new_teacher.role,
        assigned_classes=new_teacher.assigned_classes or [],
        created_at=new_teacher.created_at
    )

@router.patch("/admin/teachers/{teacher_id}", response_model=TeacherResponseItem)
def update_teacher_assignment(
    teacher_id: str,
    data: TeacherUpdateRequest,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin cập nhật thông tin hoặc phân bổ lại danh sách lớp cho Giáo viên."""
    teacher = db.query(User).filter(User.id == teacher_id, User.role == UserRole.TEACHER).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Không tìm thấy giáo viên")

    if data.name is not None and data.name.strip():
        teacher.name = data.name.strip()
    if data.email is not None and data.email.strip():
        new_email = data.email.strip().lower()
        existing = db.query(User).filter(User.email == new_email, User.id != teacher_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email này đã được sử dụng bởi người dùng khác")
        teacher.email = new_email
    if data.assigned_classes is not None:
        teacher.assigned_classes = data.assigned_classes
    if data.assigned_subject is not None and data.assigned_subject.strip():
        teacher.assigned_subject = data.assigned_subject.strip()
    if data.password is not None and data.password.strip():
        teacher.password_hash = hash_password(data.password.strip())

    db.commit()
    db.refresh(teacher)

    return TeacherResponseItem(
        id=teacher.id,
        name=teacher.name,
        email=teacher.email,
        role=teacher.role,
        assigned_classes=teacher.assigned_classes or [],
        assigned_subject=teacher.assigned_subject or "Toán học",
        created_at=teacher.created_at
    )

@router.delete("/admin/teachers/{teacher_id}")
def delete_teacher_account(
    teacher_id: str,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin xóa tài khoản Giáo viên."""
    teacher = db.query(User).filter(User.id == teacher_id, User.role == UserRole.TEACHER).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Không tìm thấy giáo viên")

    db.delete(teacher)
    db.commit()
    return {"success": True, "message": f"Đã xóa tài khoản giáo viên {teacher.name}"}

@router.post("/admin/students", status_code=status.HTTP_201_CREATED)
def admin_create_student(
    data: AdminStudentCreateRequest,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin trực tiếp thêm mới học sinh và phân bổ lớp."""
    user_id = None
    if data.email:
        existing = db.query(User).filter(User.email == data.email.strip().lower()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email học sinh này đã tồn tại")
        user = User(
            id=f"usr_hs_{uuid.uuid4().hex[:8]}",
            email=data.email.strip().lower(),
            name=data.name.strip(),
            password_hash=hash_password(data.password or "123456"),
            role=UserRole.STUDENT
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id

    student_id = f"hs_{uuid.uuid4().hex[:8]}"
    student = Student(
        id=student_id,
        user_id=user_id,
        name=data.name.strip(),
        grade=data.grade,
        classroom=data.classroom.strip().upper(),
        target_subject=data.target_subject,
        target_subjects=data.target_subjects or [data.target_subject],
        weakness=data.weakness,
        long_term_goal=data.long_term_goal,
        timeframe=data.timeframe,
        emotion_scale=4,
        initial_password=data.password or "123456"
    )
    db.add(student)
    
    # Tạo trạng thái hoa mặc định
    flower = FlowerStatus(
        student_id=student.id,
        current_state=FlowerState.TICH_CUC,
        consecutive_days=1,
        water_drops=3,
        last_checkin_date=date.today(),
        story_message="Cây hoa hướng dương của bạn đã được Admin gieo mầm trong lớp học!"
    )
    db.add(flower)
    db.commit()

    return {"success": True, "student_id": student.id, "classroom": student.classroom, "name": student.name}

@router.patch("/admin/students/{student_id}/classroom")
def admin_assign_student_classroom(
    student_id: str,
    data: StudentAssignClassRequest,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin phân lại lớp học cho một học sinh."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    student.classroom = data.classroom.strip().upper()
    db.commit()
    db.refresh(student)

    return {"success": True, "student_id": student.id, "new_classroom": student.classroom}

@router.patch("/admin/students/{student_id}")
def admin_update_student_profile(
    student_id: str,
    data: StudentUpdateRequest,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin cập nhật toàn bộ thông tin của học sinh (họ tên, lớp, khối, môn học, cảm xúc...)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    if data.name is not None and data.name.strip():
        student.name = data.name.strip()
        if student.user:
            student.user.name = data.name.strip()

    # Cập nhật hoặc cấp mới tài khoản User cho học sinh
    if data.email is not None and data.email.strip():
        new_email = data.email.strip().lower()
        if student.user:
            existing = db.query(User).filter(User.email == new_email, User.id != student.user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email này đã được sử dụng")
            student.user.email = new_email
        else:
            existing = db.query(User).filter(User.email == new_email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email này đã được sử dụng")
            pwd = data.password.strip() if (data.password and data.password.strip()) else (student.initial_password or "123456")
            new_user = User(
                id=f"usr_hs_{uuid.uuid4().hex[:8]}",
                email=new_email,
                name=student.name,
                password_hash=hash_password(pwd),
                role=UserRole.STUDENT
            )
            db.add(new_user)
            db.flush()
            student.user_id = new_user.id

    if data.password is not None and data.password.strip():
        pwd = data.password.strip()
        student.initial_password = pwd
        if student.user:
            student.user.password_hash = hash_password(pwd)
        else:
            # Tạo user tự động với email mặc định nếu học sinh chưa có tài khoản
            default_email = f"hs_{student.id}@sunflower.edu.vn"
            existing = db.query(User).filter(User.email == default_email).first()
            if not existing:
                new_user = User(
                    id=f"usr_hs_{uuid.uuid4().hex[:8]}",
                    email=default_email,
                    name=student.name,
                    password_hash=hash_password(pwd),
                    role=UserRole.STUDENT
                )
                db.add(new_user)
                db.flush()
                student.user_id = new_user.id
            else:
                existing.password_hash = hash_password(pwd)

    if data.grade is not None and data.grade.strip():
        student.grade = data.grade.strip()
    if data.classroom is not None and data.classroom.strip():
        student.classroom = data.classroom.strip().upper()
    if data.target_subject is not None and data.target_subject.strip():
        student.target_subject = data.target_subject.strip()
    if data.target_subjects is not None:
        student.target_subjects = data.target_subjects
    if data.weakness is not None:
        student.weakness = data.weakness
    if data.long_term_goal is not None:
        student.long_term_goal = data.long_term_goal
    if data.timeframe is not None:
        student.timeframe = data.timeframe
    if data.emotion_scale is not None:
        student.emotion_scale = data.emotion_scale
    if data.learning_style is not None:
        student.learning_style = data.learning_style
    db.commit()
    db.refresh(student)

    return {
        "success": True,
        "student_id": student.id,
        "name": student.name,
        "grade": student.grade,
        "classroom": student.classroom,
        "target_subject": student.target_subject,
        "target_subjects": student.target_subjects or [student.target_subject],
        "emotion_scale": student.emotion_scale
    }

@router.delete("/admin/students/{student_id}")
def admin_delete_student(
    student_id: str,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin xóa học sinh khỏi hệ thống."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    # Xóa cả user liên kết nếu có
    if student.user_id:
        u = db.query(User).filter(User.id == student.user_id).first()
        if u:
            db.delete(u)

    db.delete(student)
    db.commit()
    return {"success": True, "message": f"Đã xóa học sinh {student.name}"}
@router.post("/admin/classrooms", response_model=ClassroomItem, status_code=status.HTTP_201_CREATED)
def admin_create_classroom(
    data: ClassroomCreateRequest,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin thêm lớp học mới vào hệ thống."""
    clean_id = data.id.strip().upper()
    existing = db.query(Classroom).filter(Classroom.id == clean_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Lớp học {clean_id} đã tồn tại trong hệ thống")

    new_cr = Classroom(
        id=clean_id,
        name=data.name.strip() if data.name else f"Lớp {clean_id}",
        grade=data.grade or "12",
        description=data.description or f"Khối {data.grade or '12'}"
    )
    db.add(new_cr)
    db.commit()
    db.refresh(new_cr)
    return new_cr

@router.delete("/admin/classrooms/{classroom_id}")
def admin_delete_classroom(
    classroom_id: str,
    admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    """Admin xóa một lớp học (nếu không còn học sinh)."""
    clean_id = classroom_id.strip().upper()
    count_students = db.query(Student).filter(Student.classroom == clean_id).count()
    if count_students > 0:
        raise HTTPException(status_code=400, detail=f"Không thể xóa lớp {clean_id} vì vẫn còn {count_students} học sinh đang học tại lớp này")

    cr = db.query(Classroom).filter(Classroom.id == clean_id).first()
    if cr:
        db.delete(cr)
        db.commit()

    return {"success": True, "message": f"Đã xóa lớp {clean_id}"}
