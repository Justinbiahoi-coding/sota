import { redirect } from "next/navigation"

export default async function MuseumStoreSubroute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/cua-hang?museum=${encodeURIComponent(slug)}`)
}

