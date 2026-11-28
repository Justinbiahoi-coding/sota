import type { Metadata } from "next"
import { AirModelGallery } from "@/components/museum/air-space/model-gallery"
import "@/components/museum/natural-history-page.css"
import "@/components/museum/air-space/air-space.css"

export const metadata: Metadata = {
  title: "Phòng 3D — Hàng không & Vũ trụ",
  description: "Xoay và phóng to các bản quét Smithsonian và mô hình NASA, từ Wright Flyer và Bell X-1 đến Eagle, Discovery và James Webb.",
}

export default function Page() {
  return <AirModelGallery />
}
