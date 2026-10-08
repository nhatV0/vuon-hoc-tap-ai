# HƯỚNG DẪN TẠO TÀI NGUYÊN ĐỒ HỌA & HOẠT ẢNH: HỆ THỐNG TRỒNG HOA & HÀO QUANG CẢM XÚC
## DỰ ÁN: TRỢ LÝ HOA HƯỚNG DƯƠNG & KHU VƯỜN HỌC ĐƯỜNG CÁ NHÂN HÓA

Tài liệu này là cẩm nang đặc tả toàn diện phục vụ việc tạo hình ảnh (Image) và hoạt ảnh chuyển động lặp (Motion Loop) bằng các công cụ AI (Google Imagen 3, Midjourney v6, DALL-E 3, Runway Gen-2, Pika, Kling AI, Luma Dream Machine).

---

## I. NGUYÊN TẮC CỐT LÕI & CÔNG THỨC KHÓA PHONG CÁCH (STYLE CONSISTENCY)

Để đảm bảo hàng chục hình ảnh và hoạt ảnh khi hiển thị trong ứng dụng trông như được thiết kế bởi **cùng một họa sĩ 3D trong cùng một tựa game**, mọi prompt bắt buộc phải tuân thủ công thức mỏ neo (Master Anchor Formula):

### 1. Công thức khóa thuộc tính (Visual Anchors):
- **Phong cách thị giác (Art Style):** `Tactile 3D cute claymation style, soft velvety matte finish, Pixar-Ghibli hybrid aesthetics`.
- **Góc máy (Camera Angle):** `Front eye-level perspective with slight 15-degree tilt, centered in frame, 1:1 square ratio`.
- **Ánh sáng (Lighting):** `Soft warm studio key lighting, subtle contact shadow under the pot`.
- **Chậu cây cố định (Potted Plant):** `Minimalist cute rounded pastel ceramic pot centered in frame` *(Riêng Hoa Sen dùng `shallow minimalist pastel zen water bowl`)*.
- **Phông nền (Background):** `Isolated on solid clean warm-white studio background (#FAFAFA), zero clutter, easy background cutout --no background`.
- **Chuyển động (Motion Rule):** `Seamless continuous loop, gentle organic breathing pulse, soothing 60fps physics`.

---

## II. 6 LOÀI HOA HỌC SINH TỰ DO LỰA CHỌN KHI BẮT ĐẦU

| Biểu tượng | Loài Hoa | Ý Nghĩa Tâm Lý Sư Phạm | Màu Sắc & Nét Đặc Trưng Cố Định | Chậu Mặc Định |
| :---: | :--- | :--- | :--- | :--- |
| 🌻 | **Hoa Hướng Dương** | Năng lượng tích cực, ý chí kiên định, tinh thần vượt khó | Cánh vàng hổ phách (`#FACC15`), nhụy nâu ấm (`#5C3A21`), nụ cười ấm áp | Chậu gốm cam pastel |
| 🪷 | **Hoa Sen** | Bình tâm, xoa dịu áp lực thi cử và lo âu đồng trang lứa | Cánh chuyển sắc hồng phấn sang trắng tuyết (`#F472B6`), lá ngọc bích | Bát nước gốm ngọc bích |
| 🌾 | **Hoa Bồ Công Anh** | Tự do, buông bỏ muộn phiền, ước mơ bay xa theo gió | Cầu bông trắng xốp như kẹo bông (`#FFFFFF`), các hạt bay nhẹ nhàng | Chậu gốm xanh bạc hà (mint) |
| 🪻 | **Hoa Oải Hương** | Thư giãn, giấc ngủ ngon sau 5 phút nhiệm vụ vi mô buổi tối | Chùm hoa tím violet dịu dàng (`#A855F7`), bụi sao thơm tím bay quanh | Chậu sứ trắng kem vintage |
| 🌸 | **Hoa Anh Đào** | Hy vọng tương lai, vẻ đẹp thanh xuân, khởi đầu mới | Dáng bonsai mini thanh thoát, cánh hoa hồng đào phớt nhẹ (`#FBCFE8`) | Chậu gốm nâu đất nung tròn |
| 🌵 | **Xương Rồng Nở Hoa** | Bền bỉ, kiên trì, gai góc bên ngoài nhưng rực rỡ bên trong | Thân mập tròn xanh ngọc (`#34D399`), gai mềm không nhọn, hoa đỏ ruby nở trên đỉnh | Chậu đất nung terracotta tròn |

---

## III. 7 GIAI ĐOẠN SINH TRƯỞNG & CHUYỂN ĐỘNG CỦA CÂY

---

### GIAI ĐOẠN 1: CHỌN HẠT GIỐNG (SEED SELECTION)
> **Mô tả:** Học sinh lựa chọn loại hạt mầm yêu thích từ bộ sưu tập hạt giống trước khi gieo. Hạt mầm lơ lửng, tỏa sáng nhẹ nhàng.

- **Image Prompt (Chung cho các hạt mầm):**
  ```text
  A single cute magical glowing [flower name] seed resting on a tiny minimalist pastel ceramic saucer, delicate organic shell details, soft bioluminescent inner glow, tactile 3D cute claymation style, velvety matte finish, Pixar aesthetic, centered composition, front view, soft warm studio lighting, isolated on solid clean warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt (Tạo chuyển động):**
  ```text
  The magical seed gently hovers 2 inches above the saucer, slowly rotating 360 degrees with a soft rhythmic breathing pulse, releasing subtle glistening fairy dust particles, seamless continuous loop, ultra smooth 60fps.
  ```

---

### GIAI ĐOẠN 2: GIEO VÀO CHẬU (SOWING INTO POT)
> **Mô tả:** Hạt giống được đặt cẩn thận vào giữa lớp đất ẩm tơi xốp, có tia nắng mặt trời ấm áp chiếu rọi vào hạt.

- **Image Prompt:**
  ```text
  A cute minimalist rounded pastel ceramic pot filled with rich dark soft crumbly soil, a single glowing [flower name] seed snugly tucked halfway into the center of the earth, a gentle warm sunbeam shining down directly onto the seed, 3D cute claymation, cozy greenhouse aesthetic, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Warm sunbeams dance and shimmer softly over the tucked seed, dark soil settling gently as sparkling moisture dew sinks into the earth, calming peaceful heartbeat rhythm, seamless loop.
  ```

---

### GIAI ĐOẠN 3: NẢY MẦM (SPROUTING / GERMINATION)
> **Mô tả:** Hạt giống phá vỡ lớp đất, vươn lên 2 lá mầm non xanh nõn nà, trên chóp lá có 1 giọt sương long lanh.

- **Image Prompt:**
  ```text
  An adorable tiny baby [flower name] plant sprout popping up through soft soil inside a cute rounded pastel ceramic pot, two chubby vibrant lime-green cotyledon leaves opening upwards toward light, a sparkling crystal dewdrop on the leaf tip, cute kawaii emotion, 3D stylized Pixar-Ghibli, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  The tiny green sprout pushes upward out of the soil with a joyful gentle stretch, unfolding its two tiny leaves happily and wobbling softly in a warm spring breeze, sparkling dewdrop shivering on the leaf, seamless loop.
  ```

---

### GIAI ĐOẠN 4: CÂY NON (YOUNG SEEDLING / SAPLING)
> **Mô tả:** Cây cao khoảng 1/2 kích thước tối đa, thân mảnh khỏe khoắn, có 4–6 lá non xanh mướt, đung đưa nhịp nhàng như đang khiêu vũ đón nắng.

- **Image Prompt:**
  ```text
  A thriving young [flower name] seedling with a slender healthy green stem and several tender vibrant leaves, growing happily in a cute minimalist pastel ceramic pot, bathed in cheerful morning sunlight, tactile 3D stylized character, soft shadows, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  The young seedling sways rhythmically left and right like a happy dancing child, leaves fluttering gently in warm air, absorbing soft sunshine with a playful bouncy pulse, seamless cute loop.
  ```

---

### GIAI ĐOẠN 5: CÂY HÉO / THIẾU NƯỚC (WILTING / THIRST)
> **Mô tả:** Khi học sinh gián đoạn check-in, cây buồn rủ nhẹ sang một bên, mắt buồn chớp chậm, đất khô nhẹ. Cây giữ nét đáng yêu, khơi gợi lòng trắc ẩn để học sinh quay lại tưới nước, tuyệt đối không ghê rợn hay áp lực.

- **Image Prompt:**
  ```text
  A cute slightly sad wilting [flower name] plant bending softly to the side inside a minimalist pastel ceramic pot, drooping soft pastel leaves, dry pale soil, cute sleepy expressive eyes looking up asking gently for care, cozy melancholic yet warm aesthetic, 3D claymation, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  The drooping cute plant sighs softly, swaying low with slow tired breathing, blinking its big sleepy eyes slowly, waiting patiently for water droplets to revive it, gentle melancholic loop.
  ```

---

### GIAI ĐOẠN 6: CÂY TRƯỞNG THÀNH NỞ HOA (MATURE BLOOM)
> **Mô tả:** Cây đạt trạng thái hoàn thiện tuyệt mỹ, hoa nở rộ kích thước tối đa, cánh hoa bung nở rực rỡ, khuôn mặt vui tươi, tràn đầy nhựa sống.

- **Image Prompt:**
  ```text
  A magnificent fully grown mature [flower name] in glorious full bloom, lush green leaves, perfectly formed vibrant healthy petals, warm joyful facial expression in the center, planted in a decorative minimalist pastel ceramic pot, Studio Ghibli warmth meets 3D Pixar, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  The blooming flower nods gently with a warm loving smile, petals and leaves fluttering softly in a soothing summer wind, breathing with a natural calming organic pulse, seamless continuous loop.
  ```

---

### GIAI ĐOẠN 7: CÂY HÀO QUANG STREAK (RADIANT AURA BLOOM) — 8 CẤP ĐỘ MÀU

Khi học sinh duy trì chuỗi ngày check-in và học tập liên tục (Streak), cây hoa trưởng thành sẽ được bao bọc bởi vòng hào quang phát sáng. Hào quang tăng dần theo 8 cấp độ màu:

---

#### CẤP 1: ⚪ HÀO QUANG TRẮNG / NGỌC TRAI (PURE WHITE / PEARL AURA)
- **Ý nghĩa:** Streak 3–5 ngày: Khởi đầu thanh khiết, tâm trí trong trẻo.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, surrounded by a soft translucent pure white ethereal aura, gentle pearl-like light shimmering around the flower petals, floating tiny white stardust particles, 3D cute stylized, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Soft waves of pure white ethereal light gently pulsate outward from the flower core, white stardust particles floating upwards in slow motion, calming pure meditative loop, 60fps.
  ```

---

#### CẤP 2: 🔵 HÀO QUANG XANH LAM (DEEP BLUE / COBALT AURA)
- **Ý nghĩa:** Streak 7 ngày: Trí tuệ, tĩnh lặng và sự kiên nhẫn bước đầu.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, radiating a serene cobalt blue and deep sapphire energy aura, glowing royal blue translucent rings expanding around the petals, mystical wisdom vibe, 3D claymation, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Glowing deep blue energy rings slowly expand and dissolve around the flower, shimmering sapphire light motes dancing around the swaying petals, seamless rhythmic pulsing loop.
  ```

---

#### CẤP 3: 💧 HÀO QUANG XANH NƯỚC BIỂN (AQUA / CYAN WATER RIPPLE AURA)
- **Ý nghĩa:** Streak 14 ngày: Sự mát lành, cuốn trôi mệt mỏi, dòng chảy cảm xúc thông suốt.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, enveloped in a flowing cyan and aqua water-like aura, liquid light ripples and crystal clear turquoise bubbles floating in zero gravity around the petals, refreshing aesthetic, 3D stylized, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Luminescent aqua water ripples and turquoise bubbles orbit the blooming flower gracefully, soft flowing fluid motion with shimmering liquid light waves, ultra calming loop.
  ```

---

#### CẤP 4: 🟣 HÀO QUANG TÍM HUYỀN BÍ (MYSTIC PURPLE / AMETHYST AURA)
- **Ý nghĩa:** Streak 21 ngày (Mốc vàng 3 tuần hình thành thói quen): Huyền bí, kết nối sâu sắc.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, glowing with a rich amethyst purple aura, floating lavender energy sparks, mystical galaxy star dust swirling gently around the petals, 3D cute Pixar render, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Hypnotic purple nebula spirals and amethyst crystal sparkles swirl smoothly around the flower stem and petals, breathing with a mystical cosmic rhythm, seamless enchanted loop.
  ```

---

#### CẤP 5: 🔴 HÀO QUANG ĐỎ RỰC LỬA (CRIMSON RED / RUBY FLAME AURA)
- **Ý nghĩa:** Streak 30 ngày (1 tháng kiên định): Lòng dũng cảm, đam mê rực cháy, không nản bước.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, enveloped in an intense crimson red and ruby flame aura, warm heroic courage energy field, burning with gentle soft harmless flame ribbons, glowing red fireflies, 3D stylized, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Gentle soft ruby flames and crimson light ribbons dance and flicker warmly around the flower without harming it, pulsing with bold passionate energy, dynamic looping motion.
  ```

---

#### CẤP 6: 🟡 HÀO QUANG VÀNG KIM THÁI DƯƠNG (SOLAR GOLD / AMBER AURA)
- **Ý nghĩa:** Streak 50 ngày: Vinh quang của người kiên trì, rạng rỡ như ánh mặt trời ban trưa.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, surrounded by an intense dazzling solar gold aura, shimmering amber light rays piercing outward, floating golden coins and solar flare particles, triumphant champion vibe, 3D Pixar, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Radiant solar golden light beams rotate slowly behind the flower like a celestial mandala, brilliant golden sparkles cascade down in continuous celebration, energetic glorious loop.
  ```

---

#### CẤP 7: 🌈 HÀO QUANG NGŨ SẮC CẦU VỒNG (PRISMATIC RAINBOW / AURORA AURA)
- **Ý nghĩa:** Streak 100 ngày (Kỷ lục 100 ngày): Đỉnh cao hài hòa, trọn vẹn mọi sắc thái cảm xúc.
- **Image Prompt:**
  ```text
  A mature blooming [flower name] in a pastel ceramic pot, wrapped in a spectacular prismatic rainbow aurora borealis aura, shimmering iridescent color transitions of pink, cyan, yellow, violet, and green flowing seamlessly across the petals, magical fairy tale aesthetic, 3D stylized, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Mesmerizing rainbow aurora waves weave and shift fluidly in a spectrum of vibrant colors around the swaying flower, iridescent prismatic dust glittering in perpetual motion, dreamlike seamless loop.
  ```

---

#### CẤP 8: ✨ HÀO QUANG SÁNG CHÓI CỰC ĐẠI (BLINDING CELESTIAL DIVINE LIGHT AURA)
- **Ý nghĩa:** Streak siêu đỉnh (>150 ngày): Cảnh giới tối thượng, ánh sáng kim cương khai sáng tâm trí.
- **Image Prompt:**
  ```text
  A transcendent celestial blooming [flower name] in a pastel ceramic pot, emanating blinding brilliant holy white-gold starlight, intense glowing lens flares, crowned with an angelic glowing halo, floating crystal geometry shards, ultimate mastery aura, 3D cinematic render, centered, clean solid warm-white background (#FAFAFA) --no background
  ```
- **Motion Prompt:**
  ```text
  Magnificent blinding starlight pulses with divine celestial power, radiant rays of intense brilliant white and diamond light burst outward in a glorious rotating cosmic burst, majestic high-energy seamless loop.
  ```

---

## IV. BẢNG BIỂU MẪU PROMPT RÁP TỰ ĐỘNG CHO 6 LOÀI HOA CỤ THỂ

Khi tạo cho loài hoa nào, bạn chỉ cần thay `[flower name]` bằng tên tiếng Anh tương ứng:

1. **🌻 Hoa Hướng Dương:** `cheerful sunflower with bright golden-yellow petals and friendly smiling brown center`
2. **🪷 Hoa Sen:** `serene pink and white lotus flower resting in a shallow pastel zen water bowl`
3. **🌾 Hoa Bồ Công Anh:** `fluffy white dandelion seed puff with soft cotton parachute fibers`
4. **🪻 Hoa Oải Hương:** `aromatic bouquet of purple lavender stems with sleepy lilac sparkles`
5. **🌸 Hoa Anh Đào:** `graceful miniature cherry blossom bonsai with soft peach-pink petals`
6. **🌵 Xương Rồng Nở Hoa:** `chubby round green cactus with friendly soft bumps and bright ruby-red blossom on top`

---

## V. QUY ƯỚC LƯU FILE CHUẨN ĐỂ TÍCH HỢP VÀO MÃ NGUỒN

Lưu toàn bộ các file ảnh (`.webp` hoặc `.png` tách nền) và ảnh động (`.webm` hoặc `.mp4` lặp mượt) vào thư mục:

```text
frontend/public/assets/flowers/
├── [flower_id]/
│   ├── seed.webp                  # Trạng thái 1: Hạt giống
│   ├── seed_motion.webm           # (Motion)
│   ├── sowing.webp                # Trạng thái 2: Gieo vào chậu
│   ├── sprout.webp                # Trạng thái 3: Nảy mầm
│   ├── sprout_motion.webm         # (Motion)
│   ├── seedling.webp              # Trạng thái 4: Cây non
│   ├── seedling_motion.webm       # (Motion)
│   ├── wilting.webp               # Trạng thái 5: Cây héo
│   ├── wilting_motion.webm        # (Motion)
│   ├── bloom.webp                 # Trạng thái 6: Trưởng thành
│   ├── bloom_motion.webm          # (Motion)
│   ├── aura_lvl1_white.webp       # Hào quang 1: Trắng
│   ├── aura_lvl1_white.webm       # (Motion)
│   ├── aura_lvl2_blue.webp        # Hào quang 2: Xanh lam
│   ├── aura_lvl2_blue.webm        # (Motion)
│   ├── aura_lvl3_aqua.webp        # Hào quang 3: Xanh nước
│   ├── aura_lvl3_aqua.webm        # (Motion)
│   ├── aura_lvl4_purple.webp      # Hào quang 4: Tím
│   ├── aura_lvl4_purple.webm      # (Motion)
│   ├── aura_lvl5_red.webp         # Hào quang 5: Đỏ
│   ├── aura_lvl5_red.webm         # (Motion)
│   ├── aura_lvl6_gold.webp        # Hào quang 6: Vàng
│   ├── aura_lvl6_gold.webm        # (Motion)
│   ├── aura_lvl7_rainbow.webp     # Hào quang 7: Ngũ sắc
│   ├── aura_lvl7_rainbow.webm     # (Motion)
│   ├── aura_lvl8_divine.webp      # Hào quang 8: Sáng chói
│   └── aura_lvl8_divine.webm      # (Motion)
```

*(Trong đó `flower_id` gồm: `sunflower`, `lotus`, `dandelion`, `lavender`, `cherry_blossom`, `cactus`)*
