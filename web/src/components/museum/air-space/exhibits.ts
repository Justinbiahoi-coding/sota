export const AIR_MUSEUM = "/bao-tang/hang-khong-vu-tru"
export const AIR_TOUR = "/tham-quan/hang-khong-vu-tru"
export const AIR_TICKETS = "/dat-ve?museum=hang-khong-vu-tru"
export const AIR_SHOP = "/cua-hang?museum=hang-khong-vu-tru"

export type AirExhibit = {
  id: string
  name: string
  category: string
  year: number
  description: string
  facts: { label: string; value: string }[]
  image: string
  imageAlt: string
  files: string[]
  viewingAngle: [number, number, number]
  credit: string
  source: string
  sketchfab?: string
  keywords?: string
  catalogTitles?: string[]
}

const folder = "/air-space/"

const originalExhibits: AirExhibit[] = [
  {
    id: "wright",
    sketchfab: "c91467735c6743af872e65107a79beda",
    keywords: "máy bay đầu tiên anh em Wright Kitty Hawk",
    name: "1903 Wright Flyer",
    category: "Hàng không",
    year: 1903,
    description: "Hai tầng cánh vải, một động cơ nhỏ và hai cánh quạt đẩy. Tại Kill Devil Hills, Orville Wright điều khiển Flyer bay 36 mét trong 12 giây, mở ra thời đại máy bay có động cơ và có thể điều khiển.",
    facts: [
      { label: "Chuyến bay đầu tiên", value: "17.12.1903" },
      { label: "Sải cánh", value: "12,3 m" },
    ],
    image: folder + "first-flight.webp",
    imageAlt: "Bức ảnh chuyến bay đầu tiên do John T. Daniels chụp năm 1903",
    files: ["wright-engine.glb", "wright-frame.glb", "wright-wings.glb"],
    viewingAngle: [-0.45, 0.62, 1.35],
    credit: "Bản quét Smithsonian Open Access · CC0",
    source: "https://www.si.edu/object/3d/1903-wright-flyer:d8c62e5e-4ebc-11ea-b77f-2e728ce88125",
  },
  {
    id: "saturn",
    name: "Saturn V",
    category: "Chương trình Apollo",
    year: 1967,
    description: "Ba tầng đẩy nối tiếp đưa các chuyến bay Apollo ra khỏi Trái Đất. Saturn V bay lần đầu trong nhiệm vụ Apollo 4 và đưa phi hành đoàn Apollo 11 lên đường tới Mặt Trăng hai năm sau.",
    facts: [
      { label: "Chuyến bay đầu tiên", value: "Apollo 4" },
      { label: "Số tầng đẩy", value: "3" },
    ],
    image: folder + "saturn-preview.webp",
    imageAlt: "Mô hình Saturn V với thân tên lửa sơn trắng và các dải đen",
    files: ["saturn.glb"],
    viewingAngle: [0.5, 0.35, 1.4],
    credit: "Mô hình NASA · Michael D. Carbajal",
    source: "https://science.nasa.gov/3d-resources/saturn-v/",
  },
  {
    id: "eagle",
    keywords: "Apollo 11 Neil Armstrong Buzz Aldrin hạ cánh tàu đổ bộ",
    name: "Mô-đun Mặt Trăng Eagle",
    category: "Chương trình Apollo",
    year: 1969,
    description: "Phần dưới của mô-đun Apollo có bốn chân đáp và ở lại trên Mặt Trăng. Phần trên đưa Neil Armstrong và Buzz Aldrin trở lại quỹ đạo để gặp Michael Collins trong khoang chỉ huy Columbia.",
    facts: [
      { label: "Nhiệm vụ", value: "Apollo 11" },
      { label: "Điểm hạ cánh", value: "Biển Tĩnh Lặng" },
    ],
    image: folder + "eagle-preview.webp",
    imageAlt: "Mô hình mô-đun đổ bộ Apollo với bốn chân đáp và lớp cách nhiệt màu vàng",
    files: ["eagle.glb"],
    viewingAngle: [1, 0.65, 1.25],
    credit: "Mô hình NASA · Michael D. Carbajal",
    source: "https://science.nasa.gov/3d-resources/apollo-lunar-module/",
  },
  {
    id: "shuttle",
    keywords: "tàu con thoi OV-103 Space Shuttle Hubble STS-31",
    catalogTitles: ["Space Shuttle Discovery (OV-103)", "Orbiter, Space Shuttle, OV-103, Discovery"],
    name: "Tàu con thoi Discovery",
    category: "Tàu vũ trụ",
    year: 1984,
    description: "Discovery mang kính Hubble lên quỹ đạo và nhiều lần ghé Trạm Vũ trụ Quốc tế. Các ô gạch đen trên bản quét là một phần của lớp bảo vệ nhiệt khi tàu trở về khí quyển.",
    facts: [
      { label: "Số hiệu", value: "OV-103" },
      { label: "Số nhiệm vụ", value: "39" },
      { label: "Thời gian trong không gian", value: "365 ngày" },
      { label: "Kiểu hạ cánh", value: "Đường băng" },
    ],
    image: folder + "discovery-preview.webp",
    imageAlt: "Bản quét tàu con thoi Discovery với thân trắng và cánh tam giác",
    files: ["discovery.glb"],
    viewingAngle: [1, 0.9, 1.4],
    credit: "Bản quét Smithsonian Open Access · CC0",
    source: "https://www.si.edu/object/3d/d8c636ce-4ebc-11ea-b77f-2e728ce88125",
  },
  {
    id: "hubble",
    name: "Kính thiên văn Hubble",
    category: "Thiên văn",
    year: 1990,
    description: "Discovery đưa Hubble lên quỹ đạo để quan sát vũ trụ từ phía trên bầu khí quyển. Hai cánh pin Mặt Trời cấp điện cho các thiết bị ghi nhận ánh sáng từ những thiên thể xa xôi.",
    facts: [
      { label: "Tàu triển khai", value: "Discovery · STS-31" },
      { label: "Đường kính gương", value: "2,4 m" },
    ],
    image: folder + "hubble-preview.webp",
    imageAlt: "Mô hình kính thiên văn Hubble với hai tấm pin mặt trời",
    files: ["hubble.glb"],
    viewingAngle: [0.85, 0.58, 1.3],
    credit: "Mô hình NASA · DigitalSpace Corporation",
    source: "https://science.nasa.gov/3d-resources/hubble-space-telescope-a/",
  },
]

const nasa = "https://science.nasa.gov/3d-resources/"

export const airCategories = ["Hàng không", "Tàu vũ trụ", "Chương trình Apollo", "Thăm dò hành tinh", "Thiên văn"] as const

export const airExhibits: AirExhibit[] = [...originalExhibits,
  {
    id: "bell-x1", name: "Bell X-1", year: 1947, category: "Hàng không",
    keywords: "Glamorous Glennis Chuck Yeager bay siêu âm vượt âm thanh",
    description: "Chiếc máy bay màu cam mang tên Glamorous Glennis đưa Chuck Yeager vượt tốc độ âm thanh trong chuyến bay ngày 14.10.1947. Bản quét lưu lại hình dáng thân thuôn và cặp cánh thẳng của chiếc máy bay thử nghiệm.",
    facts: [{ label: "Phi công", value: "Chuck Yeager" }, { label: "Tốc độ đạt được", value: "Mach 1,06" }, { label: "Sải cánh", value: "8,53 m" }, { label: "Số đăng ký", value: "A19510007000" }],
    image: folder + "bell-x1-preview.webp", imageAlt: "Bản quét chiếc Bell X-1 màu cam",
    files: ["bell-x1.glb"], viewingAngle: [1.25,.55,1.38],
    credit: "Bản quét Smithsonian Open Access · CC0", source: "https://www.si.edu/object/3d/bell-x-1:6c69a6bb-55e6-4356-8725-120ff7f8d652",
  },
  {
    id: "gemini", name: "Tàu Gemini", year: 1965, category: "Tàu vũ trụ",
    description: "Khoang Gemini chở hai phi hành gia. Chương trình giúp NASA tập đi bộ ngoài không gian và ghép nối tàu trên quỹ đạo trước các chuyến bay Apollo.",
    facts: [{ label: "Phi hành đoàn", value: "2 người" }, { label: "Chuyến bay có người đầu tiên", value: "Gemini III" }],
    image: folder + "gemini-preview.webp", imageAlt: "Mô hình khoang tàu Gemini",
    files: ["gemini.glb"], viewingAngle: [1, .5, 1.5], credit: "Mô hình NASA", source: nasa + "gemini/",
  },
  {
    id: "columbia", name: "Khoang chỉ huy Columbia", year: 1969, category: "Chương trình Apollo",
    keywords: "Apollo 11 command module Neil Armstrong Michael Collins Buzz Aldrin",
    catalogTitles: ["Apollo 11 Command Module Columbia", "Apollo 11 Command Module Exterior", "Command Module, Apollo 11"],
    description: "Columbia là nơi sinh hoạt và làm việc của phi hành đoàn Apollo 11 trong phần lớn hành trình. Đây là bộ phận duy nhất của tàu Apollo 11 trở về Trái Đất.",
    facts: [{ label: "Nhiệm vụ", value: "Apollo 11" }, { label: "Số hiệu", value: "CM-107" }],
    image: folder + "columbia-preview.webp", imageAlt: "Khoang chỉ huy Apollo 11 Columbia",
    files: ["columbia-shell.glb", "columbia-top.glb", "columbia-filler.glb"], viewingAngle: [-1, .52, 1.5],
    credit: "Bản quét Smithsonian Open Access · CC0", source: "https://www.si.edu/object/nasm_A19700102000",
    sketchfab: "372bb6781922471cada4e0a9bd5c61fb",
  },
  {
    id: "apollo-soyuz", name: "Apollo–Soyuz", year: 1975, category: "Tàu vũ trụ",
    description: "Một khoang nối chuyên dụng cho phép tàu Apollo của Hoa Kỳ và Soyuz của Liên Xô ghép nối trên quỹ đạo. Hai phi hành đoàn gặp nhau trong chuyến bay chung đầu tiên.",
    facts: [{ label: "Loại nhiệm vụ", value: "Ghép nối trên quỹ đạo" }, { label: "Năm", value: "1975" }],
    image: folder + "apollo-soyuz-preview.webp", imageAlt: "Mô hình Apollo và Soyuz với khoang ghép nối",
    files: ["apollo-soyuz.glb"], viewingAngle: [1.1,.75,1.35], credit: "Mô hình NASA · Michael D. Carbajal",
    source: nasa + "apollo-soyuz/",
  },
  {
    id: "voyager", name: "Tàu thăm dò Voyager", year: 1977, category: "Thăm dò hành tinh",
    description: "Hai tàu Voyager được phóng để khảo sát các hành tinh khổng lồ. Mỗi tàu mang một đĩa ghi âm về Trái Đất cùng ăng-ten hướng về hành tinh quê nhà.",
    facts: [{ label: "Tàu song sinh", value: "Voyager 1 và 2" }, { label: "Thiết bị liên lạc", value: "Ăng-ten parabol" }],
    image: folder + "voyager-preview.webp", imageAlt: "Mô hình tàu Voyager với ăng-ten parabol",
    files: ["voyager.glb"], viewingAngle: [1, .65, 1.25], credit: "Mô hình NASA · Michael D. Carbajal",
    source: nasa + "voyager-probe-b/",
  },
  {
    id: "perseverance", name: "Xe tự hành Perseverance", year: 2021, category: "Thăm dò hành tinh",
    keywords: "Sao Hỏa Mars rover Jezero",
    description: "Perseverance khảo sát miệng hố Jezero trên Sao Hỏa và thu thập mẫu đá. Sáu bánh xe và cánh tay robot giúp nó tiếp cận những vị trí cần nghiên cứu.",
    facts: [{ label: "Điểm hạ cánh", value: "Jezero" }, { label: "Nhiệm vụ", value: "Mars 2020" }],
    image: folder + "perseverance-preview.webp", imageAlt: "Mô hình xe tự hành Perseverance",
    files: ["perseverance.glb"], viewingAngle: [1,.65,1.25], credit: "Mô hình NASA · Jet Propulsion Laboratory",
    source: nasa + "mars-2020-perseverance-rover/",
  },
  {
    id: "webb", name: "Kính thiên văn James Webb", year: 2021, category: "Thiên văn",
    keywords: "JWST hồng ngoại thiên hà ngoại hành tinh",
    description: "Mười tám mảnh gương lục giác ghép thành gương chính phủ vàng. Tấm chắn nhiều lớp giúp các thiết bị duy trì nhiệt độ thấp để quan sát bức xạ hồng ngoại.",
    facts: [{ label: "Gương chính", value: "6,5 m" }, { label: "Vùng hoạt động", value: "Gần điểm L2" }],
    image: folder + "webb-preview.webp", imageAlt: "Mô hình kính James Webb với gương lục giác màu vàng",
    files: ["webb.glb"], viewingAngle: [1,.7,1.3], credit: "Mô hình NASA · Christopher R. Meaney",
    source: nasa + "james-webb-space-telescope-b/",
  },
].sort((a, b) => a.year - b.year) as AirExhibit[]
