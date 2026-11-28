import { Suspense } from "react"
import { products, productBySlug } from "@/lib/mock-data"
import { ProductDetailView } from "./product-detail-view"

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

async function ProductFromParams({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const initial = productBySlug(slug) || products.find((p) => p.id === slug) || null
  return <ProductDetailView slug={slug} initialProduct={initial} />
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <p className="font-heading text-2xl text-stone-400">Đang tải chi tiết vật phẩm...</p>
        </div>
      }
    >
      <ProductFromParams params={params} />
    </Suspense>
  )
}
