import { Suspense } from "react"
import {
  artifactsByMuseum,
  exhibitionsByMuseum,
  museumBySlug,
  productsByMuseum,
} from "@/lib/mock-data"
import { MuseumDetailView } from "./museum-detail-view"

export function generateStaticParams() {
  return [
    { slug: "lich-su-tu-nhien" },
    { slug: "hang-khong-vu-tru" },
    { slug: "lich-su-hoa-ky" },
    { slug: "phong-tranh-chan-dung" },
    { slug: "hirshhorn" },
    { slug: "nghe-thuat-chau-a" },
  ]
}

export default async function MuseumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const initialMuseum = museumBySlug(slug) || null
  const initialExhibitions = exhibitionsByMuseum(slug) || []
  const initialArtifacts = artifactsByMuseum(slug) || []
  const initialProducts = productsByMuseum(slug) || []

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <p className="font-heading text-2xl text-stone-400">Đang tải không gian bảo tàng...</p>
        </div>
      }
    >
      <MuseumDetailView
        slug={slug}
        initialMuseum={initialMuseum}
        initialArtifacts={initialArtifacts}
        initialExhibitions={initialExhibitions}
        initialProducts={initialProducts}
      />
    </Suspense>
  )
}
