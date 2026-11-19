import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { artifactById, formatPrice, productBySlug, products } from "@/lib/mock-data"
import { ProductAddToCart } from "@/components/shop/product-add-to-cart"

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = productBySlug(slug)
  if (!product) notFound()

  const inspiredBy = product.inspiredByArtifactId ? artifactById(product.inspiredByArtifactId) : null

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <Link
        href="/cua-hang"
        className="placard inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Cửa hàng
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden border border-border bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width:1024px) 100vw,50vw"
          />
        </div>

        {/* Details */}
        <div>
          <p className="placard text-muted-foreground">{product.category}</p>
          <h1 className="mt-3 font-heading text-3xl font-light leading-snug">{product.name}</h1>
          <p className="mt-5 font-heading text-3xl">{formatPrice(product.price)}</p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {inspiredBy && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="placard text-muted-foreground">Lấy cảm hứng từ</p>
              <Link
                href={`/hien-vat/${inspiredBy.slug}`}
                className="mt-1 block text-sm italic hover:text-museum"
              >
                {inspiredBy.title} — {inspiredBy.artist}
              </Link>
            </div>
          )}

          <ProductAddToCart product={product} />
        </div>
      </div>
    </div>
  )
}
