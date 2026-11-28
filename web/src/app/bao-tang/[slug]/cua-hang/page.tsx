import { redirect } from "next/navigation"
import { Suspense } from "react"
import { museums } from "@/lib/mock-data"

export function generateStaticParams() {
  return museums.map(({ slug }) => ({ slug }))
}

async function StoreRedirect({ params }: { params: Promise<{ slug: string }> }): Promise<never> {
  const { slug } = await params
  redirect(`/cua-hang?museum=${encodeURIComponent(slug)}`)
}

export default function MuseumStoreSubroute({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense><StoreRedirect params={params} /></Suspense>
}

