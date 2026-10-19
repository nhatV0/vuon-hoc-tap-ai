# GDPT 2018 Design System & Tokens Governance

Tài liệu quản trị phong cách thiết kế, kiến trúc Design Tokens và quy chuẩn UI cho dự án Sunflower Mentor (Vườn Học Tập AI GDPT 2018).

---

## 1. Triết Lý & Nguyên Tắc Thiết Kế (Design Philosophy)

1. **Thẩm mỹ Sư phạm Tự nhiên (Natural Pedagogical Aesthetic)**:
   - Tông màu chủ đạo là mật ong ấm / hổ phách (`amber-500` đến `amber-700`) kết hợp đá tự nhiên (`stone-50` đến `stone-900`) nhằm giảm mỏi mắt cho học sinh khi tự học nhiều giờ.
   - Bán kính góc bo mềm mại (`rounded-2xl` 24px, `rounded-3xl` 32px) tạo cảm giác an tâm, khuyến khích sự tò mò và phản biện.

2. **Quy Tắc Tuyệt Đối Không Dùng Emoji (Zero Emoji Policy - AGENTS.md)**:
   - Nghiêm cấm dùng ký tự emoji Unicode trong markup, nút bấm, tiêu đề hoặc thông báo.
   - Sử dụng 100% Vector SVG Icon thông qua thư viện `lucide-react`.

3. **Cấu Trúc Tệp Dưới 200 Dòng (200-Line Limit - AGENTS.md)**:
   - Mỗi file component UI hay logic phải duy trì dưới 200 dòng.
   - Khi giao diện mở rộng, phân tách thành sub-components hoặc custom hooks chuyên trách.

4. **Tuyệt Đối Không Dùng Parent Relative Imports (`../`)**:
   - Sử dụng bí danh đường dẫn `@/` (e.g. `@/shared/components/ui/button`, `@/shared/design-tokens/tokens`).

---

## 2. Kiến Trúc Design Tokens 3 Lớp

```
[Layer 1: Global Primitives]
    amber, stone, emerald, rose, indigo, spacing, radii, typography
             │
             ▼
[Layer 2: Semantic Aliases]
    canvas (background, surface, border)
    brand (primary, primaryHover, focusRing)
    feedback (exact, partial, misconception, neutral)
    subjects (math, physics, chemistry, biology, literature, english, history, geography)
             │
             ▼
[Layer 3: Component-Specific]
    button, card, modal, chip, formField
```

### 2.1 Bảng Phản Hồi Sư Phạm Socratic (GDPT 2018 Feedback States)

| Trạng thái | Ngữ nghĩa | Màu nền | Màu chữ | Icon Lucide |
| :--- | :--- | :--- | :--- | :--- |
| `exact` | Học sinh lập luận chuẩn xác | `bg-emerald-50` | `text-emerald-800` | `CheckCircle2` |
| `partial` | Đúng một phần, còn bước thiếu | `bg-amber-50` | `text-amber-900` | `AlertCircle` |
| `misconception` | Xuất hiện ngộ nhận hoặc hiểu sai cốt lõi | `bg-rose-50` | `text-rose-900` | `HelpCircle` |
| `neutral` | Câu hỏi gợi mở / dẫn nhập | `bg-stone-100` | `text-stone-800` | `Info` |

### 2.2 Bảng Màu Chuẩn Các Môn Học GDPT 2018

| Môn học | Token Key | Mã Màu Chính | Màu Nền Badge | Lucide Icon Đề Xuất |
| :--- | :--- | :--- | :--- | :--- |
| **Toán học** | `subjects.math` | `#D97706` (`amber-600`) | `#FEF3C7` | `Calculator`, `Sigma` |
| **Vật lí** | `subjects.physics` | `#4F46E5` (`indigo-600`) | `#E0E7FF` | `Atom`, `Zap` |
| **Hóa học** | `subjects.chemistry` | `#7C3AED` (`violet-600`) | `#EDE9FE` | `FlaskConical`, `TestTube` |
| **Sinh học** | `subjects.biology` | `#059669` (`emerald-600`) | `#D1FAE5` | `Dna`, `Sprout` |
| **Ngữ văn** | `subjects.literature` | `#E11D48` (`rose-600`) | `#FFE4E6` | `BookOpen`, `Feather` |
| **Tiếng Anh** | `subjects.english` | `#0284C7` (`sky-600`) | `#E0F2FE` | `Languages`, `Globe` |
| **Lịch sử** | `subjects.history` | `#EA580C` (`orange-600`) | `#FFEDD5` | `Landmark`, `Hourglass` |
| **Địa lí** | `subjects.geography` | `#16A34A` (`green-600`) | `#DCFCE7` | `Compass`, `Map` |

---

## 3. Danh Mục Thành Phần UI (Component Cheatsheet)

### Atoms (`@/shared/components/ui/`)
- `Button`: Hỗ trợ biến thể `default`, `outline`, `ghost`, `secondary`, `destructive`, `accent`. Có sẵn thuộc tính `loading={true}` hiển thị spinner xoay không gây giật layout.
- `Badge`: Biến thể `default`, `secondary`, `destructive`, `outline`, `accent`, `success`, `warning`, `info`.
- `Input` & `Textarea`: Bo viền mềm, viền hổ phách khi focus (`focus-visible:ring-amber-500`), hỗ trợ font size tối ưu trên di động.
- `Progress`: Thanh tiến độ học tập hỗ trợ các biến thể màu `default`, `success`, `warning`, `destructive`.
- `MathText`: Atom hiển thị công thức LaTeX qua KaTeX kèm bộ lọc CJK sạch sẽ.

### Molecules (`@/shared/components/`)
- `DebateVerdictChip`: Huy hiệu kết luận phản biện Socratic (`exact`, `partial`, `misconception`).
- `CountdownPill`: Thẻ đếm ngược số ngày thi tốt nghiệp/kiểm tra học kỳ với trạng thái khẩn cấp (`<= 30 ngày`).
- `TopicTag`: Nhãn chuyên đề môn học hỗ trợ trạng thái lựa chọn (selection state) và số lượng bài tập.
- `FormField`: Vỏ bọc chuẩn hóa cho nhãn input, thông báo lỗi `role="alert"` và gợi ý trường.

---

## 4. Tiêu Chuẩn Khả Năng Truy Cập (Accessibility - WCAG 2.2 AA)
- Mọi văn bản tương tác phải đạt tỷ lệ tương phản tối thiểu **4.5:1** so với nền.
- Mọi nút bấm, tab và trường nhập dữ liệu phải hiển thị rõ nét viền focus khi điều hướng bằng phím Tab (`focus-visible:ring-2 focus-visible:ring-ring`).
- Mọi biểu tượng trạng thái bắt buộc đi kèm nhãn văn bản hoặc `aria-label`/`aria-hidden="true"` rõ ràng.
