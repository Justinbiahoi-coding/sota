import type { Metadata } from "next"
import { AirMuseumStory } from "@/components/museum/air-space/air-hero"
import "@/components/museum/air-space/air-space.css"

export const metadata: Metadata = {
  title: "Bảo tàng Hàng không & Vũ trụ",
  description: "Khám phá lịch sử bay qua phim tư liệu Apollo và phòng hiện vật 3D của Sota.",
}

export default function AirMuseumPage() {
  return <AirMuseumStory />
}
