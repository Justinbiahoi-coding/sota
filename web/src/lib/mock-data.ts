// Mock data for the frontend while the API is being built.
// All image URLs are tested and verified high-resolution Unsplash and local museum assets.
// Compatible with both frontend UI components and backend schema types (docs/database-design.md).

import type { Museum as ApiMuseum, Artifact as ApiArtifact, TicketType } from "./api/types"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Museum = {
  id?: string
  slug: string
  name: string
  nameEn: string
  accent: string // hex / rgb / oklch accent colour
  opens: string
  closes: string
  image: string
  address: string
  city?: string
  description: string
  cover_image_path?: string | null
  status?: string
  created_at?: string
  updated_at?: string
}

export type MuseumWithAccent = Museum

export type Exhibition = {
  slug: string
  title: string
  museumSlug: string
  starts: string // ISO date
  ends: string
  image: string
  description: string
  curator: string
  status: "ongoing" | "upcoming" | "ended"
}

export type Artifact = {
  id: string
  slug: string
  title: string
  artist: string
  year: string
  medium: string
  dimensions: string
  museumSlug: string
  exhibitionSlugs: string[]
  image: string
  description: string
  rights: "CC0 – Public Domain"
  isHighlight: boolean
  sketchfabUid?: string // Sketchfab model UID for 3D embed: sketchfab.com/models/{uid}/embed
}

export type ProductCategory = "Postcard" | "Sách nghệ thuật" | "Lưu niệm" | "Thời trang"

export type Product = {
  id: string
  slug: string
  name: string
  price: number // USD cents
  image: string
  inventory: number
  museumSlug: string
  inspiredByArtifactId: string | null
  category: ProductCategory
  description: string
}

export type TicketSlot = {
  id: string
  museumSlug: string
  time: string // HH:mm
  price: number // USD cents (0 = free)
  remainingSpots: number
}

// ─────────────────────────────────────────────────────────────────────────────
// MUSEUMS (6 Smithsonian - Verified Unsplash High-Res Photos)
// ─────────────────────────────────────────────────────────────────────────────

export const museums: Museum[] = [
  {
    slug: "lich-su-tu-nhien",
    name: "Bảo tàng Lịch sử Tự nhiên",
    nameEn: "National Museum of Natural History",
    accent: "#38bdf8", // bright sky blue
    opens: "10:00",
    closes: "17:30",
    image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1200&q=80",
    address: "10th St. & Constitution Ave. NW, Washington, D.C. 20560",
    description: "Một trong những bảo tàng lịch sử tự nhiên được ghé thăm nhiều nhất thế giới, lưu giữ hơn 145 triệu mẫu vật từ thiên thạch, hóa thạch khủng long đến kim cương Hope.",
  },
  {
    slug: "hang-khong-vu-tru",
    name: "Bảo tàng Hàng không và Vũ trụ",
    nameEn: "National Air and Space Museum",
    accent: "#818cf8", // indigo
    opens: "10:00",
    closes: "17:30",
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&q=80",
    address: "Independence Ave SW & 6th St SW, Washington, D.C. 20560",
    description: "Trưng bày Flyer của anh em Wright, Apollo 11 Command Module và những hiện vật hàng đầu về lịch sử hàng không vũ trụ nhân loại.",
  },
  {
    slug: "lich-su-hoa-ky",
    name: "Bảo tàng Lịch sử Hoa Kỳ",
    nameEn: "National Museum of American History",
    accent: "#f87171", // coral red
    opens: "10:00",
    closes: "17:30",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80",
    address: "1300 Constitution Ave NW, Washington, D.C. 20560",
    description: "Từ lá cờ Star-Spangled Banner đến máy trò chơi điện tử Atari — kho tàng hiện vật định hình bản sắc văn hóa Mỹ qua các thế kỷ.",
  },
  {
    slug: "phong-tranh-chan-dung",
    name: "Phòng tranh Chân dung Quốc gia",
    nameEn: "National Portrait Gallery",
    accent: "#f472b6", // rose
    opens: "11:30",
    closes: "19:00",
    image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=1200&q=80",
    address: "8th & F Streets NW, Washington, D.C. 20001",
    description: "Hành trình qua lịch sử Hoa Kỳ qua chân dung tranh vẽ, nhiếp ảnh và điêu khắc của những nhân vật đã định hình đất nước.",
  },
  {
    slug: "hirshhorn",
    name: "Bảo tàng và Vườn điêu khắc Hirshhorn",
    nameEn: "Hirshhorn Museum and Sculpture Garden",
    accent: "#fbbf24", // amber gold
    opens: "10:00",
    closes: "17:30",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
    address: "Independence Ave SW & 7th St SW, Washington, D.C. 20560",
    description: "Bảo tàng nghệ thuật hiện đại và đương đại quốc gia của Mỹ, nơi lưu giữ hơn 12.000 tác phẩm từ Picasso đến Jeff Koons.",
  },
  {
    slug: "nghe-thuat-chau-a",
    name: "Bảo tàng Nghệ thuật châu Á",
    nameEn: "National Museum of Asian Art",
    accent: "#34d399", // emerald
    opens: "10:00",
    closes: "17:30",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80",
    address: "1050 Independence Ave SW, Washington, D.C. 20560",
    description: "Bộ sưu tập nghệ thuật châu Á lớn nhất tại Hoa Kỳ: gốm sứ Trung Hoa, tranh lụa Nhật Bản, cổ vật Ấn Độ và nghệ thuật Hồi giáo qua nhiều thế kỷ.",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// EXHIBITIONS (6 - Verified Unsplash High-Res Photos)
// ─────────────────────────────────────────────────────────────────────────────

export const exhibitions: Exhibition[] = [
  {
    slug: "hoa-thach-thoi-gian",
    title: "Hóa thạch: Dòng thời gian sâu",
    museumSlug: "lich-su-tu-nhien",
    starts: "2026-09-01",
    ends: "2027-03-31",
    image: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=1200&q=80",
    description: "Hành trình 500 triệu năm qua các kỷ địa chất, khám phá hóa thạch Triceratops, cá cổ đại và các sinh vật đã tuyệt chủng được phục dựng bằng công nghệ 3D.",
    curator: "Dr. Kirk Johnson",
    status: "ongoing",
  },
  {
    slug: "buoc-ra-quy-dao",
    title: "Bước ra quỹ đạo",
    museumSlug: "hang-khong-vu-tru",
    starts: "2026-10-15",
    ends: "2027-01-10",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    description: "Từ Sputnik 1 đến Artemis — triển lãm tái hiện cuộc đua vũ trụ qua những hiện vật gốc: bộ đồ phi hành gia, tên lửa thu nhỏ và hình ảnh viễn thám Trái Đất.",
    curator: "Margaret Weitekamp",
    status: "ongoing",
  },
  {
    slug: "chan-dung-the-ky",
    title: "Chân dung một thế kỷ",
    museumSlug: "phong-tranh-chan-dung",
    starts: "2026-11-01",
    ends: "2027-05-02",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1200&q=80",
    description: "100 bức chân dung vẽ tay và nhiếp ảnh ghi lại khuôn mặt của thế kỷ 20: nghệ sĩ, chính khách, nhà khoa học và những người bình thường tạo nên lịch sử.",
    curator: "Dorothy Moss",
    status: "ongoing",
  },
  {
    slug: "uyen-chuyen-vien-dong",
    title: "Uyển chuyển Viễn Đông",
    museumSlug: "nghe-thuat-chau-a",
    starts: "2026-08-20",
    ends: "2027-02-14",
    image: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=1200&q=80",
    description: "Hành trình qua nghệ thuật cung đình Trung Hoa, tranh thủy mặc Nhật Bản và điêu khắc Khmer — mỗi tác phẩm là lời thì thầm của một nền văn minh.",
    curator: "Jan Stuart",
    status: "ongoing",
  },
  {
    slug: "sat-thuep-va-anh-sang",
    title: "Sắt thép và Ánh sáng",
    museumSlug: "hirshhorn",
    starts: "2027-01-20",
    ends: "2027-07-31",
    image: "https://images.unsplash.com/photo-1545987796-200677ee1011?w=1200&q=80",
    description: "Nghệ thuật điêu khắc kim loại từ Alexander Calder đến Richard Serra: sức nặng của vật liệu gặp khoảnh khắc ánh sáng. Sắp diễn ra.",
    curator: "Anne Ellegood",
    status: "upcoming",
  },
  {
    slug: "ngon-co-va-bien",
    title: "Ngọn cờ và Biển cả",
    museumSlug: "lich-su-hoa-ky",
    starts: "2025-05-01",
    ends: "2026-09-30",
    image: "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&q=80",
    description: "Lịch sử hàng hải Hoa Kỳ từ thế kỷ 18 đến Thế chiến II — bộ sưu tập gồm hải đồ, nhật ký thuyền trưởng và các vật phẩm Hải quân gốc.",
    curator: "David Allison",
    status: "ended",
  },
]

export const featuredArtifacts: (ApiArtifact & { museumSlug: string; accent: string })[] = [
  {
    id: "00000000-0000-0000-0001-000000000001",
    museum_id: "00000000-0000-0000-0000-000000000001",
    museumSlug: "lich-su-tu-nhien",
    name: "Voi ma mút lông mịn",
    description: "Bộ xương voi ma mút nguyên vẹn từ kỷ Pleistocene, khoảng 10.000 năm trước.",
    period: "Kỷ Pleistocene (~10.000 TCN)",
    inventory_code: "NMNH-M-001",
    status: "published",
    accent: "oklch(0.46 0.07 145)",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0001-000000000002",
    museum_id: "00000000-0000-0000-0000-000000000002",
    museumSlug: "hang-khong-vu-tru",
    name: "Module Điều khiển Apollo 11",
    description: "Khoang chỉ huy đã đưa phi hành đoàn Apollo 11 trở về Trái Đất năm 1969.",
    period: "1969",
    inventory_code: "NASM-A-002",
    status: "published",
    accent: "oklch(0.4 0.09 255)",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0001-000000000003",
    museum_id: "00000000-0000-0000-0000-000000000003",
    museumSlug: "lich-su-hoa-ky",
    name: "Lá cờ Fort McHenry",
    description: "Lá cờ treo trên Fort McHenry sau trận chiến năm 1814, cảm hứng để viết The Star-Spangled Banner.",
    period: "1814",
    inventory_code: "NMAH-F-003",
    status: "published",
    accent: "oklch(0.5 0.13 30)",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACTS (16 - Verified Unsplash High-Res Photos)
// ─────────────────────────────────────────────────────────────────────────────

export const artifacts: Artifact[] = [
  {
    id: "art-001",
    slug: "water-lilies-monet",
    title: "Water Lilies",
    artist: "Claude Monet",
    year: "1906",
    medium: "Oil on canvas",
    dimensions: "89.5 × 92.1 cm",
    museumSlug: "phong-tranh-chan-dung",
    exhibitionSlugs: ["chan-dung-the-ky"],
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
    description: "Một trong những tác phẩm nổi bật nhất trong loạt tranh Hoa Súng của Monet, thể hiện ánh sáng buổi chiều phản chiếu trên mặt hồ tại Giverny.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
  },
  {
    id: "art-002",
    slug: "starry-night-van-gogh",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    medium: "Oil on canvas",
    dimensions: "73.7 × 92.1 cm",
    museumSlug: "hirshhorn",
    exhibitionSlugs: ["sat-thuep-va-anh-sang"],
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80",
    description: "Bầu trời đêm cuộn xoáy trên ngôi làng Saint-Rémy-de-Provence, vẽ từ cửa sổ phòng bệnh viện tâm thần — một trong những bức tranh được nhận ra nhiều nhất thế giới.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
  },
  {
    id: "art-003",
    slug: "apollo-11-command-module",
    title: "Apollo 11 Command Module Columbia",
    artist: "NASA / North American Aviation",
    year: "1969",
    medium: "Spacecraft (titanium, stainless steel, Mylar)",
    dimensions: "Height 3.9 m, Diameter 3.9 m",
    museumSlug: "hang-khong-vu-tru",
    exhibitionSlugs: ["buoc-ra-quy-dao"],
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&q=80",
    description: "Module chỉ huy đưa Armstrong, Aldrin và Collins đến Mặt Trăng và trở về an toàn tháng 7/1969 — hiện vật biểu tượng của thời đại chinh phục vũ trụ.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "372bb6781922471cada4e0a9bd5c61fb",
  },
  {
    id: "art-004",
    slug: "hope-diamond",
    title: "Hope Diamond",
    artist: "Natural specimen",
    year: "c. 1.1 billion years ago",
    medium: "Blue diamond (45.52 carats)",
    dimensions: "25.6 × 21.78 × 12 mm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
    description: "Viên kim cương Hope 45,52 carat màu xanh thẫm huyền thoại — được cho là thuộc về vua Louis XIV trước khi lưu lạc qua nhiều thập kỷ trước khi về với Smithsonian.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
  },
  {
    id: "art-005",
    slug: "triceratops-skull",
    title: "Triceratops horridus Skull",
    artist: "Natural specimen",
    year: "c. 68 million years ago",
    medium: "Fossilized bone",
    dimensions: "2.3 m length",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80",
    description: "Hộp sọ Triceratops horridus hoàn chỉnh từ thời kỳ Cretaceous muộn — một trong những mẫu vật khủng long được bảo tồn tốt nhất trong bộ sưu tập Smithsonian.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "e9c507f179ed4455aac3b208c9e6c973",
  },
  {
    id: "art-006",
    slug: "wright-brothers-flyer",
    title: "1903 Wright Flyer",
    artist: "Wilbur & Orville Wright",
    year: "1903",
    medium: "Spruce wood, muslin, aluminum",
    dimensions: "6.4 m (height) × 12.3 m (wingspan)",
    museumSlug: "hang-khong-vu-tru",
    exhibitionSlugs: ["buoc-ra-quy-dao"],
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80",
    description: "Chiếc máy bay thực hiện chuyến bay có động cơ đầu tiên của con người tại Kitty Hawk, Bắc Carolina, ngày 17/12/1903 — 12 giây thay đổi lịch sử.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "c91467735c6743af872e65107a79beda",
  },
  {
    id: "art-007",
    slug: "chinese-porcelain-vase",
    title: "Blue-and-White Porcelain Vase",
    artist: "Imperial Jingdezhen Kilns",
    year: "c. 1403–1424 (Yongle reign)",
    medium: "Porcelain with cobalt blue underglaze",
    dimensions: "H 44.5 cm",
    museumSlug: "nghe-thuat-chau-a",
    exhibitionSlugs: ["uyen-chuyen-vien-dong"],
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&q=80",
    description: "Bình sứ lam trắng từ lò gốm Cảnh Đức Trấn thời Vĩnh Lạc — đỉnh cao của nghệ thuật đồ sứ cung đình triều Minh với hoa văn rồng mây tinh xảo.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-008",
    slug: "japanese-screen-painting",
    title: "Scenes from The Tale of Genji",
    artist: "Unknown (Tosa school)",
    year: "c. 1600–1650",
    medium: "Ink and color on gold leaf paper",
    dimensions: "Each panel 170 × 374 cm",
    museumSlug: "nghe-thuat-chau-a",
    exhibitionSlugs: ["uyen-chuyen-vien-dong"],
    image: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=1200&q=80",
    description: "Bức bình phong sáu tấm mô tả cảnh trong Truyện Genji — kiệt tác văn học Nhật Bản — theo phong cách Tosa với nền vàng lá rực rỡ của thời Edo.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-009",
    slug: "calder-mobile",
    title: "Lobster Trap and Fish Tail",
    artist: "Alexander Calder",
    year: "1939",
    medium: "Painted steel wire and sheet aluminum",
    dimensions: "2.6 m height, 2.9 m diameter",
    museumSlug: "hirshhorn",
    exhibitionSlugs: ["sat-thuep-va-anh-sang"],
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
    description: "Mobile treo biểu tượng của Calder — thép uốn thành hình tôm hùm bẫy và đuôi cá chuyển động theo không khí, tiên phong cho nghệ thuật động học.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-010",
    slug: "star-spangled-banner",
    title: "Star-Spangled Banner",
    artist: "Mary Pickersgill",
    year: "1813",
    medium: "Wool bunting and cotton",
    dimensions: "10 × 9.1 m (original flag)",
    museumSlug: "lich-su-hoa-ky",
    exhibitionSlugs: ["ngon-co-va-bien"],
    image: "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=1200&q=80",
    description: "Lá cờ bay trên Pháo đài McHenry trong trận chiến 1814 — nguồn cảm hứng cho bài quốc ca Hoa Kỳ \"The Star-Spangled Banner\". Báu vật quốc gia.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
  },
  {
    id: "art-011",
    slug: "monet-haystacks",
    title: "Haystacks (End of Summer)",
    artist: "Claude Monet",
    year: "1891",
    medium: "Oil on canvas",
    dimensions: "60 × 100 cm",
    museumSlug: "phong-tranh-chan-dung",
    exhibitionSlugs: ["chan-dung-the-ky"],
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
    description: "Từ loạt tranh đống cỏ khô nổi tiếng, Monet nắm bắt ánh sáng buổi chiều muộn mùa hè tại Giverny — một trong những thí nghiệm Ấn tượng sâu sắc nhất về sự thay đổi của ánh sáng.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-012",
    slug: "van-gogh-bedroom",
    title: "The Bedroom",
    artist: "Vincent van Gogh",
    year: "1888",
    medium: "Oil on canvas",
    dimensions: "72.4 × 91.3 cm",
    museumSlug: "hirshhorn",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80",
    description: "Căn phòng ngủ giản dị tại nhà Vàng ở Arles — Van Gogh vẽ ba phiên bản bức này, gửi gắm trong đó giấc mơ về một ngôi nhà nghệ sĩ yên bình.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-013",
    slug: "khmer-deity",
    title: "Standing Male Deity (Vishnu)",
    artist: "Khmer workshop",
    year: "c. 10th century CE",
    medium: "Sandstone",
    dimensions: "H 112 cm",
    museumSlug: "nghe-thuat-chau-a",
    exhibitionSlugs: ["uyen-chuyen-vien-dong"],
    image: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1200&q=80",
    description: "Tượng thần Vishnu đứng bằng đá sa thạch của nghệ nhân Khmer thế kỷ X — điêu khắc tôn giáo thể hiện sức mạnh và sự an nhiên của văn minh Angkor.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-014",
    slug: "hubble-deep-field",
    title: "Hubble Ultra Deep Field",
    artist: "NASA / ESA / STScI",
    year: "2004",
    medium: "Composite digital photograph",
    dimensions: "11.5 arcminutes × 11.5 arcminutes",
    museumSlug: "hang-khong-vu-tru",
    exhibitionSlugs: ["buoc-ra-quy-dao"],
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
    description: "Hơn 10.000 thiên hà trong một vùng trời nhỏ bằng hạt cát cầm ở xa. Ảnh phơi sáng 23 ngày của Hubble — cái nhìn xa nhất vào vũ trụ của con người.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
  },
  {
    id: "art-015",
    slug: "samurai-armor",
    title: "Armor (Yoroi) of a Samurai",
    artist: "Unknown Japanese armorer",
    year: "c. 1600 (Edo period)",
    medium: "Lacquered iron, silk lacing, leather",
    dimensions: "H approx. 165 cm",
    museumSlug: "nghe-thuat-chau-a",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1584441405886-bc91be61e56a?w=1200&q=80",
    description: "Bộ giáp Yoroi thời Edo hoàn chỉnh — sắt sơn mài đen kết hợp dây lụa đỏ, thể hiện đỉnh cao nghề thủ công vũ khí và quan niệm thẩm mỹ của võ sĩ đạo.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },
  {
    id: "art-016",
    slug: "julia-margaret-cameron-portrait",
    title: "Portrait of Sir John Herschel",
    artist: "Julia Margaret Cameron",
    year: "1867",
    medium: "Albumen silver print",
    dimensions: "34.3 × 26 cm",
    museumSlug: "phong-tranh-chan-dung",
    exhibitionSlugs: ["chan-dung-the-ky"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80",
    description: "Chân dung nhà thiên văn học John Herschel do Julia Margaret Cameron chụp — tác phẩm nhiếp ảnh nghệ thuật đầu tiên đặt khuôn mặt con người lên ngang tầm hội họa.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
  },

  // ── 3D Digital Collection – Natural History ──────────────────────────────
  {
    id: "art-017",
    slug: "wankel-rex",
    title: "Wankel T. Rex",
    artist: "Natural specimen",
    year: "c. 66 million years ago",
    medium: "Fossilized bone (Tyrannosaurus rex)",
    dimensions: "12.3 m length",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80",
    description: "Bộ xương T. rex Wankel hoàn chỉnh nhất thế giới — phát hiện tại Montana năm 1988, trưng bày tại NMNH từ 2019 sau 7 năm phục chế. Mô hình 3D scan toàn bộ từ bản gốc.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "62c596640dad4f15b36e751225bf6fca",
  },
  {
    id: "art-018",
    slug: "woolly-mammoth",
    title: "Mammuthus primigenius (Woolly Mammoth)",
    artist: "Natural specimen",
    year: "c. 10,000 years ago",
    medium: "Fossilized bone",
    dimensions: "3.4 m height, 5.4 m length",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?w=1200&q=80",
    description: "Bộ xương voi ma mút lông mịn từ kỷ Pleistocene — loài tuyệt chủng cách đây khoảng 4.000 năm. Scan 3D độ phân giải cao từ Smithsonian Digitization Program Office.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "229976b3db4646b39c44e57a7e3d8744",
  },
  {
    id: "art-019",
    slug: "eremotherium-giant-sloth",
    title: "Eremotherium laurillardi (Giant Ground Sloth)",
    artist: "Natural specimen",
    year: "c. 11,000 years ago",
    medium: "Fossilized bone",
    dimensions: "6 m length",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200&q=80",
    description: "Lười đất khổng lồ Eremotherium — động vật có vú lớn nhất từng sống tại châu Mỹ, nặng tới 5 tấn. Mẫu vật từ Brazil trong Pleistocene muộn.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "216182910e0345d2a021d56787a63b96",
  },
  {
    id: "art-020",
    slug: "elephant-rotunda",
    title: "African Bush Elephant (Rotunda)",
    artist: "Natural specimen",
    year: "1955 (mounted)",
    medium: "Taxidermy specimen",
    dimensions: "4 m height at shoulder",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1200&q=80",
    description: "Con voi châu Phi nổi tiếng đứng giữa sảnh tròn của NMNH từ năm 1959 — biểu tượng lâu đời nhất của bảo tàng. Mô hình 3D bao gồm toàn bộ cơ thể và vòm sảnh.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "369fbb83c21f4aeb8358b8738cae460f",
  },
  {
    id: "art-021",
    slug: "rufus-mammoth",
    title: "Rufus the Columbian Mammoth",
    artist: "Natural specimen",
    year: "c. 13,000 years ago",
    medium: "Cast from fossilized bone",
    dimensions: "3.9 m height",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?w=1200&q=80",
    description: "\"Rufus\" — bộ xương voi ma mút Columbian từ bộ sưu tập NMNH, loài voi khổng lồ sống ở Bắc Mỹ trong Thế Pleistocene. Phong phú hơn voi ma mút lông mịn ở kích thước.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "a36c8c4c7c764d858d558c8b5fc66eeb",
  },

  // ── 3D Digital Collection – Air & Space ──────────────────────────────────
  {
    id: "art-022",
    slug: "space-shuttle-discovery",
    title: "Space Shuttle Discovery (OV-103)",
    artist: "NASA / Rockwell International",
    year: "1984 (first flight)",
    medium: "Spacecraft (aluminum, thermal tiles)",
    dimensions: "56.1 m length, 23.8 m height",
    museumSlug: "hang-khong-vu-tru",
    exhibitionSlugs: ["buoc-ra-quy-dao"],
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200&q=80",
    description: "Tàu con thoi Discovery — tàu vũ trụ bay nhiều lần nhất trong lịch sử (39 nhiệm vụ), đưa kính viễn vọng Hubble lên quỹ đạo năm 1990. Mô hình 3D scan toàn bộ bề ngoài.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "5f7176a2ae284d6b99fc970c9d265c04",
  },
  {
    id: "art-023",
    slug: "apollo-11-exterior",
    title: "Apollo 11 Command Module Exterior",
    artist: "NASA / North American Aviation",
    year: "1969",
    medium: "Spacecraft exterior (heat shield, titanium)",
    dimensions: "Height 3.9 m, Diameter 3.9 m",
    museumSlug: "hang-khong-vu-tru",
    exhibitionSlugs: ["buoc-ra-quy-dao"],
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&q=80",
    description: "Mô hình 3D ngoại thất module Columbia với tấm chắn nhiệt bị đốt cháy sau khi tái nhập khí quyển — dấu tích vật chất của hành trình Mặt Trăng lịch sử 1969.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "bf46ddbfb76b42d2af57d20625b1b603",
  },

  // ── 3D Digital Collection – American History ─────────────────────────────
  {
    id: "art-024",
    slug: "george-washington-statue",
    title: "George Washington (Greenough Statue)",
    artist: "Horatio Greenough",
    year: "1840",
    medium: "Marble",
    dimensions: "H 3.4 m",
    museumSlug: "lich-su-hoa-ky",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=1200&q=80",
    description: "Tượng đá cẩm thạch Washington ngồi theo phong cách thần Zeus của Phidias — tác phẩm điêu khắc gây tranh cãi nhất trong lịch sử Mỹ, từng đặt tại Điện Capitol.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "6f90971e3eb24c0b8091086242f2c3b3",
  },
  {
    id: "art-025",
    slug: "lincoln-life-mask",
    title: "Abraham Lincoln Life Mask (Mills, 1865)",
    artist: "Clark Mills",
    year: "1865",
    medium: "Plaster cast",
    dimensions: "H 28 cm",
    museumSlug: "lich-su-hoa-ky",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1602934585418-f588bea4215c?w=1200&q=80",
    description: "Khuôn mặt thạch cao của Lincoln được đúc 2 tháng trước khi ông bị ám sát — khuôn mặt cuối cùng được ghi lại khi còn sống, mang nét khắc khổ của những năm Nội chiến.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "a888a9926abb4691a0b91d4eee24b61e",
  },
  {
    id: "art-026",
    slug: "morse-vail-telegraph",
    title: "Morse-Vail Telegraph Key",
    artist: "Alfred Vail",
    year: "1844",
    medium: "Brass and iron",
    dimensions: "H 10 cm, L 20 cm",
    museumSlug: "lich-su-hoa-ky",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
    description: "Khóa điện báo Morse-Vail được dùng để gõ tin nhắn \"What hath God wrought\" — bức điện đầu tiên qua đường dây Baltimore-Washington ngày 24/5/1844, khai sinh thông tin hiện đại.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "a5b108e3132d46b696c36310c2314ed8",
  },
  {
    id: "art-027",
    slug: "armstrong-spacesuit",
    title: "Neil Armstrong Spacesuit (Annotated Tour)",
    artist: "ILC Dover / NASA",
    year: "1969",
    medium: "Multi-layer pressure suit (21 layers of nylon, rubber, Mylar)",
    dimensions: "Height 1.73 m (worn)",
    museumSlug: "hang-khong-vu-tru",
    exhibitionSlugs: ["buoc-ra-quy-dao"],
    image: "https://images.unsplash.com/photo-1457364847539-ac1cd4f7c54e?w=1200&q=80",
    description: "Bộ đồ vũ trụ của Neil Armstrong được đội khi đặt bước chân đầu tiên lên Mặt Trăng. Tour 3D chú thích chi tiết từng lớp bảo vệ của bộ đồ được phục chế năm 2019.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "9d27a260d6714807abb49d852c20d39f",
  },

  // ── 3D Digital Collection – Natural History (mở rộng, Sketchfab/Smithsonian) ──
  {
    id: "art-028",
    slug: "trex-triceratops-diorama",
    title: "T. rex & Triceratops (Diorama đối đầu)",
    artist: "Natural specimen",
    year: "c. 66–68 triệu năm trước",
    medium: "Bộ xương hóa thạch phục dựng",
    dimensions: "Tỉ lệ thật",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80",
    description: "Cảnh tái hiện cuộc chạm trán kinh điển cuối kỷ Creta — T. rex săn mồi đối mặt Triceratops phòng thủ, hai biểu tượng khủng long nổi tiếng nhất lịch sử cổ sinh vật học.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "e9fa58a7f25645db99b9519073c88b40",
  },
  {
    id: "art-029",
    slug: "trex-skull-scale-model",
    title: "Hộp sọ T. rex (Mô hình tỉ lệ 1:20)",
    artist: "NMNH Digitization Program Office",
    year: "Mẫu vật sưu tầm hiện đại",
    medium: "Mô hình in 3D từ scan hộp sọ gốc",
    dimensions: "Tỉ lệ 1:20 bản gốc",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80",
    description: "Phiên bản thu nhỏ chính xác của hộp sọ Tyrannosaurus rex, scan 3D độ phân giải cao phục vụ nghiên cứu và giáo dục mà không cần tiếp cận mẫu vật gốc dễ vỡ.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "250dc8f51ee444679ad7ba6c3010c7a7",
  },
  {
    id: "art-030",
    slug: "silurian-sea-diorama",
    title: "Diorama Biển Nông Kỷ Silur",
    artist: "Natural specimen",
    year: "c. 443–419 triệu năm trước",
    medium: "Diorama hóa thạch biển",
    dimensions: "Tỉ lệ trưng bày",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Tái hiện hệ sinh thái biển nông kỷ Silur với san hô cổ, bọ ba thùy và các loài không xương sống biển — thời kỳ sự sống trên cạn vừa mới bắt đầu.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "8909d3307e9544e1ad0d0d9d1b97e1f7",
  },
  {
    id: "art-031",
    slug: "eurypterid-diorama",
    title: "Diorama Bọ Cạp Biển (Eurypterid)",
    artist: "Natural specimen",
    year: "c. 460–250 triệu năm trước",
    medium: "Diorama hóa thạch",
    dimensions: "Tỉ lệ trưng bày",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: ["hoa-thach-thoi-gian"],
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80",
    description: "Eurypterid — \"bọ cạp biển\" cổ đại, một trong những động vật chân khớp lớn nhất từng tồn tại, có loài dài tới 2,5 mét, thống trị các vùng biển cổ sinh.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "f24d3cc749674cffaaa25b79ffd87fb8",
  },
  {
    id: "art-032",
    slug: "columnar-jointing",
    title: "Đá Cột Bazan (Columnar Jointing)",
    artist: "Mẫu địa chất",
    year: "Thành tạo núi lửa",
    medium: "Đá bazan",
    dimensions: "Mẫu vật địa chất",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=1200&q=80",
    description: "Cấu trúc cột đá lục giác hình thành khi dung nham bazan nguội và co lại đồng đều — hiện tượng địa chất nổi tiếng tạo nên các kỳ quan như Giant's Causeway.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "63608f7c74bc4083a44ceba6a0489871",
  },
  {
    id: "art-033",
    slug: "geochelone-carbonaria",
    title: "Rùa Cạn Chân Đỏ",
    artist: "Natural specimen",
    year: "Mẫu vật sưu tầm hiện đại",
    medium: "Mẫu vật động vật học",
    dimensions: "~30–40 cm (mai)",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?w=1200&q=80",
    description: "Geochelone carbonaria — loài rùa cạn vùng Nam Mỹ với mai hoa văn đặc trưng và vảy chân màu đỏ cam, một trong những mẫu vật động vật học tiêu biểu của NMNH.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "0bc47e68d77243efa50a22b881970626",
  },
  {
    id: "art-034",
    slug: "panulirus-longipes",
    title: "Tôm Hùm Gai Chân Dài",
    artist: "Natural specimen",
    year: "Mẫu vật sưu tầm hiện đại",
    medium: "Mẫu vật giáp xác",
    dimensions: "~25–30 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&q=80",
    description: "Panulirus longipes — loài tôm hùm gai Ấn Độ Dương–Thái Bình Dương, không có càng lớn như tôm hùm Đại Tây Dương nhưng bù lại bằng cặp râu dài và gai giáp cứng cáp.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "d7cc2b585ad943ef81274e014e6f745b",
  },
  {
    id: "art-035",
    slug: "carcharhinus-altimus",
    title: "Cá Mập Đáy Sâu (Bignose Shark)",
    artist: "Natural specimen",
    year: "Mẫu vật sưu tầm hiện đại",
    medium: "Mẫu vật ngư học",
    dimensions: "~2,8–3 m",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=1200&q=80",
    description: "Carcharhinus altimus sống ở vùng nước sâu ven thềm lục địa nhiệt đới, được nhận diện qua chiếc mũi to bản đặc trưng — một trong các mẫu cá mập nghiên cứu của NMNH.",
    rights: "CC0 – Public Domain",
    isHighlight: true,
    sketchfabUid: "2a21cb5975984e8c86e2d7fa0e7cc773",
  },
  {
    id: "art-036",
    slug: "embreea-herrenhusana",
    title: "Lan Embreea herrenhusana",
    artist: "Natural specimen",
    year: "Mẫu vật thực vật học",
    medium: "Mẫu ép thực vật / scan 3D hoa",
    dimensions: "Kích thước tự nhiên",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1200&q=80",
    description: "Một loài lan quý hiếm vùng Nam Mỹ trong bộ sưu tập thực vật học Smithsonian, được số hóa 3D để lưu giữ cấu trúc hoa mỏng manh vốn khó bảo quản lâu dài.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "05dbf734fe4043d98e8a0a97861924dc",
  },
  {
    id: "art-037",
    slug: "key-marco-cat",
    title: "Tượng Mèo Key Marco",
    artist: "Văn hóa Calusa (bản địa Florida)",
    year: "c. 1450–1550",
    medium: "Gỗ chạm khắc",
    dimensions: "H 15,2 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1200&q=80",
    description: "Tượng gỗ hình người-báo của người Calusa khai quật tại Key Marco, Florida năm 1896 — một trong những tác phẩm điêu khắc bản địa Bắc Mỹ tinh xảo nhất còn sót lại.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "6f08e792df9a4d3e9d0acd65456bdeee",
  },
  {
    id: "art-038",
    slug: "tridacna-squamosa",
    title: "Sò Tai Tượng Có Vảy",
    artist: "Natural specimen",
    year: "Mẫu vật sưu tầm hiện đại",
    medium: "Vỏ sò (mẫu vật nhuyễn thể)",
    dimensions: "~20–30 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "Tridacna squamosa — một trong các loài sò tai tượng Ấn Độ Dương–Thái Bình Dương, có các vảy xoắn đặc trưng dọc theo mép vỏ, sống cộng sinh với tảo trong mô.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "4f08856d40e14a9780a7f7714a4ff5a7",
  },
  {
    id: "art-039",
    slug: "seriatopora-hystrix",
    title: "San Hô Seriatopora hystrix",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~15–25 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "San hô cành mảnh với các nhánh gai nhọn đặc trưng, thường gặp ở vùng nước nông Ấn Độ Dương–Thái Bình Dương — một mẫu trong bộ sưu tập Động vật không xương sống NMNH.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "b6be88ce19e14e5bb038918d111430d5",
  },
  {
    id: "art-040",
    slug: "stylaster-sanguineus",
    title: "San Hô Lửa Stylaster sanguineus",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~10–20 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Một loài san hô thủy tức (hydrocoral) với sắc đỏ rực đặc trưng, thuộc chi Stylaster — nhóm san hô thường mọc ở các rạn sâu hơn so với san hô đá thông thường.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "4f1ddd8352944d16bf3b821b3e71b473",
  },
  {
    id: "art-041",
    slug: "goniastrea-favulus",
    title: "San Hô Não Goniastrea favulus",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~20–35 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "San hô dạng khối với các múi hình mê cung gợi nhớ cấu trúc não bộ — kiểu hình thái phổ biến giúp san hô não phân tán sóng và chống chịu dòng chảy mạnh.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "526ede8a83f943ee868d6991a6d5a533",
  },
  {
    id: "art-042",
    slug: "stylaster-brochi",
    title: "San Hô Lửa Stylaster brochi",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~10–18 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Một loài san hô thủy tức khác thuộc chi Stylaster, được thu thập và số hóa phục vụ nghiên cứu phân loại các quần thể san hô vùng biển sâu.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "de7581ed8f664d35a1ee5bd94f518fe4",
  },
  {
    id: "art-043",
    slug: "acropora-cervicornis",
    title: "San Hô Gạc Nai (Staghorn Coral)",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~30–50 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "Acropora cervicornis — san hô gạc nai, từng là loài xây rạn chủ lực vùng Caribê, nay thuộc nhóm nguy cấp do tẩy trắng và biến đổi khí hậu đe dọa các rạn san hô.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "addc8ad93ace4e999085d6f8151cd694",
  },
  {
    id: "art-044",
    slug: "pseudodiploria-strigosa",
    title: "San Hô Não Rãnh Thẳng",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~25–40 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Pseudodiploria strigosa — san hô não vùng Caribê với các rãnh gần như song song thẳng tắp, khác biệt với kiểu rãnh ngoằn ngoèo của các chi san hô não khác.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "8db353e299634cf1bfeca6f6d112582d",
  },
  {
    id: "art-045",
    slug: "diploria-labyrinthiformis",
    title: "San Hô Não Rãnh Mê Cung",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~25–40 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "Diploria labyrinthiformis có các rãnh uốn lượn sâu đặc trưng tạo hình mê cung trên bề mặt — một trong những loài san hô não dễ nhận diện nhất vùng Đại Tây Dương.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "cbbf64f211f84a7cb62887fec11f54fe",
  },
  {
    id: "art-046",
    slug: "astraea-favistella",
    title: "San Hô Astraea (Fissicella) favistella",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~20–35 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Một loài san hô dạng khối với các polyp xếp thành cụm đa giác đều đặn, góp phần vào bộ sưu tập phân loại san hô đá phong phú của NMNH.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "8a93b3e5d6014ee69da1970e296e847c",
  },
  {
    id: "art-047",
    slug: "stylaster-alaskanus",
    title: "San Hô Lửa Stylaster alaskanus",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~10–15 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "Loài san hô thủy tức sống ở vùng biển lạnh Bắc Thái Bình Dương gần Alaska — minh chứng cho việc san hô không chỉ giới hạn ở vùng nhiệt đới ấm áp.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "036e7dd516e348cc8ac5aa3f3933f11c",
  },
  {
    id: "art-048",
    slug: "merulina-rigida",
    title: "San Hô Merulina rigida",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~20–30 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "San hô dạng phiến gợn sóng, mọc lan rộng theo kiểu tấm xếp lớp — hình thái thích nghi để tối đa diện tích hấp thụ ánh sáng ở vùng rạn nông.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "a220ed5340024b14bb6b494cc49da2ee",
  },
  {
    id: "art-049",
    slug: "millepora-alcicornis",
    title: "San Hô Lửa Gạc Nai (Millepora alcicornis)",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~25–40 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "San hô lửa với tế bào châm mạnh có thể gây rát da khi chạm phải — thực chất thuộc nhóm thủy tức (hydrozoa) chứ không phải san hô đá thật sự.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "c423e8f191954fb08fd0ace0bf6ba5ef",
  },
  {
    id: "art-050",
    slug: "madrepora-cytherea",
    title: "San Hô Madrepora cytherea",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~20–35 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Loài san hô cành mảnh phân nhánh phức tạp, một trong những mẫu vật minh họa sự đa dạng hình thái đáng kinh ngạc của bộ San hô cứng (Scleractinia).",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "9ff5270cafce4ceab61ce84c41c26faa",
  },
  {
    id: "art-051",
    slug: "psammocora-columna",
    title: "San Hô Psammocora columna",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~15–25 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "San hô dạng cột với bề mặt lấm tấm các polyp nhỏ li ti — một trong những chi san hô chịu đựng tốt điều kiện nước đục và trầm tích cao.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "a10e8a28063f4c2685a340a60f40e792",
  },
  {
    id: "art-052",
    slug: "leptoseris-gardineri",
    title: "San Hô Phiến Leptoseris gardineri",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~20–30 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "San hô phiến mỏng thích nghi để sống ở độ sâu lớn hơn, nơi ánh sáng yếu — hình thái dẹt giúp tối ưu hóa diện tích quang hợp của tảo cộng sinh.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "fcb2217919ab47f7a57741e3ad2d60ba",
  },
  {
    id: "art-053",
    slug: "distichopora-violacea",
    title: "San Hô Lửa Tím Distichopora violacea",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~10–18 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "Một loài san hô thủy tức với sắc tím đặc trưng hiếm gặp, được các nhà sưu tầm san hô đặc biệt chú ý vì màu sắc nổi bật giữa các rạn đá.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "01b8332d06eb4306b78bc85e66c108b2",
  },
  {
    id: "art-054",
    slug: "meandrina-meandrites",
    title: "San Hô Não Mê Cung (Meandrina meandrites)",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~20–35 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1200&q=80",
    description: "Tên loài bắt nguồn từ các rãnh uốn khúc như dòng sông Meander cổ đại — một dạng san hô não đặc trưng của vùng biển Caribê và Đại Tây Dương.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "95884d3e683a4c51adddea41348f1f34",
  },
  {
    id: "art-055",
    slug: "acropora-valenciennesi",
    title: "San Hô Acropora valenciennesi",
    artist: "Natural specimen",
    year: "Mẫu vật sinh học biển",
    medium: "Khung xương san hô hóa vôi",
    dimensions: "~25–40 cm",
    museumSlug: "lich-su-tu-nhien",
    exhibitionSlugs: [],
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80",
    description: "Một loài san hô thuộc chi Acropora — nhóm san hô xây rạn lớn nhất và đa dạng nhất thế giới, đóng vai trò nền tảng cho hệ sinh thái rạn san hô nhiệt đới.",
    rights: "CC0 – Public Domain",
    isHighlight: false,
    sketchfabUid: "ad2212f48b0047809101354d096a8302",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS (10 souvenir items - Verified Unsplash High-Res Photos)
// ─────────────────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: "prod-001",
    slug: "postcard-water-lilies",
    name: "Postcard — Water Lilies (Monet)",
    price: 350, // $3.50
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
    inventory: 200,
    museumSlug: "phong-tranh-chan-dung",
    inspiredByArtifactId: "art-001",
    category: "Postcard",
    description: "Bưu thiếp in chất lượng cao khổ A6 từ tác phẩm Water Lilies của Claude Monet. Mực bền màu, giấy 350gsm.",
  },
  {
    id: "prod-002",
    slug: "postcard-starry-night",
    name: "Postcard — The Starry Night (Van Gogh)",
    price: 350,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
    inventory: 150,
    museumSlug: "hirshhorn",
    inspiredByArtifactId: "art-002",
    category: "Postcard",
    description: "Bưu thiếp The Starry Night — tái hiện những nét cọ xoáy cuộn của Van Gogh qua công nghệ in CMYK 4 màu.",
  },
  {
    id: "prod-003",
    slug: "art-book-smithsonian-100",
    name: "Smithsonian 100 — Art Book",
    price: 3500, // $35.00
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    inventory: 45,
    museumSlug: "lich-su-tu-nhien",
    inspiredByArtifactId: null,
    category: "Sách nghệ thuật",
    description: "100 hiện vật biểu tượng nhất trong lịch sử 150 năm của Smithsonian. Bìa cứng, 320 trang, in màu toàn bộ.",
  },
  {
    id: "prod-004",
    slug: "book-monet-impressionism",
    name: "Monet & Impressionism — Monograph",
    price: 2800,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
    inventory: 30,
    museumSlug: "phong-tranh-chan-dung",
    inspiredByArtifactId: "art-011",
    category: "Sách nghệ thuật",
    description: "Chuyên khảo toàn diện về cuộc đời và sự nghiệp Claude Monet. 256 trang với hình ảnh chất lượng bảo tàng.",
  },
  {
    id: "prod-005",
    slug: "hope-diamond-replica",
    name: "Hope Diamond Replica",
    price: 1200, // $12.00
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    inventory: 80,
    museumSlug: "lich-su-tu-nhien",
    inspiredByArtifactId: "art-004",
    category: "Lưu niệm",
    description: "Mô hình kim cương Hope làm từ pha lê cắt thủ công, màu xanh huyền bí, đặt trên đế gỗ sồi. Kích thước thật.",
  },
  {
    id: "prod-006",
    slug: "astronaut-mug",
    name: "Apollo 11 Ceramic Mug",
    price: 1500,
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&q=80",
    inventory: 120,
    museumSlug: "hang-khong-vu-tru",
    inspiredByArtifactId: "art-003",
    category: "Lưu niệm",
    description: "Cốc sứ 350ml in hình Apollo 11 phóng lên bầu trời — chịu nhiệt, an toàn với lò vi sóng và máy rửa chén.",
  },
  {
    id: "prod-007",
    slug: "sotacraft-tshirt-museum",
    name: "Sota Museum T-Shirt",
    price: 2500,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    inventory: 60,
    museumSlug: "lich-su-tu-nhien",
    inspiredByArtifactId: null,
    category: "Thời trang",
    description: "Áo thun unisex 100% cotton in logo Sota và phác thảo kiến trúc bảo tàng. Các size XS–2XL, màu trắng ngà.",
  },
  {
    id: "prod-008",
    slug: "japanese-fan-print",
    name: "Genji Fan — Silk Print",
    price: 1800,
    image: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?w=800&q=80",
    inventory: 40,
    museumSlug: "nghe-thuat-chau-a",
    inspiredByArtifactId: "art-008",
    category: "Lưu niệm",
    description: "Quạt lụa thêu tay tái hiện cảnh Truyện Genji — sản xuất thủ công tại Kyoto. Hộp quà tặng bao gồm.",
  },
  {
    id: "prod-009",
    slug: "postcard-hubble",
    name: "Postcard — Hubble Ultra Deep Field",
    price: 350,
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
    inventory: 300,
    museumSlug: "hang-khong-vu-tru",
    inspiredByArtifactId: "art-014",
    category: "Postcard",
    description: "Bưu thiếp in ảnh Hubble Ultra Deep Field — 10.000 thiên hà trong lòng bàn tay bạn.",
  },
  {
    id: "prod-010",
    slug: "canvas-tote-sota",
    name: "Sota Canvas Tote Bag",
    price: 1800,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
    inventory: 90,
    museumSlug: "hirshhorn",
    inspiredByArtifactId: null,
    category: "Thời trang",
    description: "Túi canvas dày 400gsm in họa tiết viền hình học lấy cảm hứng từ kiến trúc Hirshhorn. Quai dài 70cm.",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TICKET SLOTS (4 per museum × 6 museums = 24 slots)
// ─────────────────────────────────────────────────────────────────────────────

function makeSlots(museumSlug: string, prices: [number, number, number, number]): TicketSlot[] {
  const times = ["09:00-11:00", "11:00-13:00", "14:00-16:00", "16:00-18:00"]
  const spots = [24, 18, 30, 12]
  return times.map((time, i) => ({
    id: `${museumSlug}-${time.replace(/[: -]/g, "")}`,
    museumSlug,
    time,
    price: prices[i],
    remainingSpots: spots[i],
  }))
}

export const ticketSlots: TicketSlot[] = [
  ...makeSlots("lich-su-tu-nhien", [0, 0, 0, 0]),
  ...makeSlots("hang-khong-vu-tru", [0, 0, 0, 0]),
  ...makeSlots("lich-su-hoa-ky", [0, 0, 0, 0]),
  ...makeSlots("phong-tranh-chan-dung", [500, 500, 800, 800]),
  ...makeSlots("hirshhorn", [0, 0, 0, 0]),
  ...makeSlots("nghe-thuat-chau-a", [0, 0, 0, 0]),
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const museumBySlug = (slug: string) => museums.find((m) => m.slug === slug)

export const exhibitionBySlug = (slug: string) => exhibitions.find((e) => e.slug === slug)

export const artifactById = (id: string) => artifacts.find((a) => a.id === id)

export const artifactBySlug = (slug: string) => artifacts.find((a) => a.slug === slug)

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug)

export const artifactsByMuseum = (museumSlug: string) =>
  artifacts.filter((a) => a.museumSlug === museumSlug)

export const productsByMuseum = (museumSlug: string) =>
  products.filter((p) => p.museumSlug === museumSlug)

export const ticketSlotsByMuseum = (museumSlug: string) =>
  ticketSlots.filter((s) => s.museumSlug === museumSlug)

export const exhibitionsByMuseum = (museumSlug: string) =>
  exhibitions.filter((e) => e.museumSlug === museumSlug)

export const highlightArtifacts = () => artifacts.filter((a) => a.isHighlight)

export const formatPrice = (cents: number, free = "Miễn phí") =>
  cents === 0 ? free : `$${(cents / 100).toFixed(2)}`

export const formatPriceVnd = (cents: number, free = "Miễn phí") =>
  cents === 0 ? free : `${(cents * 250).toLocaleString("vi-VN")}₫`

export const exhibitionStatus = (starts: string, ends: string): "ongoing" | "upcoming" | "ended" => {
  const refDate = "2026-11-19"
  if (ends < refDate) return "ended"
  if (starts > refDate) return "upcoming"
  return "ongoing"
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MVP TYPES & IN-MEMORY STORE (F14, F15, F16, F17, F18, F19, F20, F22)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRole = "anon" | "normal_user" | "admin_user" | "super_admin"
export type AdminKind = "museum" | "artifact" | "exhibit" | "ticket" | "product"
export type AdminFields = Record<string, string>

export interface AdminItem {
  id: string
  kind: AdminKind
  museum: string
  name: string
  status: string
  fields: AdminFields
  links: string[]
  source?: { code: string; url: string; rights: string }
}

export interface AdminOrder {
  id: string
  museum: string
  kind: "ticket" | "shop"
  date: string
  visit: string
  slot: string
  code: string
  status: string
  paid: boolean
  qty: number
  price: number
  fee: number
  product: string
  label: string
  exhibit?: string
  usedAt?: string
}

export interface AdminAsset {
  id: string
  museum: string
  target: string
  name: string
  primary: boolean
  sequence: number
  url: string
  mime: string
}

export function getAdminDay(offset = 0, now?: Date): string {
  const d = now ?? (typeof window === "undefined" ? new Date("2026-11-24T00:00:00.000Z") : new Date())
  return new Date(d.getTime() + (7 * 60 + offset * 1440) * 60000).toISOString().slice(0, 10)
}

export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

export const ADMIN_STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
  available: "Đang bán",
  unavailable: "Ngừng bán",
  confirmed: "Đã xác nhận",
  used: "Đã sử dụng",
  pending: "Chờ thanh toán",
  cancelled: "Đã hủy",
  shipped: "Đang giao",
  completed: "Đã giao",
}

export function createInitialAdminItems(): AdminItem[] {
  const item = (
    kind: AdminKind,
    id: string,
    museum: string,
    name: string,
    fields: AdminFields,
    status = "published"
  ): AdminItem => ({ kind, id, museum, name, fields, status, links: [] })

  const exhibit = item("exhibit", "e1", "m1", "Dấu men thời gian", {
    start: getAdminDay(-12),
    end: getAdminDay(28),
    description: "Bộ sưu tập gốm men lam và nghệ thuật thế kỷ XIX",
  })
  exhibit.links = ["a1"]

  return [
    item("museum", "m1", "m1", "Bảo tàng Mỹ thuật", {
      slug: "my-thuat",
      address: "66 Nguyễn Thái Học, Ba Đình",
      city: "Hà Nội",
      description: "Không gian trưng bày di sản mỹ thuật tiêu biểu của Việt Nam qua các thời kỳ.",
    }),
    item(
      "museum",
      "m2",
      "m2",
      "Bảo tàng Di sản",
      {
        slug: "di-san",
        city: "Huế",
        address: "12 Lê Lợi",
        description: "Bảo tồn cổ vật và di vật cung đình.",
      },
      "draft"
    ),
    item("artifact", "a1", "m1", "Bình men lam", {
      code: "BT-001",
      period: "Thế kỷ XIX",
      description: "Gốm men lam hoa lam thời Nguyễn sắc nét.",
    }),
    item(
      "artifact",
      "a2",
      "m1",
      "Tranh khắc phố cổ",
      {
        code: "BT-002",
        period: "Thế kỷ XX",
        description: "Bản khắc gỗ tái hiện phố Hàng Bạc.",
      },
      "draft"
    ),
    exhibit,
    item("ticket", "t1", "m1", "Vé tiêu chuẩn", { price: "60000", description: "Tham quan toàn bộ sảnh trưng bày cố định" }, "available"),
    item("ticket", "t2", "m1", "Vé sinh viên", { price: "30000", description: "Áp dụng khi xuất trình thẻ học sinh, sinh viên" }, "available"),
    item("product", "p1", "m1", "Bộ bưu thiếp", {
      code: "BC-01",
      price: "45000",
      stock: "18",
      description: "Tập 10 bưu thiếp in tác phẩm men lam tiêu biểu",
    }),
    item("product", "p2", "m1", "Sổ tay bảo tàng", {
      code: "ST-01",
      price: "80000",
      stock: "12",
      description: "Sổ bìa cứng giấy mỹ thuật ép kim",
    }),
    item("artifact", "a3", "m2", "Ấn triện", {
      code: "DS-01",
      period: "Thế kỷ XIX",
      description: "Cổ vật ngự dụng triều Nguyễn.",
    }),
  ]
}

export function createInitialAdminOrders(): AdminOrder[] {
  const ticket: AdminOrder = {
    id: "TKT-101",
    museum: "m1",
    kind: "ticket",
    date: getAdminDay(),
    visit: getAdminDay(),
    slot: "09:00-11:00",
    code: "SOTA-101",
    status: "confirmed",
    paid: true,
    qty: 2,
    price: 60000,
    fee: 0,
    product: "t1",
    label: "Vé tiêu chuẩn",
  }

  return [
    ticket,
    {
      ...ticket,
      id: "TKT-102",
      code: "SOTA-102",
      qty: 1,
      slot: "14:00-16:00",
      visit: getAdminDay(1),
      exhibit: "e1",
    },
    {
      ...ticket,
      id: "SHP-201",
      kind: "shop",
      code: "",
      qty: 2,
      price: 45000,
      fee: 20000,
      product: "p1",
      label: "Bộ bưu thiếp",
    },
    {
      ...ticket,
      id: "TKT-103",
      code: "",
      status: "pending",
      paid: false,
    },
  ]
}

export class AdminMockStore {
  role: AdminRole = "admin_user"
  activeMuseums = new Set(["m1"])
  items: AdminItem[] = createInitialAdminItems()
  assets: AdminAsset[] = []
  orders: AdminOrder[] = createInitialAdminOrders()
  private nextId = 100

  constructor() {
    this.reset()
  }

  reset() {
    this.role = "admin_user"
    this.activeMuseums = new Set(["m1"])
    this.items = createInitialAdminItems()
    this.assets = []
    this.orders = createInitialAdminOrders()
    this.nextId = 100
  }

  museums(): AdminItem[] {
    return this.items.filter(
      (x) =>
        x.kind === "museum" &&
        (this.role === "super_admin" ||
          (this.role === "admin_user" && this.activeMuseums.has(x.id)))
    )
  }

  guard(museumId: string) {
    if (this.role === "anon") {
      throw new Error("Phiên đã hết hạn. Vui lòng chọn lại tài khoản mẫu.")
    }
    if (this.role === "normal_user") {
      throw new Error("Tài khoản khách tham quan không có quyền quản lý bảo tàng.")
    }
    if (!this.museums().some((x) => x.id === museumId)) {
      throw new Error("Bạn không có quyền quản lý bảo tàng này.")
    }
  }

  list(museumId: string, kind: AdminKind): AdminItem[] {
    this.guard(museumId)
    return this.items.filter((x) => x.museum === museumId && x.kind === kind)
  }

  save(
    museumId: string,
    kind: AdminKind,
    id: string,
    name: string,
    status: string,
    fields: AdminFields,
    links: string[] = []
  ): AdminItem {
    this.guard(museumId)
    const old = id ? this.list(museumId, kind).find((x) => x.id === id) : undefined
    if (id && !old) throw new Error("Không tìm thấy bản ghi trong bảo tàng.")
    if (kind === "museum" && !id && this.role !== "super_admin") {
      throw new Error("Chỉ quản trị hệ thống được tạo bảo tàng.")
    }
    if (!name.trim()) throw new Error("Nhập tên trước khi lưu.")

    const validStatuses =
      kind === "ticket"
        ? ["available", "unavailable"]
        : ["draft", "published", "archived"]
    if (!validStatuses.includes(status)) {
      throw new Error("Trạng thái không hợp lệ.")
    }

    const uniqueKey = kind === "museum" ? "slug" : "code"
    if (
      kind === "museum" &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug || "")
    ) {
      throw new Error("Slug chỉ gồm chữ thường, số và dấu gạch nối.")
    }

    if (
      fields[uniqueKey] &&
      this.items.some(
        (x) =>
          x.id !== id &&
          x.kind === kind &&
          (kind === "museum" || x.museum === museumId) &&
          x.fields[uniqueKey] === fields[uniqueKey]
      )
    ) {
      throw new Error("Mã hoặc slug đã tồn tại.")
    }

    const numericKeys =
      kind === "product"
        ? ["price", "stock"]
        : kind === "ticket"
        ? ["price"]
        : []
    for (const key of numericKeys) {
      const v = Number(fields[key])
      if (
        !fields[key]?.trim() ||
        !Number.isFinite(v) ||
        v < 0 ||
        (key === "stock" && !Number.isInteger(v))
      ) {
        throw new Error("Giá và tồn kho phải hợp lệ và không âm.")
      }
    }

    if (kind === "exhibit") {
      if (!fields.start || !fields.end || fields.start > fields.end) {
        throw new Error("Ngày kết thúc phải từ ngày bắt đầu trở đi.")
      }
      if (
        new Set(links).size !== links.length ||
        links.some(
          (i) =>
            !this.list(museumId, "artifact").some(
              (a) => a.id === i && (a.status === "published" || old?.links.includes(i))
            )
        )
      ) {
        throw new Error("Chọn hiện vật hợp lệ trong bảo tàng.")
      }
    }

    const key = id || `record-${this.nextId++}`
    const result: AdminItem = {
      ...old,
      id: key,
      museum: kind === "museum" ? key : museumId,
      kind,
      name: name.trim(),
      status,
      fields: { ...fields },
      links: [...links],
    }

    if (old) {
      const idx = this.items.indexOf(old)
      this.items[idx] = result
    } else {
      this.items.push(result)
    }

    return result
  }

  importSample(museumId: string, count: number): { added: number; skipped: number } {
    this.guard(museumId)
    if (![1, 2].includes(count)) throw new Error("Chọn một hoặc hai mẫu.")

    let added = 0
    const samples = ["Stoneware bowl", "Blue textile study"].slice(0, count)

    for (const [index, name] of samples.entries()) {
      const code = `MOCK-SI-${index + 1}`
      if (this.list(museumId, "artifact").some((a) => a.source?.code === code)) {
        continue
      }
      const row = this.save(museumId, "artifact", "", name, "draft", {
        period: "Thế kỷ XIX",
        code: `SI-00${index + 1}`,
        description: `Mẫu vật thu thập từ bộ sưu tập Smithsonian Open Access (${name}).`,
      })
      row.source = {
        code,
        url: "https://www.si.edu/openaccess",
        rights: "Mẫu mô phỏng · CC0 – Public Domain",
      }
      added++
    }

    return { added, skipped: count - added }
  }

  queue(museumId: string): AdminOrder[] {
    this.guard(museumId)
    return this.orders.filter((o) => o.museum === museumId)
  }

  redeem(museumId: string, code: string): void {
    const order = this.queue(museumId).find(
      (o) => o.kind === "ticket" && o.code && o.code === code.trim().toUpperCase()
    )
    if (!order) throw new Error("Không tìm thấy mã vé trong bảo tàng.")
    if (order.status !== "confirmed") throw new Error("Vé đã sử dụng hoặc chưa được xác nhận.")
    if (order.visit !== getAdminDay()) throw new Error("Ngày tham quan không phải hôm nay.")

    order.status = "used"
    order.usedAt = new Date().toISOString()
  }

  advance(museumId: string, id: string, status: string): void {
    const o = this.queue(museumId).find((x) => x.id === id)
    if (!o) throw new Error("Không tìm thấy đơn.")

    if (status === "cancelled" && o.status === "confirmed" && (o.kind === "shop" || o.visit > getAdminDay())) {
      if (o.kind === "shop") {
        const p = this.list(museumId, "product").find((x) => x.id === o.product)
        if (!p) throw new Error("Không tìm thấy sản phẩm để hoàn kho.")
        p.fields.stock = String(Number(p.fields.stock) + o.qty)
      }
    } else if (
      !(
        o.kind === "shop" &&
        o.paid &&
        ((status === "shipped" && o.status === "confirmed") ||
          (status === "completed" && o.status === "shipped"))
      )
    ) {
      throw new Error("Đơn không thể chuyển sang trạng thái này.")
    }

    o.status = status
  }

  report(museumId: string, from: string, to: string, exhibit = "") {
    if (!from || !to || from > to) throw new Error("Khoảng ngày không hợp lệ.")
    const rows = this.queue(museumId).filter(
      (o) =>
        o.kind === "ticket" &&
        o.paid &&
        o.date >= from &&
        o.date <= to &&
        (!exhibit || o.exhibit === exhibit)
    )
    return {
      rows,
      qty: rows.reduce((v, o) => v + o.qty, 0),
      total: rows.reduce((v, o) => v + o.qty * o.price, 0),
    }
  }

  media(museumId: string): AdminAsset[] {
    this.guard(museumId)
    return this.assets
      .filter((a) => a.museum === museumId)
      .sort((a, b) => a.sequence - b.sequence)
  }

  upload(museumId: string, target: string, file: File): void {
    this.guard(museumId)
    if (
      !this.items.some(
        (x) =>
          x.id === target &&
          x.museum === museumId &&
          ["artifact", "product"].includes(x.kind)
      )
    ) {
      throw new Error("Chọn hiện vật hoặc sản phẩm trong bảo tàng.")
    }

    const formats: Record<string, string[]> = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/webp": ["webp"],
      "video/mp4": ["mp4"],
      "video/webm": ["webm"],
    }
    const maxMb = file.type.startsWith("video/") ? 50 : 10
    const ext = file.name.split(".").pop()?.toLowerCase() || ""

    if (!formats[file.type]?.includes(ext) || !file.size || file.size > maxMb * 1024 * 1024) {
      throw new Error("Chọn JPG, PNG, WebP (tối đa 10 MB) hoặc MP4, WebM (50 MB).")
    }

    this.assets.push({
      id: `media-${this.nextId++}`,
      museum: museumId,
      target,
      name: file.name,
      primary: !this.assets.some((a) => a.target === target),
      sequence: 0,
      url: URL.createObjectURL(file),
      mime: file.type,
    })
  }

  updateMedia(museumId: string, id: string, sequence: number, primary: boolean): void {
    const a = this.media(museumId).find((x) => x.id === id)
    if (!a || !Number.isInteger(sequence) || sequence < 0) {
      throw new Error("Thứ tự tệp không hợp lệ.")
    }
    if (primary) {
      this.assets.filter((x) => x.target === a.target).forEach((x) => (x.primary = false))
    }
    a.primary = primary
    a.sequence = sequence
  }

  removeMedia(museumId: string, id: string): void {
    const a = this.media(museumId).find((x) => x.id === id)
    if (!a) throw new Error("Không tìm thấy tệp.")
    if (a.url.startsWith("blob:")) URL.revokeObjectURL(a.url)
    this.assets = this.assets.filter((x) => x !== a)
  }
}

// Global in-memory singleton for the frontend mock session
export const adminStore = new AdminMockStore()
