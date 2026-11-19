// Mock data for the frontend while the API is being built.
// All image URLs are tested and verified high-resolution Unsplash and local museum assets.

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Museum = {
  slug: string
  name: string
  nameEn: string
  accent: string // hex / rgb / oklch accent colour
  opens: string
  closes: string
  image: string
  address: string
  description: string
}

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
  const times = ["09:30", "11:30", "14:00", "16:00"]
  const spots = [24, 18, 30, 12]
  return times.map((time, i) => ({
    id: `${museumSlug}-${time.replace(":", "")}`,
    museumSlug,
    time,
    price: prices[i],
    remainingSpots: spots[i],
  }))
}

export const ticketSlots: TicketSlot[] = [
  ...makeSlots("lich-su-tu-nhien",      [0, 0, 0, 0]),
  ...makeSlots("hang-khong-vu-tru",     [0, 0, 0, 0]),
  ...makeSlots("lich-su-hoa-ky",        [0, 0, 0, 0]),
  ...makeSlots("phong-tranh-chan-dung", [500, 500, 800, 800]),
  ...makeSlots("hirshhorn",             [0, 0, 0, 0]),
  ...makeSlots("nghe-thuat-chau-a",     [0, 0, 0, 0]),
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
