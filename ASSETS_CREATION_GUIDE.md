# HƯỚNG DẪN TẠO TÀI NGUYÊN ĐỒ HỌA, HOẠT ẢNH & ÂM THANH
## DỰ ÁN: KHU VƯỜN CẢM XÚC ĐA DẠNG HOA & TƯƠNG TÁC ĐỘNG

Tài liệu này đặc tả toàn bộ hệ thống tài nguyên (Assets) cần tạo bao gồm:
1. **Các loài hoa biểu tượng cảm xúc** (Hoa Hướng Dương, Hoa Sen, Hoa Bồ Công Anh, Hoa Oải Hương, Xương Rồng Nở Hoa, Hoa Cẩm Tú Cầu).
2. **Các giai đoạn sinh trưởng & trạng thái cảm xúc** (Mầm non, Tích cực, Chăm học/Nở rộ, Mệt mỏi/Thiếu nước, Tái sinh).
3. **Hiệu ứng động (Animation / Lottie / Video Loops)**.
4. **Vật phẩm & Phụ kiện khu vườn** (Bình tưới, Giọt nước sương mai, Khiên bảo vệ chuỗi, Viên nang thời gian, Đom đóm đêm).
5. **Âm thanh & Nhạc nền (SFX & Ambient BGM)**.

---

## I. QUY CHUẨN KỸ THUẬT & ĐỊNH DẠNG FILE

| Loại tài nguyên | Định dạng ưu tiên | Độ phân giải / Thời lượng | Nền (Background) | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Ảnh tĩnh / Sticker** | `.webp` hoặc `.png` | 1024x1024 px hoặc 512x512 px | Trong suốt (Transparent) | Tách nền sạch sẽ, không viền đen |
| **Ảnh động / Motion** | `.gif` hoặc `.webm` (alpha) hoặc Lottie `.json` | 512x512 px (tối đa 2-4 giây loop) | Trong suốt (Transparent) | Vòng lặp mượt mà (Seamless loop) |
| **Video bối cảnh** | `.mp4` (H.264) | 1920x1080 px (15 - 30 giây loop) | Full HD | Màu sắc dịu nhẹ, phong cách Studio Ghibli |
| **Âm thanh hiệu ứng (SFX)** | `.mp3` hoặc `.wav` | 1 - 3 giây | - | Âm thanh trong trẻo, không chói tai |
| **Nhạc nền (BGM)** | `.mp3` (128 - 192 kbps) | 1 - 3 phút (Seamless Loop) | - | Thư giãn, lofi nhẹ nhàng, 60-70 BPM |

---

## II. DANH SÁCH 6 LOÀI HOA & KEY PROMPT TẠO HÌNH (IMAGE & MOTION)

> **Phong cách nghệ thuật khuyến nghị (Art Style Consistency):**
> *3D Cute Stylized Claymation / Pixar-Ghibli hybrid, soft pastel aesthetic, cozy warm ambient lighting, emotional, clean transparent background.*

---

### 1. 🌻 Hoa Hướng Dương (Sunflower) — Biểu tượng: *Năng Lượng & Hy Vọng*
- **Ý nghĩa:** Tiếp thêm năng lượng, phù hợp cho học sinh hướng ngoại, cần động lực vượt khó.

#### Các trạng thái cần tạo:
1. **Trạng thái 1: Hạt mầm đang nhú (Sprout)**
   - *Key Prompt (Midjourney / DALL-E 3 / Stable Diffusion):*
     ```text
     A cute tiny sunflower sprout popping out of rich soft soil in a miniature ceramic pastel pot, two vibrant green tiny leaves reaching up, soft morning sunlight, Pixar 3D stylized, cute kawaii face emotion, warm lighting, transparent background, isolated, 8k resolution, octane render --no background
     ```
   - *Motion Prompt (Runway Gen-2 / Pika / Kling AI):*
     ```text
     A small cute green sprout gently stretching and swaying in a soft breeze, tiny dewdrop glistening on the leaf, seamless loop, 3D animated style, smooth gentle motion.
     ```

2. **Trạng thái 2: Nở hoa khỏe mạnh / Tích cực (Healthy Bloom)**
   - *Key Prompt:*
     ```text
     A cheerful 3D stylized sunflower in full bloom, warm bright golden yellow petals, cozy friendly smiling face in the flower center, planted in a minimalist terracotta pot, glowing with subtle warmth, Studio Ghibli warmth meets Pixar charm, soft shadows, transparent background, isolated --no background
     ```
   - *Motion Prompt:*
     ```text
     Cute sunflower gently nodding its head, smiling warmly, breathing slowly, petals fluttering softly in a warm summer wind, seamless loop, cute cozy aesthetic.
     ```

3. **Trạng thái 3: Nở rộ tỏa hào quang / Chăm học (Legendary Radiant Bloom - Streak >= 7 ngày)**
   - *Key Prompt:*
     ```text
     A magnificent radiant sunflower blooming with sparkling golden aura, floating shimmering light particles, glowing warm golden energy halo around petals, crowned with tiny delicate flower crown, premium 3D isometric render, magical enchanting atmosphere, transparent background --no background
     ```
   - *Motion Prompt:*
     ```text
     Magical glowing sunflower pulsing with soft golden light waves, floating sparkling particles rising around it, cheerful energetic gentle sway, sparkling fantasy loop.
     ```

4. **Trạng thái 4: Mệt mỏi / Cần tưới nước (Tired / Wilting)**
   - *Key Prompt:*
     ```text
     A slightly tired cute sunflower bending softly to the side, slightly drooping pastel yellow petals, sleepy sad cute expressive eyes, soft cozy muted colors, asking for care gently without being depressing, 3D stylized claymation, transparent background --no background
     ```
   - *Motion Prompt:*
     ```text
     Drooping sleepy sunflower nodding low, blinking slowly with tired cute eyes, waiting patiently for water droplets, subtle slow breathing loop.
     ```

---

### 2. 🪷 Hoa Sen (Lotus) — Biểu tượng: *Bình Tâm & Tĩnh Lặng*
- **Ý nghĩa:** Giúp học sinh giảm lo âu, xoa dịu áp lực thi cử và áp lực đồng trang lứa.

#### Các trạng thái cần tạo:
1. **Trạng thái 1: Búp sen thanh tịnh (Lotus Bud in Water Bowl)**
   - *Key Prompt:*
     ```text
     A pristine delicate pink lotus bud resting peacefully in a miniature zen ceramic water bowl, tiny glossy green lily pad underneath, tiny water droplets on pink petals, serene calm ambiance, 3D stylized Ghibli aesthetic, transparent background, high detail --no background
     ```
2. **Trạng thái 2: Hoa sen nở rộ tỏa hương (Serene Blooming Lotus)**
   - *Key Prompt:*
     ```text
     A stunning serene pink and white lotus flower fully opened, floating on clear calm water inside a pastel glazed bowl, soft teal and rose tones, gentle soft ambient glow, tranquil meditation vibe, cute 3D stylized render, transparent background --no background
     ```
   - *Motion Prompt:*
     ```text
     Lotus petals gently rippling over peaceful calm water with tiny floating light orbs, soft slow breathing rhythm, ultra calming loop.
     ```
3. **Trạng thái 3: Hào quang thiền định (Zen Golden Lotus)**
   - *Key Prompt:*
     ```text
     A glowing sacred lotus with translucent crystal-like pink-gold petals, soft water ripples reflecting subtle light, surrounded by peaceful floating mist particles, 3D stylized game asset, transparent background --no background
     ```

---

### 3. 🌾 Hoa Bồ Công Anh (Dandelion) — Biểu tượng: *Tự Do & Buông Bỏ Lo Âu*
- **Ý nghĩa:** Giúp xả stress, thổi bay những cảm xúc tiêu cực sau các bài kiểm tra căng thẳng.

#### Các trạng thái cần tạo:
1. **Trạng thái 1: Cầu bồ công anh tròn xoe (Fluffy Dandelion Puff)**
   - *Key Prompt:*
     ```text
     A cute fluffy white dandelion seed head, perfectly round and soft cotton-like texture, standing in a pastel mint clay pot, whimsical dreamlike lighting, hyper-detailed soft fur fluff, 3D stylized art, transparent background --no background
     ```
2. **Trạng thái 2: Các cánh bay theo gió (Wind Wishes)**
   - *Key Prompt:*
     ```text
     A cute white dandelion with several glowing soft seeds floating away gracefully into the air, magical sparkling trail, uplifting inspiring atmosphere, 3D Pixar style, transparent background --no background
     ```
   - *Motion Prompt:*
     ```text
     Soft fluffy dandelion seeds detaching gently and dancing upwards into the air with glittering sparks, seamless looping motion, soothing dreamlike breeze.
     ```

---

### 4. 🪻 Hoa Oải Hương (Lavender) — Biểu tượng: *Thư Giãn & Giấc Ngủ Ngon*
- **Ý nghĩa:** Chống mất ngủ, đồng hành trong buổi tối trước khi đi ngủ sau 5 phút làm nhiệm vụ vi mô.

#### Các trạng thái cần tạo:
1. **Trạng thái: Bụi Lavender tím dịu dàng trong chậu gốm**
   - *Key Prompt:*
     ```text
     A cozy cute bouquet of purple lavender stems in a rustic pastel white ceramic mug, pastel violet and soft purple hues, tiny soothing aroma sparkles floating around, cozy bedtime aesthetic, 3D cute stylized, transparent background --no background
     ```
   - *Motion Prompt:*
     ```text
     Lavender stalks swaying softly back and forth like a gentle lullaby, subtle purple mist and sleepy star sparkles floating up, relaxing slow motion loop.
     ```

---

### 5. 🌵 Xương Rồng Nở Hoa (Flowering Cactus) — Biểu tượng: *Kiên Trì & Vững Vàng*
- **Ý nghĩa:** Biểu tượng của sự bền bỉ, gai góc bên ngoài nhưng nở hoa rực rỡ bên trong.

#### Các trạng thái cần tạo:
1. **Trạng thái: Cây xương rồng tròn xoe nở bông hoa nhỏ đỏ rực trên đỉnh**
   - *Key Prompt:*
     ```text
     An adorable round chubby green cactus in a tiny terracotta pot with a bright pink-red flower blossoming proudly on top, soft friendly rounded thorns (not sharp), tiny smile, warm sun rays, 3D cute kawaii claymation, transparent background --no background
     ```
   - *Motion Prompt:*
     ```text
     Chubby cute cactus doing a happy little wobble wiggle, its little pink flower bobbing playfully, joyful proud vibe, seamless cute loop.
     ```

---

### 6. 🌸 Hoa Cẩm Tú Cầu (Hydrangea) — Biểu tượng: *Biết Ơn & Kết Nối*
- **Ý nghĩa:** Bông hoa đổi màu theo cảm xúc (Xanh lam khi buồn -> Hồng phấn khi vui -> Tím nhạt khi bình yên).

#### Các trạng thái cần tạo:
1. **Trạng thái: Chùm hoa cẩm tú cầu chuyển màu gradient**
   - *Key Prompt:*
     ```text
     A lush spherical cluster of cute pastel hydrangea petals with smooth gradient shifting from soft sky blue to sweet pastel pink, morning dew droplets on petals, warm cozy lighting, 3D stylized render, transparent background --no background
     ```

---

## III. VẬT PHẨM & HIỆU ỨNG TƯƠNG TÁC (INTERACTIVE PROPS & FX)

| Tên vật thể | Mô tả mục đích | Key Prompt tạo ảnh / Asset |
| :--- | :--- | :--- |
| **Bình tưới nước ma thuật (Magic Watering Can)** | Dùng khi học sinh ấn nút "Tưới Nước Chăm Sóc" | `A cute pastel yellow and mint watering can tilted, pouring glowing crystal clear water droplets, sparkling magic splash, 3D stylized toy aesthetic, transparent background --no background` |
| **Giọt sương pha lê (Crystal Dew Drop)** | Đơn vị tích lũy điểm giọt nước check-in | `A glowing glossy water droplet with a tiny golden sunflower reflection inside, sparkling iridescent highlights, 3D icon game asset, transparent background --no background` |
| **Khiên Băng Đóng Băng Chuỗi (Streak Freeze Shield)** | Vật phẩm bảo lưu chuỗi khi học sinh bận đột xuất | `A magical translucent ice crystal shield with a warm glowing golden flower frozen safely inside, glistening frost runes, 3D stylized rpg game icon, transparent background --no background` |
| **Viên Nang Thời Gian (Time Capsule Chest)** | Hòm thư gửi gắm ước mơ mở sau 21 - 30 ngày | `A whimsical vintage wooden and brass mini treasure chest with a glowing sunflower lock, floating tiny starry envelopes, 3D cozy adventure style, transparent background --no background` |
| **Hào quang & Đom đóm (Ambient Fireflies)** | Hiệu ứng lơ lửng ban đêm trong khu vườn | `A cluster of soft glowing golden and mint fireflies and fairy dust sparkles floating in air, particle effect, transparent background --no background` |

---

## IV. BỐI CẢNH NỀN KHU VƯỜN (GARDEN BACKGROUND ENVIRONMENTS)

Cần 2 ảnh nền không gian để học sinh có thể đổi theme giao diện:

### 1. Khu Vườn Ban Ngày (Daytime Sunny Balcony)
- *Key Prompt:*
  ```text
  Wide view cozy sunlit greenhouse balcony filled with lush green houseplants, wooden shelf, warm sunlight streaming through glass window, view of soft blue sky with fluffy white clouds, Studio Ghibli anime background art style, warm cozy serene aesthetic, wide angle 16:9, high resolution, no characters
  ```

### 2. Khu Vườn Ban Đêm Thư Giãn (Nighttime Cozy Starlight Conservatory)
- *Key Prompt:*
  ```text
  A peaceful quiet nighttime balcony garden illuminated by gentle string fairy lights and a crescent moon in a starry indigo sky, soft glowing lanterns, cozy study desk in background, serene calming midnight vibe, lofi anime aesthetic, 16:9 wallpaper, high resolution, no characters
  ```

---

## V. DANH MỤC ÂM THANH & HIỆU ỨNG NHẠC (SFX & BGM SPECIFICATIONS)

> **Gợi ý công cụ AI tạo âm thanh & nhạc:**
> - Nhạc nền (BGM): **Suno AI** (`https://suno.com`) hoặc **Udio** (`https://udio.com`).
> - Hiệu ứng âm thanh (SFX): **ElevenLabs Sound Effects** hoặc **MyEdit / Freesound**.

### 1. Hiệu ứng âm thanh tương tác (SFX - Sound Effects):
1. **`water_pour.mp3` (Tưới nước):**
   - *Mô tả:* Tiếng nước rót róc rách nhẹ nhàng êm tai kèm tiếng chuông gió phong linh tinh tang (1.5s).
   - *Prompt tạo (ElevenLabs):* `Gentle water pouring droplets splashing softly into soil with subtle sweet wind chime ring, calming clean audio`.
2. **`checkin_success.mp3` (Hoàn thành check-in):**
   - *Mô tả:* Tiếng harp (đàn hạc) hoặc đàn celesta gảy nốt thăng hoa ngọt ngào, cảm giác hoàn thành nhẹ nhõm (1.5s).
   - *Prompt tạo:* `A sweet uplifting magical acoustic harp arpeggio, feeling of accomplishment and gentle warmth`.
3. **`level_up_radiant.mp3` (Nở hoa chăm học / Kỷ lục chuỗi):**
   - *Mô tả:* Tiếng chuông ngân vang kỳ diệu lấp lánh (2s).
   - *Prompt tạo:* `Magical fairy dust shimmer chime, golden sparkle sparkle sound, cheerful game achievement sound`.
4. **`capsule_seal.mp3` (Khóa viên nang thời gian):**
   - *Mô tả:* Tiếng khóa lách cách cổ điển ấm áp kèm tiếng sáp niêm phong thư (2s).
   - *Prompt tạo:* `Soft wooden chest lid closing with a satisfying gentle click and warm acoustic resonance`.

### 2. Nhạc nền thư giãn (Ambient Lo-fi BGM):
1. **Bài 1: "Sunflower Morning" (Học tập & Tươi vui ban ngày)**
   - *Thời lượng:* 2:00 (Loop)
   - *Thể loại:* Acoustic Guitar, Kalimba, Soft Piano, Bird chirping, Lo-fi beats nhẹ.
   - *Prompt cho Suno / Udio:*
     ```text
     [Style]: Instrumental, cozy lo-fi hip hop, warm acoustic nylon guitar melody, gentle kalimba chimes, soft morning birds singing in background, relaxing coffee shop vibe, bpm 68, warm bass, peaceful studying atmosphere, no vocals
     ```
2. **Bài 2: "Zen Garden Night" (Thư giãn xoa dịu áp lực & Ngủ ngon ban đêm)**
   - *Thời lượng:* 2:30 (Loop)
   - *Thể loại:* Neo-classical Ambient, Soft Cello, Ambient Rain, Piano Solo.
   - *Prompt cho Suno / Udio:*
     ```text
     [Style]: Ambient peaceful piano solo, emotional warm cello harmony, subtle distant night rain on window, deeply calming meditation music, healing mental health, slow tempo, bpm 55, zero drum, nocturnal dream, no vocals
     ```

---

## VI. CÁCH ĐẶT TÊN FILE KHI BẠN XUẤT ASSETS CHO LẬP TRÌNH VIÊN

Sau khi bạn tạo xong các file ảnh và âm thanh từ AI, hãy lưu vào thư mục `frontend/public/assets/` theo quy ước chuẩn sau:

```text
frontend/public/assets/
├── flowers/
│   ├── sunflower_sprout.webp          # Mầm hoa hướng dương
│   ├── sunflower_bloom.webp           # Hoa hướng dương tích cực
│   ├── sunflower_radiant.webp         # Hoa hướng dương chăm học (hào quang)
│   ├── sunflower_wilting.webp         # Hoa hướng dương thiếu nước
│   ├── lotus_bloom.webp               # Hoa sen tĩnh lặng
│   ├── lotus_radiant.webp             # Hoa sen hào quang thiền
│   ├── dandelion_puff.webp            # Hoa bồ công anh
│   ├── dandelion_float.gif (hoặc webm)# Bồ công anh bay
│   ├── lavender_cozy.webp             # Hoa oải hương
│   ├── cactus_bloom.webp              # Xương rồng nở hoa
│   └── hydrangea_pastel.webp          # Cẩm tú cầu
├── props/
│   ├── watering_can.webp              # Bình tưới nước
│   ├── dew_drop.webp                  # Giọt nước sương
│   ├── freeze_shield.webp             # Khiên đóng băng chuỗi
│   └── time_capsule_chest.webp        # Hòm thư viên nang
├── backgrounds/
│   ├── garden_day.webp                # Khu vườn ban ngày
│   └── garden_night.webp              # Khu vườn ban đêm
└── audio/
    ├── water_pour.mp3                 # Âm thanh tưới nước
    ├── checkin_success.mp3            # Âm thanh hoàn thành nhiệm vụ
    ├── level_up.mp3                   # Âm thanh nở hoa / lên cấp
    ├── bgm_morning.mp3                # Nhạc nền ban ngày
    └── bgm_night.mp3                  # Nhạc nền ban đêm
```

---

*Tài liệu này đã được thiết kế sẵn sàng để bạn copy từng đoạn Prompt thả trực tiếp vào Midjourney, DALL-E, Leonardo AI, Runway Gen-2, Pika, Suno hoặc ElevenLabs!*
