import { notFound } from "next/navigation"
import { artifacts, artifactById, artifactBySlug, artifactsByMuseum } from "@/lib/mock-data"
import { VitrineStageView } from "@/components/museum/vitrine-stage-view"

export function generateStaticParams() {
  return artifacts.flatMap((a) => [{ slug: a.slug }, { slug: a.id }])
}

export default async function ArtifactDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = artifactBySlug(slug) || artifactById(slug)
  if (!art) notFound()

  // Put current artifact first, followed by others from the same museum, then the rest
  const museumArts = artifactsByMuseum(art.museumSlug)
  const otherArts = artifacts.filter((a) => a.id !== art.id && a.museumSlug !== art.museumSlug)
  const orderedArts = [art, ...museumArts.filter((a) => a.id !== art.id), ...otherArts]

  return (
    <div className="w-full bg-[#0c0906] h-[calc(100vh-4rem)] overflow-hidden">
      {/* 100% Full-Screen Vitrine Stage (Ảnh 1) with direct integrated back navigation */}
      <VitrineStageView
        artifacts={orderedArts}
        initialSlug={art.slug}
        backHref="/hien-vat"
      />
    </div>
  )
}
